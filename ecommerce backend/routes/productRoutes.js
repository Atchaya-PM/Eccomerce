const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Add a New Product
router.post("/add", async (req, res) => {
    try {
        const { name, price, image, description } = req.body;
        const newProduct = new Product({ name, price, image, description });

        await newProduct.save();
        res.status(201).json({ message: "Product added successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Products
router.get("/all", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
