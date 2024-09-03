const express = require("express");
const Category = require("../models/Category");
const router = express.Router();

// Add a new category
router.post("/add-category", async (req, res) => {
    const { name } = req.body;
    try {
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ message: "Failed to add category", error: err });
    }
});

// Add a vehicle to a specific category
router.post("/add-vehicle/:categoryId", async (req, res) => {
    const { categoryId } = req.params;
    const { marque, modele, couleur, plaque } = req.body;

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const newVehicle = { marque, modele, couleur, plaque };
        category.vehicles.push(newVehicle);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: "Failed to add vehicle", error: err });
    }
});

// Get all categories with their vehicles
router.get("/categories", async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: "Failed to retrieve categories", error: err });
    }
});
   

module.exports = router;
