const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");

// Générer le numéro de facture automatiquement
const generateInvoiceNumber = async () => {
    const count = await Invoice.countDocuments();
    return (count + 1).toString().padStart(7, '0');
};

// Ajouter une nouvelle facture
router.post("/add", async (req, res) => {
    const { clientId, issuedBy, billingPeriod, vehicles, totalHT, tva, css, totalTTC, remise } = req.body;

    try {
        // Vérifier si le client existe
        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ error: "Client non trouvé" });

        // Générer un numéro de facture unique
        const invoiceNumber = await generateInvoiceNumber();

        // Créer un nouveau document de facture avec les détails fournis
        const newInvoice = new Invoice({
            client: clientId,
            invoiceNumber,
            issuedBy,
            billingPeriod,
            vehicles,
            totalHT,
            tva,
            css,
            totalTTC, // Champ TOTAL TTC calculé
            remise: remise || 0, // Inclure la remise si elle est appliquée
        });

        // Enregistrer la facture dans la base de données
        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(500).json({ error: "Échec de l'ajout de la facture", details: error.message });
    }
});

// Récupérer toutes les factures avec les détails du client
router.get("/", async (req, res) => {
    try {
        // Récupérer toutes les factures et les clients associés
        const invoices = await Invoice.find().populate('client');
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ error: "Échec de la récupération des factures", details: error.message });
    }
});

module.exports = router;
