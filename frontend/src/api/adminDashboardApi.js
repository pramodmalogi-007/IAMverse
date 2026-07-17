// src/api/adminDashboardApi.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/admin",
});

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

export const getAdminStats = () =>
  api.get("/stats", { headers: authHeaders() });

export const getQuestions = () =>
  api.get("/questions", { headers: authHeaders() });

export const addQuestion = (questionData) =>
  api.post("/questions", questionData, { headers: authHeaders() });

export const deleteQuestion = (id) =>
  api.delete(`/questions/${id}`, { headers: authHeaders() });

export const updateQuestion = (id, optionsData) =>
  api.put(`/questions/${id}`, optionsData, { headers: authHeaders() });