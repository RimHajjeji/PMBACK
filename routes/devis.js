const express = require("express");
const router = express.Router();
const Devis = require("../models/Devis");
const Client = require("../models/Client");

// Générer le numéro de devis automatiquement
const generateDevisNumber = async () => {
    const count = await Devis.countDocuments();
    return (count + 1).toString().padStart(7, '0');
};

// Ajouter un nouveau devis
router.post("/add", async (req, res) => {
    const { clientId, issuedBy, billingPeriod, vehicles, totalHT, tva, css, totalTTC, remise, totalNet } = req.body;

    try {
        // Vérifier si le client existe
        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ error: "Client non trouvé" });

        // Générer un numéro de devis unique
        const devisNumber = await generateDevisNumber();

        // Créer un nouveau document de devis
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
            totalNet,
        });

        // Enregistrer le devis dans la base de données
        await newDevis.save();
        res.status(201).json(newDevis);
    } catch (error) {
        res.status(500).json({ error: "Échec de l'ajout du devis", details: error.message });
    }
});

// Récupérer tous les devis avec les détails du client
router.get("/", async (req, res) => {
    try {
        // Récupérer tous les devis et les clients associés
        const devis = await Devis.find().populate('client');
        res.status(200).json(devis);
    } catch (error) {
        res.status(500).json({ error: "Échec de la récupération des devis", details: error.message });
    }
});

// Récupérer un devis par ID
router.get("/:devisId", async (req, res) => {
    try {
        const { devisId } = req.params;
        const devis = await Devis.findById(devisId).populate('client');
        if (!devis) {
            return res.status(404).json({ error: "Devis non trouvé" });
        }
        res.status(200).json(devis);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération du devis", details: error.message });
    }
});

module.exports = router;
