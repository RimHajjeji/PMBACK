const express = require("express");
const router = express.Router();
const Devis = require("../models/Devis");
const Client = require("../models/Client");

// Function to generate a unique devis number
const generateDevisNumber = async () => {
  const lastDevis = await Devis.findOne().sort({ createdAt: -1 });
  const lastNumber = lastDevis
    ? parseInt(lastDevis.devisNumber.replace("PMC.", ""))
    : 343;
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
      return res
        .status(400)
        .json({ error: "Tous les champs requis doivent être remplis." });
    }

    // Vérifier si le client existe
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ error: "Client non trouvé." });

    // Générer le numéro de devis unique
    const devisNumber = await generateDevisNumber();

    // Créer une nouvelle devis
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
      modificationHistory: [],
    });

    // Sauvegarder la devis dans la base de données
    await newDevis.save();
    res
      .status(201)
      .json({ message: "Facture créée avec succès.", devis: newDevis });
  } catch (error) {
    console.error("Erreur lors de la création de la devis:", error);
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

// GET route to fetch all devis with client details
router.get("/", async (req, res) => {
  try {
    const devis = await Devis.find().populate("client");
    res.status(200).json(devis);
  } catch (error) {
    console.error("Erreur lors de la récupération des devis:", error);
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

// GET route to fetch a single devis by ID
router.get("/:devisId", async (req, res) => {
  try {
    const { devisId } = req.params;
    const devis = await Devis.findById(devisId).populate("client");
    if (!devis) {
      return res.status(404).json({ error: "Facture non trouvée." });
    }
    res.status(200).json(devis);
  } catch (error) {
    console.error("Erreur lors de la récupération de la devis:", error);
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
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
    const devis = await Devis.find({ client: clientId }).populate(
      "client",
    );

    res.status(200).json({
      message: `Factures pour le client ${client.nom || clientId}`,
      devis,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des devis du client:",
      error,
    );
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

// PUT route pour mettre à jour une devis et enregistrer l'historique des modifications
router.put("/:devisId", async (req, res) => {
  try {
    const { devisId } = req.params;
    const updateData = req.body;
    const modifiedBy = req.body.modifiedBy || "Utilisateur inconnu"; // Utilisateur qui effectue la modification

    // Récupérer la devis actuelle
    const devis = await Devis.findById(devisId);
    if (!devis) {
      return res.status(404).json({ error: "Facture non trouvée." });
    }

    // Préparer un objet pour enregistrer les changements
    const changes = {};
    Object.keys(updateData).forEach((key) => {
      if (JSON.stringify(devis[key]) !== JSON.stringify(updateData[key])) {
        changes[key] = {
          oldValue: devis[key],
          newValue: updateData[key],
        };
      }
    });

    // Ajouter l'entrée dans l'historique si des changements existent
    if (Object.keys(changes).length > 0) {
      const modificationRecord = {
        modifiedBy,
        modifiedAt: new Date(),
        changes,
      };
      // Ajout de la modification dans l'historique
      devis.modificationHistory.push(modificationRecord);
    }

    // Mettre à jour les données de la devis avec les nouvelles valeurs
    Object.assign(devis, updateData);

    // Sauvegarder les modifications dans la base de données
    await devis.save();

    res.status(200).json({
      message: "Facture mise à jour avec succès.",
      devis, // Retourne la devis mise à jour
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la devis:", error);
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

// GET route pour récupérer l'historique des modifications d'une devis
router.get("/:devisId/history", async (req, res) => {
  try {
    const { devisId } = req.params;

    // Récupérer la devis avec uniquement l'historique
    const devis = await Devis.findById(devisId, "modificationHistory");
    if (!devis) {
      return res.status(404).json({ error: "Facture non trouvée." });
    }

    res.status(200).json(devis.modificationHistory);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique des modifications:",
      error,
    );
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

module.exports = router;
