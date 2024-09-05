const mongoose = require("mongoose");

// Schéma pour les véhicules loués
const rentedVehicleSchema = new mongoose.Schema({
    marque: String,
    modele: String,
    dailyRate: Number,
    daysRented: Number,
    montant: Number,
});

// Schéma pour les factures
const invoiceSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    issuedBy: { type: String, required: true },
    date: { type: Date, default: Date.now },
    billingPeriod: {
        startDate: Date,
        endDate: Date,
    },
    vehicles: [rentedVehicleSchema], // Liste des véhicules loués avec leur détail
    totalHT: { type: Number, required: true }, // Total hors taxe
    tva: { type: Number, required: true }, // TVA à 18%
    css: { type: Number, required: true }, // CSS à 1%
    totalTTC: { type: Number, required: true }, // Total TTC
    remise: { type: Number, default: 0 }, // Remise (si appliquée)
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
