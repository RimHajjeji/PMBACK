// models/Invoice.js
const mongoose = require("mongoose");

// Schema for rented vehicles
const rentedVehicleSchema = new mongoose.Schema({
  marque: { type: String, required: true },
  modele: { type: String, required: true },
  dailyRate: { type: Number, required: true },
  daysRented: { type: Number, required: true },
  montant: { type: Number, required: true },
});

// Invoice Schema
const invoiceSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    issuedBy: { type: String, required: true },
    date: { type: Date, default: Date.now },
    billingPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    vehicles: { type: [rentedVehicleSchema], required: true },
    totalHT: { type: Number, required: true },
    tva: { type: Number, required: true },
    css: { type: Number, required: true },
    totalTTC: { type: Number, required: true },
    remise: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    totalNet: { type: Number, required: true },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
