const express = require("express");
const fs = require("fs");
const path = require("path");
const { adminAuthMiddleware } = require("../middleware/adminAuth");
const { insertOne } = require("../utils/fileStore");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const PRODUCTS_FILE = path.join(__dirname, "../data/products.json");
const LOGS_FILE = "activityLogs.json";

// Helper to read products
const getProducts = () => {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(PRODUCTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading products:", err);
    return [];
  }
};

// Helper to write products
const saveProducts = (products) => {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8");
};

// 1. GET ALL PRODUCTS
router.get("/", adminAuthMiddleware, (req, res) => {
  try {
    const products = getProducts();
    return res.json({ success: true, products });
  } catch (err) {
    console.error("Error getting products:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// 2. ADD / UPDATE PRODUCT
router.post("/", adminAuthMiddleware, (req, res) => {
  try {
    const newProduct = req.body;
    if (!newProduct.id || !newProduct.name) {
      return res.status(400).json({ success: false, message: "Product ID and Name are required" });
    }

    let products = getProducts();
    const existingIndex = products.findIndex(p => p.id === newProduct.id);

    if (existingIndex >= 0) {
      products[existingIndex] = { ...products[existingIndex], ...newProduct };
    } else {
      products.push(newProduct);
    }

    saveProducts(products);
    
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    insertOne(LOGS_FILE, {
      id: uuidv4(),
      actor: req.admin?.name || req.admin?.email || "Admin",
      actorId: req.admin?.adminId || null,
      action: "ADD_PRODUCT",
      target: newProduct.id,
      ip,
      createdAt: new Date().toISOString(),
    });

    return res.json({ success: true, product: newProduct });
  } catch (err) {
    console.error("Error adding product:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// 3. DELETE PRODUCT
router.delete("/:id", adminAuthMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    let products = getProducts();
    
    const filteredProducts = products.filter(p => p.id !== id);
    if (filteredProducts.length === products.length) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    saveProducts(filteredProducts);
    
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    insertOne(LOGS_FILE, {
      id: uuidv4(),
      actor: req.admin?.name || req.admin?.email || "Admin",
      actorId: req.admin?.adminId || null,
      action: "DELETE_PRODUCT",
      target: id,
      ip,
      createdAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
