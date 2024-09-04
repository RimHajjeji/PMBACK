const mongoose = require("mongoose");

const rentedVehicleSchema = new mongoose.Schema({
    marque: String,
    modele: String,
    dailyRate: Number,
    daysRented: Number,
    montant: Number, // Stocke le montant calculé
});

const invoiceSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    issuedBy: { type: String, required: true },
    date: { type: Date, default: Date.now },
    billingPeriod: {
        startDate: Date,
        endDate: Date,
    },
    vehicles: [rentedVehicleSchema],
    totalHT: Number, // Stocke la somme de tous les montants
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
