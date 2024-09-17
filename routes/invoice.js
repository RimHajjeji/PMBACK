const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");

// Function to generate a unique invoice number
const generateInvoiceNumber = async () => {
  const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
  const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.replace("PMC.", "")) : 0;
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

    // Generate a unique invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create a new invoice document
    const newInvoice = new Invoice({
      client: clientId,
      invoiceNumber,
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

    // Save the invoice to the database
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

module.exports = router;
