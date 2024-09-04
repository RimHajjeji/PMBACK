const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");

// Générer le numéro de facture
const generateInvoiceNumber = async () => {
    const count = await Invoice.countDocuments();
    return (count + 1).toString().padStart(7, '0');
};

// Ajouter une nouvelle facture
router.post("/add", async (req, res) => {
    const { clientId, issuedBy, billingPeriod, vehicles, totalHT, tva, css } = req.body;

    try {
        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ error: "Client non trouvé" });

        const invoiceNumber = await generateInvoiceNumber();
        const newInvoice = new Invoice({
            client: clientId,
            invoiceNumber,
            issuedBy,
            billingPeriod,
            vehicles,
            totalHT,
            tva, // Inclure le champ TVA ici
            css, // Inclure le champ CSS ici
        });

        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(500).json({ error: "Échec de l'ajout de la facture" });
    }
});

// Obtenir toutes les factures
router.get("/", async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('client');
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ error: "Échec de la récupération des factures" });
    }
});

module.exports = router;
