// frontend/src/api/adminAuthApi.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/admin",
});

// register admin
export const registerAdmin = (data) => api.post("/register", data);

// login admin
export const loginAdmin = (data) => api.post("/login", data);

// verify admin login OTP
export const verifyOtp = (data) => api.post("/login/verify", data);

// update admin settings
export const updateSettings = (data) => {
  const token = localStorage.getItem("adminToken");
  return api.put("/settings", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// list admins
export const getAdmins = () => {
  const token = localStorage.getItem("adminToken");
  return api.get("/list", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// list regular users
export const getRegularUsers = () => {
  const token = localStorage.getItem("adminToken");
  return api.get("/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// toggle active status of a user
export const toggleUserStatus = (id) => {
  const token = localStorage.getItem("adminToken");
  return api.put(`/users/${id}/toggle`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// delete a user
export const deleteUser = (id) => {
  const token = localStorage.getItem("adminToken");
  return api.delete(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// get user assessment history
export const getUserAssessments = (uid) => {
  const token = localStorage.getItem("adminToken");
  return api.get(`/users/${uid}/assessments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};