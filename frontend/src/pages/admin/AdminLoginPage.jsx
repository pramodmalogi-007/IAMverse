// frontend/src/pages/admin/AdminLoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, verifyOtp } from "../../api/adminAuthApi";
import logo from "../../assets/logo.png";
import "../../styles/admin-dashboard.css";

function AdminLoginPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginAdmin({ email, password });
      if (res.data.requiresOtp) {
        setStep(2);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await verifyOtp({ email, otp });
      const { token, admin } = res.data;

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminId", admin.adminId);
      localStorage.setItem("adminName", admin.name);
      localStorage.setItem("adminEmail", admin.email);
      localStorage.setItem("adminRole", admin.role || "admin");

      navigate("/admin159357");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      {step === 1 ? (
        <form className="login-card" onSubmit={handleLoginSubmit}>
          <div className="login-header">
            <img src={logo} alt="IAMverse" className="login-logo" />
            <div className="login-title">IAMverse Admin</div>
            <div className="login-subtitle">
              Sign in to access the control center and manage IAM configurations.
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              placeholder="admin@iamverse.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label>Secret Password</label>
            <input
              type="password"
              value={password}
              placeholder="••••••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Verifying Credentials..." : "Authenticate"}
          </button>
        </form>
      ) : (
        <form className="login-card" onSubmit={handleOtpSubmit}>
          <div className="login-header">
            <img src={logo} alt="IAMverse" className="login-logo" />
            <div className="login-title">Verification Code</div>
            <div className="login-subtitle">
              Enter the one-time code sent to your email to continue.
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="login-field">
            <label>OTP Code</label>
            <input
              type="text"
              value={otp}
              placeholder="e.g. 1A2B3C"
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{ letterSpacing: '2px', fontSize: '18px', textAlign: 'center' }}
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
          
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
             <button 
               type="button" 
               onClick={() => { setStep(1); setOtp(""); setError(""); }} 
               className="btn btn-ghost btn-sm"
             >
               &larr; Back to login
             </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminLoginPage;