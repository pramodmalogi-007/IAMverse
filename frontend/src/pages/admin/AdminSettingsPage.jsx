// frontend/src/pages/admin/AdminSettingsPage.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateSettings } from "../../api/adminAuthApi";

function AdminSettingsPage() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const currentEmail = localStorage.getItem("adminEmail");
    if (currentEmail) {
      setEmail(currentEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {};
      const currentEmail = localStorage.getItem("adminEmail");
      
      if (email !== currentEmail) {
        payload.email = email;
      }
      
      if (newPassword) {
        if (!currentPassword) {
          toast.error("Please provide your current password to set a new one.");
          setSaving(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      if (Object.keys(payload).length === 0) {
        toast("No changes to save.");
        setSaving(false);
        return;
      }

      await updateSettings(payload);
      toast.success("Settings updated successfully!");
      
      if (payload.email) {
        localStorage.setItem("adminEmail", payload.email);
      }
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: "600px" }}>
      <div className="panel-head">
        <div className="panel-title">Admin Account Settings</div>
        <div className="panel-desc">Update your admin email and password.</div>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        <div className="field">
          <label>Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
        
        <div className="panel-desc" style={{ marginBottom: "-8px" }}>Leave blank if you do not wish to change your password.</div>
        
        <div className="field">
          <label>Current Password</label>
          <input 
            type="password" 
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Required only if changing password"
          />
        </div>

        <div className="field">
          <label>New Password</label>
          <input 
            type="password" 
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number"
          />
        </div>

        <div style={{ marginTop: "8px" }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminSettingsPage;