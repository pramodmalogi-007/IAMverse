// frontend/src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/admin/AdminLayout";

// Auth guard
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminProtectedRoute from "../components/auth/AdminProtectedRoute";

// User pages
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import AssessmentPage from "../pages/AssessmentPage";
import RecommendationsPage from "../pages/RecommendationsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import DashboardPage from "../pages/DashboardPage";

// Legal pages
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/TermsOfServicePage";
import SecurityPage from "../pages/SecurityPage";

// Admin auth pages (public)
import AdminLoginPage from "../pages/admin/AdminLoginPage";

// Admin pages (protected)
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminLogsPage from "../pages/admin/AdminLogsPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Public user area with main layout */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="terms-of-service" element={<TermsOfServicePage />} />
        <Route path="security" element={<SecurityPage />} />
      </Route>

      {/* Public admin auth routes */}
      <Route path="admin159357/login" element={<AdminLoginPage />} />

      {/* Assessment — publicly accessible; submission redirects to login if unauthenticated */}
      <Route element={<MainLayout />}>
        <Route path="assessment" element={<AssessmentPage />} />
      </Route>

      {/* Protected routes (require user auth) */}
      <Route element={<ProtectedRoute />}>
        {/* Protected user routes under MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
        </Route>
      </Route>

      {/* Protected admin routes (require admin auth) */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="admin159357" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="logs" element={<AdminLogsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
