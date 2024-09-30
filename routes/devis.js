const express = require("express");
const router = express.Router();
const Devis = require("../models/Devis");
const Client = require("../models/Client");

// Function to generate a unique devis number
const generateDevisNumber = async () => {
  const lastDevis = await Devis.findOne().sort({ createdAt: -1 });
  const lastNumber = lastDevis ? parseInt(lastDevis.devisNumber.replace("PMC.", "")) : 336; 
  const newNumber = lastNumber + 1;
  return `PMC.${newNumber}`;
};

  

// POST route to add a new devis
router.post("/add", async (req, res) => {
    try {
      const {
        clientId,
        issuedBy,
        billingPeriod,
        vehicles,
        totalHT,
        tva,
        css,
        totalTTC,
        remise,
        discountPercentage,
        totalNet,
      } = req.body;
  
      // Validate required fields
      if (
        !clientId ||
        !issuedBy ||
        !billingPeriod.startDate ||
        !billingPeriod.endDate ||
        !vehicles ||
        vehicles.length === 0 ||
        totalHT === undefined ||
        tva === undefined ||
        css === undefined ||
        totalTTC === undefined ||
        totalNet === undefined
      ) {
        return res.status(400).json({ error: "Tous les champs requis doivent être remplis." });
      }
  
      // Check if client exists
      const client = await Client.findById(clientId);
      if (!client) return res.status(404).json({ error: "Client non trouvé." });
  
      // Generate a unique devis number
      const devisNumber = await generateDevisNumber();
  
      // Create a new devis document
      const newDevis = new Devis({
        client: clientId,
        devisNumber,
        issuedBy,
        billingPeriod,
        vehicles,
        totalHT,
        tva,
        css,
        totalTTC,
        remise: remise || 0,
        discountPercentage: discountPercentage || 0,
        totalNet,
      });
  
      // Save the devis to the database
      await newDevis.save();
      res.status(201).json({ message: "Devis créé avec succès.", devis: newDevis });
    } catch (error) {
      console.error("Erreur lors de la création du devis:", error);
      res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
    }
  });
  

// GET route to fetch all devis with client details
router.get("/", async (req, res) => {
  try {
    const devis = await Devis.find().populate("client");
    res.status(200).json(devis);
  } catch (error) {
    console.error("Erreur lors de la récupération des devis:", error);
    res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

// GET route to fetch a single devis by ID
router.get("/:devisId", async (req, res) => {
  try {
    const { devisId } = req.params;
    const devis = await Devis.findById(devisId).populate("client");
    if (!devis) {
      return res.status(404).json({ error: "Devis non trouvé." });
    }
    res.status(200).json(devis);
  } catch (error) {
    console.error("Erreur lors de la récupération du devis:", error);
    res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

module.exports = router;
