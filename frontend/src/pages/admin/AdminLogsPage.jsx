// frontend/src/pages/admin/AdminLogsPage.jsx
import { useEffect, useState } from "react";
import { getLogs } from "../../api/adminLogsApi";
import { getRegularUsers, getUserAssessments } from "../../api/adminAuthApi";
import "../../styles/admin-dashboard.css";

function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState("logs"); // "logs" or "users"
  
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAssessments, setUserAssessments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setError("");
      try {
        const [logsRes, usersRes] = await Promise.all([
          getLogs(),
          getRegularUsers(),
        ]);
        setLogs(logsRes.data.logs || []);
        setUsers(usersRes.data.users || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load data."
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try {
      const res = await getUserAssessments(user.uid);
      setUserAssessments(res.data.assessments || []);
    } catch (err) {
      setError("Failed to fetch user assessments");
      setUserAssessments([]);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      (log.actor && log.actor.toLowerCase().includes(query)) ||
      (log.action && log.action.toLowerCase().includes(query)) ||
      (log.target && log.target.toLowerCase().includes(query))
    );
  });

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <p style={{ color: "#a1a1aa" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <h1>Activity Logs & User History</h1>
        <p>Track administrator actions and view user assessment histories.</p>
      </div>

      {error && <p className="adm-auth-error">{error}</p>}

      <div className="adm-tabs">
        <button
          className={`adm-tab-btn ${activeTab === "logs" ? "adm-tab-btn--active" : ""}`}
          onClick={() => {
            setActiveTab("logs");
            setSearchQuery("");
            setSelectedUser(null);
          }}
        >
          System Logs
        </button>
        <button
          className={`adm-tab-btn ${activeTab === "users" ? "adm-tab-btn--active" : ""}`}
          onClick={() => {
            setActiveTab("users");
            setSearchQuery("");
          }}
        >
          User Activity
        </button>
      </div>

      <div className="adm-panel">
        <div className="adm-toolbar">
          <input
            type="text"
            className="adm-search-input"
            placeholder={activeTab === "logs" ? "Search logs..." : "Search users..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === "logs" ? (
          filteredLogs.length === 0 ? (
            <p className="adm-empty">No matching log entries found.</p>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Target</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const action = (log.action || '').toLowerCase();
                  const actionClass = action.includes('delete') ? 'delete'
                    : action.includes('add') || action.includes('create') ? 'add'
                    : action.includes('update') || action.includes('edit') ? 'update'
                    : '';
                  return (
                    <tr key={log._id || log.id}>
                      <td>
                        <span className="adm-cell-main">{new Date(log.createdAt).toLocaleDateString()}</span>
                        <span className="adm-cell-sub">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </td>
                      <td>
                        <span className={`adm-log-action ${actionClass}`}>{log.action}</span>
                      </td>
                      <td>
                        <span className="adm-log-target">{log.target}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          <div className="adm-split">
            {/* User List */}
            <div className="adm-user-list">
              <div className="adm-user-list-title">Registered Users</div>
              {filteredUsers.length === 0 ? (
                <p className="adm-empty">No users found.</p>
              ) : filteredUsers.map((user) => (
                <div
                  key={user.uid}
                  className={`adm-user-item ${selectedUser?.uid === user.uid ? 'selected' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="adm-user-item-name">{user.fullName}</div>
                  <div className="adm-user-item-email">{user.email}</div>
                </div>
              ))}
            </div>

            {/* Assessment History */}
            <div className="adm-activity-panel">
              {selectedUser ? (
                <div>
                  <div className="adm-activity-stats">
                    <div className="adm-activity-stat-card">
                      <div className="adm-activity-stat-label">Assessments Taken</div>
                      <div className="adm-activity-stat-value">{userAssessments.length}</div>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Assessment History</h4>
                  {userAssessments.length === 0 ? (
                    <p className="adm-empty">This user has not taken any assessments.</p>
                  ) : (
                    userAssessments.map((a) => (
                      <div key={a.id} className="adm-assessment-card">
                        <span className="adm-assessment-date">Taken on {new Date(a.createdAt).toLocaleString()}</span>
                        <span className="adm-assessment-badge">Completed</span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="adm-select-prompt">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </svg>
                  Select a user to view their assessment history
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLogsPage;