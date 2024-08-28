const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Client = require("../models/Client");

// Generate Invoice Number
const generateInvoiceNumber = async () => {
    const count = await Invoice.countDocuments();
    const nextNumber = (count + 1).toString().padStart(7, '0');
    return nextNumber;
};

// Add a new invoice
router.post("/add", async (req, res) => {
    const { clientId, issuedBy } = req.body;

    try {
        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ error: "Client not found" });

        const invoiceNumber = await generateInvoiceNumber();
        const newInvoice = new Invoice({ 
            client: clientId, 
            invoiceNumber, 
            issuedBy 
        });

        await newInvoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(500).json({ error: "Failed to add invoice" });
    }
});

// Get all invoices
router.get("/", async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('client');
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
});

module.exports = router;
