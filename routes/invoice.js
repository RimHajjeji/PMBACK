const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");

// Function to generate a unique invoice number
const generateInvoiceNumber = async () => {
  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
  const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.replace("PMC.", "")) : 343;
  const newNumber = lastNumber + 1;
  return `PMC.${newNumber}`;
};

// POST route to add a new invoice
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

    // Générer le numéro de facture unique
    const invoiceNumber = await generateInvoiceNumber();

    // Créer une nouvelle facture
    const newInvoice = new Invoice({
      client: clientId,
      invoiceNumber,
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

    // Sauvegarder la facture dans la base de données
    await newInvoice.save();
    res.status(201).json({ message: "Facture créée avec succès.", invoice: newInvoice });
  } catch (error) {
    console.error("Erreur lors de la création de la facture:", error);
    res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

// GET route to fetch all invoices with client details
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("client");
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Erreur lors de la récupération des factures:", error);
    res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
  }
});


// GET route to fetch a single invoice by ID
router.get("/:invoiceId", async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const invoice = await Invoice.findById(invoiceId).populate("client");
        if (!invoice) {
            return res.status(404).json({ error: "Facture non trouvée." });
        }
        res.status(200).json(invoice);
    } catch (error) {
        console.error("Erreur lors de la récupération de la facture:", error);
        res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
    }
});

// GET route to fetch invoices of a specific client by clientId
router.get("/client/:clientId", async (req, res) => {
    try {
        const { clientId } = req.params; // Récupère le clientId depuis les paramètres de l'URL
        console.log("Client ID reçu :", clientId); // Log pour debug

        // Vérifier si le client existe
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ error: "Client non trouvé." });
        }

        // Rechercher toutes les factures liées au client
        const invoices = await Invoice.find({ client: clientId }).populate("client");

        res.status(200).json({
            message: `Factures pour le client ${client.nom || clientId}`,
            invoices
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des factures du client:", error);
        res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
    }
});

// PUT route pour mettre à jour une facture et enregistrer l'historique des modifications
router.put("/:invoiceId", async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const updateData = req.body;
    const modifiedBy = req.body.modifiedBy || "Utilisateur inconnu"; // Utilisateur qui effectue la modification

    // Récupérer la facture actuelle
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Facture non trouvée." });
    }

    // Préparer un objet pour enregistrer les changements
    const changes = {};
    Object.keys(updateData).forEach((key) => {
      if (JSON.stringify(invoice[key]) !== JSON.stringify(updateData[key])) {
        changes[key] = {
          oldValue: invoice[key],
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
      invoice.modificationHistory.push(modificationRecord);
    }

    // Mettre à jour les données de la facture avec les nouvelles valeurs
    Object.assign(invoice, updateData);

    // Sauvegarder les modifications dans la base de données
    await invoice.save();

    res.status(200).json({
      message: "Facture mise à jour avec succès.",
      invoice, // Retourne la facture mise à jour
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la facture:", error);
    res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
  }
});


// GET route pour récupérer l'historique des modifications d'une facture
router.get("/:invoiceId/history", async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Récupérer la facture avec uniquement l'historique
    const invoice = await Invoice.findById(invoiceId, "modificationHistory");
    if (!invoice) {
      return res.status(404).json({ error: "Facture non trouvée." });
    }

    res.status(200).json(invoice.modificationHistory);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des modifications:", error);
    res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

module.exports = router;
