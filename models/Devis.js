const mongoose = require("mongoose");

// Schéma pour les véhicules inclus dans le devis
const quotedVehicleSchema = new mongoose.Schema({
    marque: String,
    modele: String,
    dailyRate: Number,
    daysQuoted: Number,
    montant: Number,
});

// Schéma pour les devis
const devisSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    quoteNumber: { type: String, required: true, unique: true }, // Numéro de devis
    issuedBy: { type: String, required: true },
    date: { type: Date, default: Date.now },
    validityPeriod: { // Période de validité du devis
        startDate: Date,
        endDate: Date,
    },
    vehicles: [quotedVehicleSchema], // Liste des véhicules inclus dans le devis
    totalHT: { type: Number, required: true }, // Total hors taxe
    tva: { type: Number, required: true }, // TVA à 18%
    css: { type: Number, required: true }, // CSS à 1%
    totalTTC: { type: Number, required: true }, // Total TTC
    remise: { type: Number, default: 0 }, // Remise (si appliquée)
    totalNet: { type: Number, required: true }, // Total Net
}, { timestamps: true });

const Devis = mongoose.model("Devis", devisSchema);

module.exports = Devis;
