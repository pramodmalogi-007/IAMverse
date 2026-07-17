// frontend/src/api/adminProductsApi.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/admin/products",
});

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return { Authorization: `Bearer ${token}` };
};

// get all products
export const getProducts = () => {
  return api.get("/", { headers: getAuthHeaders() });
};

// add or update a product
export const saveProduct = (productData) => {
  return api.post("/", productData, { headers: getAuthHeaders() });
};

// delete a product
export const deleteProduct = (id) => {
  return api.delete(`/${id}`, { headers: getAuthHeaders() });
};
