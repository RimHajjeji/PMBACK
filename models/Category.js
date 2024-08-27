const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    marque: { type: String, required: true },
    modele: { type: String, required: true },
    couleur: { type: String, required: true },
    plaque: { type: String, required: true },
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    vehicles: [vehicleSchema],
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
