/**
 * ============================================================
 *  IAMverse — Emergency Admin Reset Script
 *  Usage: node reset-admin.js
 * 
 *  Use this when:
 *   - Admin forgot their password
 *   - Admin email is locked / inaccessible
 *   - After a DDoS / security incident to rotate credentials
 * ============================================================
 */

require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const readline = require("readline");
const crypto   = require("crypto");

// ── Inline Admin model (no import needed) ───────────────────
const adminSchema = new mongoose.Schema(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name:         { type: String, required: true },
    role:         { type: String, default: "admin" },
  },
  { timestamps: true }
);
const Admin = mongoose.model("Admin", adminSchema);

// ── Prompt helper ────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

// ── Generate a random strong password ────────────────────────
function generatePassword(length = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!";
  return Array.from(crypto.randomBytes(length))
    .map((b) => chars[b % chars.length])
    .join("");
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║     IAMverse — Emergency Admin Reset Tool        ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // ── Step 1: Safety key check ─────────────────────────────
  const setupKey = await ask("🔑 Enter ADMIN_SETUP_KEY from .env to proceed: ");
  if (setupKey.trim() !== process.env.ADMIN_SETUP_KEY) {
    console.error("\n❌ Wrong setup key. Access denied.\n");
    rl.close();
    process.exit(1);
  }
  console.log("✅ Key verified.\n");

  // ── Step 2: Connect to MongoDB ───────────────────────────
  const MONGO_URI =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    "mongodb://localhost:27017/iamverse";

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected to database: ${MONGO_URI.replace(/:\/\/.*@/, "://***@")}\n`);
  } catch (err) {
    console.error("❌ Could not connect to database:", err.message);
    rl.close();
    process.exit(1);
  }

  // ── Step 3: List all admins ──────────────────────────────
  const admins = await Admin.find({}, "name email role createdAt");
  if (admins.length === 0) {
    console.log("⚠️  No admin accounts found in the database.");
    console.log("   Creating a fresh Super Admin account...\n");
    await createNewAdmin();
    return finish();
  }

  console.log("📋 Existing admin accounts:");
  admins.forEach((a, i) => {
    console.log(`   [${i + 1}] ${a.name} | ${a.email} | ${a.role} | Created: ${a.createdAt.toLocaleDateString()}`);
  });

  // ── Step 4: Choose action ────────────────────────────────
  console.log("\n🛠  What do you want to do?");
  console.log("   [1] Reset password of an existing admin");
  console.log("   [2] Change email of an existing admin");
  console.log("   [3] Delete an admin account");
  console.log("   [4] Create a brand-new admin account");
  console.log("   [5] List all admins (already shown above)");
  console.log("   [6] Exit\n");

  const choice = await ask("Enter choice [1-6]: ");

  switch (choice.trim()) {
    case "1": await resetPassword(admins); break;
    case "2": await changeEmail(admins);   break;
    case "3": await deleteAdmin(admins);   break;
    case "4": await createNewAdmin();      break;
    case "5": break; // already listed
    case "6": break;
    default:
      console.log("⚠️  Invalid choice.");
  }

  finish();
}

// ── Reset Password ────────────────────────────────────────────
async function resetPassword(admins) {
  const idx = await ask("\nEnter the number of the admin to reset password for: ");
  const admin = admins[parseInt(idx) - 1];
  if (!admin) return console.log("❌ Invalid selection.");

  const useGenerated = await ask(`\nGenerate a strong random password? (y/n) [y]: `);
  let newPass;

  if (useGenerated.trim().toLowerCase() !== "n") {
    newPass = generatePassword(18);
    console.log(`\n🔐 Generated password: ${newPass}`);
    console.log("   ⚠️  COPY THIS NOW — it will not be shown again!\n");
  } else {
    newPass = await ask("Enter new password (min 8 chars): ");
    if (newPass.length < 8) return console.log("❌ Password too short.");
  }

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(newPass, salt);
  await Admin.updateOne({ _id: admin._id }, { passwordHash: hash });
  console.log(`\n✅ Password reset successfully for: ${admin.email}`);
}

// ── Change Email ──────────────────────────────────────────────
async function changeEmail(admins) {
  const idx = await ask("\nEnter the number of the admin to update email for: ");
  const admin = admins[parseInt(idx) - 1];
  if (!admin) return console.log("❌ Invalid selection.");

  const newEmail = await ask(`Enter new email address for ${admin.name}: `);
  if (!newEmail.includes("@")) return console.log("❌ Invalid email.");

  await Admin.updateOne({ _id: admin._id }, { email: newEmail.trim().toLowerCase() });
  console.log(`\n✅ Email updated: ${admin.email} → ${newEmail.trim().toLowerCase()}`);
}

// ── Delete Admin ──────────────────────────────────────────────
async function deleteAdmin(admins) {
  const idx = await ask("\nEnter the number of the admin to DELETE: ");
  const admin = admins[parseInt(idx) - 1];
  if (!admin) return console.log("❌ Invalid selection.");

  const confirm = await ask(`⚠️  Type DELETE to confirm removing ${admin.name} (${admin.email}): `);
  if (confirm.trim() !== "DELETE") return console.log("❌ Cancelled.");

  await Admin.deleteOne({ _id: admin._id });
  console.log(`\n✅ Admin account deleted: ${admin.email}`);
}

// ── Create New Admin ──────────────────────────────────────────
async function createNewAdmin() {
  const name  = await ask("New admin full name: ");
  const email = await ask("New admin email:     ");

  const useGenerated = await ask("Generate a strong random password? (y/n) [y]: ");
  let password;
  if (useGenerated.trim().toLowerCase() !== "n") {
    password = generatePassword(18);
    console.log(`\n🔐 Generated password: ${password}`);
    console.log("   ⚠️  COPY THIS NOW — it will not be shown again!\n");
  } else {
    password = await ask("Enter password (min 8 chars): ");
    if (password.length < 8) return console.log("❌ Password too short.");
  }

  const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
  if (existing) return console.log("❌ An admin with this email already exists.");

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  const newAdmin = await Admin.create({
    name:         name.trim(),
    email:        email.trim().toLowerCase(),
    passwordHash: hash,
    role:         "admin",
  });

  console.log(`\n✅ New admin created successfully!`);
  console.log(`   Name:  ${newAdmin.name}`);
  console.log(`   Email: ${newAdmin.email}`);
}

function finish() {
  console.log("\n══════════════════════════════════════════════════");
  console.log("  Done. Close this terminal to secure the session.");
  console.log("══════════════════════════════════════════════════\n");
  rl.close();
  mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  rl.close();
  mongoose.connection.close();
  process.exit(1);
});
