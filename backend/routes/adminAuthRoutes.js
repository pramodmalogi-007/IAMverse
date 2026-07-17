// backend/routes/adminAuthRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { findOne, findAll, insertOne, updateOne, count } = require("../utils/fileStore");
const { adminAuthMiddleware } = require("../middleware/adminAuth");
const { getAdminLogs } = require("../controllers/logController");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

const SALT_ROUNDS = 12;

// Fail loudly if JWT_SECRET is missing — never fall back to a known string
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables. Refusing to start.");
}
const JWT_SECRET = process.env.JWT_SECRET;

// One-time setup key for creating the very first admin account.
// Set ADMIN_SETUP_KEY in .env — share it only with the person bootstrapping the system.
const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY;

const ADMINS_FILE = "admins.json";
const USERS_FILE = "users.json";
const REQUESTS_FILE = "accessRequests.json";
const LOGS_FILE = "activityLogs.json";

function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

// Verifies a valid JWT AND that the token belongs to an admin role
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Basic per-IP login attempt tracking for admin login brute-force protection
const loginAttempts = new Map(); // ip -> { count, firstAttempt }

function isLoginRateLimited(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;
  const windowMs = 15 * 60 * 1000;
  if (Date.now() - entry.firstAttempt > windowMs) {
    loginAttempts.delete(ip);
    return false;
  }
  return entry.count >= 5;
}

function recordLoginAttempt(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry) {
    loginAttempts.set(ip, { count: 1, firstAttempt: Date.now() });
  } else {
    entry.count++;
  }
}

function clearLoginAttempts(ip) {
  loginAttempts.delete(ip);
}

// ===== ADMIN REGISTER =====
// Only allowed when:
//   (a) no admins exist yet AND a valid ADMIN_SETUP_KEY is provided (bootstrap), OR
//   (b) the requester is already an authenticated admin (adding a colleague)
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, setupKey } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "Name, email, password required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
      });
    }

    const adminCount = count(ADMINS_FILE);

    if (adminCount === 0) {
      // Bootstrap mode — first admin ever, requires setup key
      if (!ADMIN_SETUP_KEY) {
        return res.status(503).json({
          success: false,
          message: "Admin bootstrap is not configured on this server",
        });
      }
      if (!setupKey || setupKey !== ADMIN_SETUP_KEY) {
        return res.status(403).json({ success: false, message: "Invalid setup key" });
      }
    } else {
      // Admins already exist — only an authenticated admin can create more
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (!token) {
        return res.status(401).json({ success: false, message: "Admin authentication required" });
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") {
          return res.status(403).json({ success: false, message: "Admin access required" });
        }
      } catch {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = findOne(ADMINS_FILE, (a) => a.email === normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: "Admin with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const now = new Date().toISOString();
    const admin = {
      id: uuidv4(),
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role: "admin",
      createdAt: now,
      updatedAt: now,
    };

    insertOne(ADMINS_FILE, admin);

    return res.status(201).json({
      success: true,
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
  } catch (err) {
    console.error("Admin register error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===== ADMIN LOGIN =====
router.post("/login", async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || "unknown";

    if (isLoginRateLimited(ip)) {
      return res.status(429).json({
        success: false,
        message: "Too many login attempts. Please try again later.",
      });
    }

    const { email, password } = req.body;

    const admin = findOne(ADMINS_FILE, (a) => a.email === email?.toLowerCase().trim());
    if (!admin) {
      recordLoginAttempt(ip);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      recordLoginAttempt(ip);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    clearLoginAttempts(ip);

    const token = jwt.sign(
      { adminId: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    updateOne(ADMINS_FILE, (a) => a.id === admin.id, () => ({
      loginOtp: otp,
      loginOtpExpiry: expiry,
      otpAttempts: 0
    }));

    try {
      await sendEmail({
        to: admin.email,
        subject: "Admin Login Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #111827;">
            <h2 style="margin-bottom: 12px;">Admin Login Code</h2>
            <p style="margin-bottom: 16px;">Use this one-time code to log into the admin panel:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f3f4f6; padding: 16px 24px; border-radius: 8px; display: inline-block;">
              ${otp}
            </div>
            <p style="margin-top: 18px;">This code will expire in 10 minutes.</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("ADMIN OTP EMAIL SEND FAILED:", emailErr.message);
    }

    return res.json({
      success: true,
      requiresOtp: true,
      message: "OTP sent to registered email",
    });
  } catch (err) {
    console.error("Admin login error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===== ADMIN VERIFY OTP =====
router.post("/login/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const admin = findOne(ADMINS_FILE, (a) => a.email === email?.toLowerCase().trim());
    if (!admin || !admin.loginOtp || !admin.loginOtpExpiry) {
      return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
    }

    const attempts = (admin.otpAttempts || 0) + 1;
    if (attempts > 5) {
      updateOne(ADMINS_FILE, (a) => a.id === admin.id, () => ({ loginOtp: null, loginOtpExpiry: null, otpAttempts: 0 }));
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please login again." });
    }

    if (admin.loginOtp !== otp.trim()) {
      updateOne(ADMINS_FILE, (a) => a.id === admin.id, () => ({ otpAttempts: attempts }));
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date(admin.loginOtpExpiry) < new Date()) {
      return res.status(401).json({ success: false, message: "OTP has expired" });
    }

    updateOne(ADMINS_FILE, (a) => a.id === admin.id, () => ({ loginOtp: null, loginOtpExpiry: null, otpAttempts: 0 }));

    const token = jwt.sign(
      { adminId: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    return res.json({
      success: true,
      token,
      admin: { adminId: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (err) {
    console.error("Admin OTP verify error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===== ADMIN SETTINGS =====
router.put("/settings", adminAuthMiddleware, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const admin = findOne(ADMINS_FILE, (a) => a.id === req.admin.adminId);
    
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    
    const updates = {};
    
    if (email && email.toLowerCase().trim() !== admin.email) {
      const existing = findOne(ADMINS_FILE, (a) => a.email === email.toLowerCase().trim());
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }
      updates.email = email.toLowerCase().trim();
    }
    
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password required to set a new password" });
      }
      const ok = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!ok) {
        return res.status(401).json({ success: false, message: "Incorrect current password" });
      }
      if (!isStrongPassword(newPassword)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
        });
      }
      updates.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }
    
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      updateOne(ADMINS_FILE, (a) => a.id === admin.id, () => updates);
    }
    
    return res.json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    console.error("Admin settings error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===== LIST ADMINS ===== (now correctly requires admin role, not just any valid token)
router.get("/list", authMiddleware, (req, res) => {
  try {
    const admins = findAll(ADMINS_FILE)
      .map(({ id, name, email, role, createdAt }) => ({ id, name, email, role, createdAt }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, admins });
  } catch (err) {
    console.error("Admin list error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===== LOGS =====
router.get("/logs", adminAuthMiddleware, getAdminLogs);

// ===== USER ASSESSMENTS =====
// Endpoints for viewing user assessment results and generated recommendations
router.get("/users/:uid/assessments", adminAuthMiddleware, (req, res) => {
  try {
    const assessments = findAll("assessments.json")
      .filter((a) => a.userId === req.params.uid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, assessments });
  } catch (err) {
    console.error("User assessments error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===== QUESTIONNAIRE MANAGEMENT =====
// Endpoints for managing the assessment questions (listing, adding, editing, deleting)
router.get("/questions", adminAuthMiddleware, (req, res) => {
  try {
    const questions = findAll("questionnaire.json");
    return res.json({ success: true, questions });
  } catch (err) {
    console.error("Get questions error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/questions", adminAuthMiddleware, (req, res) => {
  try {
    const { section, sectionTitle, text, type, options } = req.body;
    
    // Auto-generate id and number
    const questions = findAll("questionnaire.json");
    const number = questions.length + 1;
    const id = `q${number}`;

    const newQuestion = {
      section: parseInt(section) || 1,
      sectionTitle: sectionTitle || "New Section",
      id,
      number,
      text: text || "",
      type: type || "text",
      options: options || []
    };

    insertOne("questionnaire.json", newQuestion);

    // Log the action
    insertOne(LOGS_FILE, {
      id: uuidv4(),
      actor: req.admin?.adminId || "System",
      actorId: req.admin?.adminId || null,
      action: "Added new questionnaire question",
      target: id,
      ip: req.ip || "",
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ success: true, question: newQuestion });
  } catch (err) {
    console.error("Add question error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/questions/:id", adminAuthMiddleware, (req, res) => {
  try {
    const { updateOne } = require("../utils/fileStore");
    const questionId = req.params.id;
    const { options } = req.body;
    
    const updated = updateOne("questionnaire.json", (q) => q.id === questionId, (q) => ({
      options: options || q.options
    }));

    if (updated > 0) {
      // Log the action
      insertOne(LOGS_FILE, {
        id: uuidv4(),
        actor: req.admin?.adminId || "System",
        actorId: req.admin?.adminId || null,
        action: "Updated questionnaire question options",
        target: questionId,
        ip: req.ip || "",
        createdAt: new Date().toISOString(),
      });
      return res.json({ success: true, message: "Question updated successfully" });
    }
    
    return res.status(404).json({ success: false, message: "Question not found" });
  } catch (err) {
    console.error("Update question error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/questions/:id", adminAuthMiddleware, (req, res) => {
  try {
    const { deleteMany } = require("../utils/fileStore");
    const questionId = req.params.id;
    
    const deleted = deleteMany("questionnaire.json", (q) => q.id === questionId);
    
    if (deleted > 0) {
      // Log the action
      insertOne(LOGS_FILE, {
        id: uuidv4(),
        actor: req.admin?.adminId || "System",
        actorId: req.admin?.adminId || null,
        action: "Deleted questionnaire question",
        target: questionId,
        ip: req.ip || "",
        createdAt: new Date().toISOString(),
      });
      return res.json({ success: true, message: "Question deleted successfully" });
    } else {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
  } catch (err) {
    console.error("Delete question error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===== STATS =====
router.get("/stats", adminAuthMiddleware, (req, res) => {
  try {
    const totalUsers = count(USERS_FILE);
    const totalAdmins = count(ADMINS_FILE);
    const totalRequests = count(REQUESTS_FILE);
    const pendingRequests = count(REQUESTS_FILE, (r) => r.status === "pending");
    const approvedRequests = count(REQUESTS_FILE, (r) => r.status === "approved");
    const deniedRequests = count(REQUESTS_FILE, (r) => r.status === "denied");
    const totalLogs = count(LOGS_FILE);

    return res.json({
      success: true,
      totalUsers,
      totalAdmins,
      totalLogs,
      totalAssessments: count("assessments.json"),
    });
  } catch (err) {
    console.error("Stats fetch error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===== USERS LIST =====
router.get("/users", adminAuthMiddleware, (req, res) => {
  try {
    const users = findAll(USERS_FILE)
      .map(({ uid, fullName, email, role, isActive, lastLogin, loginCount, createdAt }) => ({
        uid, fullName, email, role, isActive, lastLogin, loginCount, createdAt,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, users });
  } catch (err) {
    console.error("Users list error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===== TOGGLE USER ACTIVE =====
router.put("/users/:uid/toggle", adminAuthMiddleware, (req, res) => {
  try {
    const user = findOne(USERS_FILE, (u) => u.uid === req.params.uid);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const newActive = !user.isActive;
    updateOne(USERS_FILE, (u) => u.uid === req.params.uid, () => ({ isActive: newActive }));
    
    const { v4: uuidv4 } = require('uuid');
    insertOne(LOGS_FILE, {
      id: uuidv4(),
      actor: req.admin?.email || "Admin",
      actorId: req.admin?.adminId || null,
      action: newActive ? "Activated user account" : "Deactivated user account",
      target: user.email,
      ip: ip,
      createdAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: `User status changed to ${newActive}`, user: { ...user, isActive: newActive } });
  } catch (err) {
    console.error("Toggle user error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ===== DELETE USER =====
router.delete("/users/:uid", adminAuthMiddleware, (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const user = findOne(USERS_FILE, (u) => u.uid === req.params.uid);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Actually delete the user from USERS_FILE
    let users = findAll(USERS_FILE);
    users = users.filter((u) => u.uid !== req.params.uid);
    require("fs").writeFileSync(require("path").join(__dirname, "../data", USERS_FILE), JSON.stringify(users, null, 2), "utf8");

    const { v4: uuidv4 } = require('uuid');
    insertOne(LOGS_FILE, {
      id: uuidv4(),
      actor: req.admin?.email || "Admin",
      actorId: req.admin?.adminId || null,
      action: "Deleted user account",
      target: user.email,
      ip: ip,
      createdAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;