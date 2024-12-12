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
      fraisSupplementaires,
      totalHT,
      totalHTFrais,
      tva,
      css,
      totalTTC,
      remise,
      discountPercentage,
      totalNet,
      acompte, // Nouveau champ
      montantRemboursement, // Nouveau champ
    } = req.body;

    // Validation des champs requis
    if (
      !clientId ||
      !issuedBy ||
      !billingPeriod.startDate ||
      !billingPeriod.endDate ||
      !vehicles ||
      vehicles.length === 0 ||
      totalHT === undefined ||
      totalHTFrais === undefined ||
      tva === undefined ||
      css === undefined ||
      totalTTC === undefined ||
      totalNet === undefined
    ) {
      return res.status(400).json({ error: "Tous les champs requis doivent être remplis." });
    }

    // Vérifier si le client existe
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
      fraisSupplementaires,
      totalHT,
      totalHTFrais,
      tva,
      css,
      totalTTC,
      remise: remise || 0,
      discountPercentage: discountPercentage || 0,
      totalNet,
      acompte: acompte || 0, // Enregistrer l'acompte
      montantRemboursement: montantRemboursement || 0, // Enregistrer le remboursement
    });

   // Save the devis to the database
   await newDevis.save();

    res.status(201).json({ message: "Devis créée avec succès.", devis: newDevis });
  } catch (error) {
    console.error("Erreur lors de la création de la devis:", error);
    res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
  }
});


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
        console.error("Erreur lors de la récupération de devis:", error);
        res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
    }
});

// GET route to fetch devis of a specific client by clientId
router.get("/client/:clientId", async (req, res) => {
    try {
        const { clientId } = req.params; // Récupère le clientId depuis les paramètres de l'URL
        console.log("Client ID reçu :", clientId); // Log pour debug

        // Vérifier si le client existe
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ error: "Client non trouvé." });
        }

        // Rechercher toutes les devis liées au client
        const devis = await Devis.find({ client: clientId }).populate("client");

        res.status(200).json({
            message: `Devis pour le client ${client.nom || clientId}`,
            devis
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des devis du client:", error);
        res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
    }
});

// PUT route to update an devis by ID
router.put("/:devisId", async (req, res) => {
    try {
        const { devisId } = req.params; // Récupérer l'ID de la devis depuis les paramètres
        const updateData = req.body; // Récupérer les données de mise à jour depuis le corps de la requête

        // Vérifier si la devis existe
        const devis = await Devis.findById(devisId);
        if (!devis) {
            return res.status(404).json({ error: "devis non trouvée." });
        }

        // Mettre à jour la devis avec les nouvelles données
        Object.keys(updateData).forEach((key) => {
            devis[key] = updateData[key];
        });

        // Sauvegarder les modifications dans la base de données
        await devis.save();

        res.status(200).json({
            message: "Devis mise à jour avec succès.",
            devis,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la devis:", error);
        res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
    }
});



module.exports = router;
