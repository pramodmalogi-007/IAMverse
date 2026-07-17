// frontend/src/components/admin/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../styles/admin-dashboard.css";

function AdminLayout() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName") || "Admin User";
  const adminRole = localStorage.getItem("adminRole") || "Administrator";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");

    
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
    navigate("/admin/login");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div >
      <Outlet />
    </div>
  );
}

export default AdminLayout;