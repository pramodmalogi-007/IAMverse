// frontend/src/pages/admin/AdminUsersPage.jsx
import { useEffect, useState } from "react";
import { getAdmins, getRegularUsers, toggleUserStatus, deleteUser } from "../../api/adminAuthApi";
import "../../styles/admin-dashboard.css";

function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState("users"); // "users" or "admins"
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null); // tracking individual toggle active status action
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [adminsRes, usersRes] = await Promise.all([
        getAdmins(),
        getRegularUsers(),
      ]);
      setAdmins(adminsRes.data.admins || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load accounts. Try reloading."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (userId) => {
    setActioningId(userId);
    setError("");
    try {
      const res = await toggleUserStatus(userId);
      // update user locally
      setUsers((prev) =>
        prev.map((u) => (u.uid === userId ? { ...u, isActive: res.data.user.isActive } : u))
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update user account status."
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to completely delete this user? This cannot be undone.")) return;
    
    setActioningId(userId);
    setError("");
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.uid !== userId));
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete user account."
      );
    } finally {
      setActioningId(null);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredAdmins = admins.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      (a.name && a.name.toLowerCase().includes(q)) ||
      (a.email && a.email.toLowerCase().includes(q))
    );
  });

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <p style={{ color: "#a1a1aa" }}>Loading account records...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <h1>Identities & Accounts</h1>
        <p>Manage administrative roles and user access credentials.</p>
      </div>

      {error && <p className="adm-auth-error">{error}</p>}

      <div className="adm-tabs">
        <button
          className={`adm-tab-btn ${activeTab === "users" ? "adm-tab-btn--active" : ""}`}
          onClick={() => {
            setActiveTab("users");
            setSearchQuery("");
          }}
        >
          Regular Users ({users.length})
        </button>
        <button
          className={`adm-tab-btn ${activeTab === "admins" ? "adm-tab-btn--active" : ""}`}
          onClick={() => {
            setActiveTab("admins");
            setSearchQuery("");
          }}
        >
          Admin Accounts ({admins.length})
        </button>
      </div>

      <div className="adm-panel">
        <div className="adm-toolbar">
          <input
            type="text"
            className="adm-search-input"
            placeholder={
              activeTab === "users"
                ? "Search users by name or email..."
                : "Search admins by name or email..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === "users" ? (
          filteredUsers.length === 0 ? (
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                padding: "2rem 0",
                textAlign: "center",
              }}
            >
              No user accounts found.
            </p>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact Email</th>
                  <th>System Role</th>
                  <th>Status</th>
                  <th>Last Session</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.uid}>
                    <td>
                      <div className="adm-table-avatar-cell">
                        <div className="adm-table-avatar">
                          {getInitials(user.fullName || "User")}
                        </div>
                        <div>
                          <span className="adm-cell-main">{user.fullName}</span>
                          <span className="adm-cell-sub">
                            Registered {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="adm-cell-main">{user.email}</span>
                    </td>
                    <td>
                      <span className={`adm-status ${user.role === 'admin' ? 'adm-status--admin' : 'adm-status--member'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`adm-status ${user.isActive ? "adm-status--active" : "adm-status--inactive"}`}
                      >
                        {user.isActive ? "active" : "disabled"}
                      </span>
                    </td>
                    <td>
                      <span className="adm-cell-sub">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : "Never"}
                      </span>
                    </td>
                    <td>
                      <div className="adm-action-row">
                        <button
                          onClick={() => handleToggleStatus(user.uid)}
                          className={user.isActive ? 'adm-btn-deactivate' : 'adm-btn-activate'}
                          disabled={actioningId === user.uid}
                        >
                          {actioningId === user.uid ? 'Loading...' : user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.uid)}
                          className="adm-btn-delete"
                          disabled={actioningId === user.uid}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Administrator Name</th>
                <th>Access Email</th>
                <th>System Role</th>
                <th>Created Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    <div className="adm-table-avatar-cell">
                      <div className="adm-table-avatar adm-table-avatar--admin">
                        {getInitials(admin.name || "Admin")}
                      </div>
                      <div>
                        <span className="adm-cell-main">{admin.name}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="adm-cell-main">{admin.email}</span>
                  </td>
                  <td>
                    <span className="adm-status adm-status--admin">
                      {admin.role}
                    </span>
                  </td>
                  <td>
                    <span className="adm-cell-sub">
                      {new Date(admin.createdAt).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminUsersPage;
