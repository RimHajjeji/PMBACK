const mongoose = require("mongoose");

// Schema for invoiced vehicles
const invoicedVehicleSchema = new mongoose.Schema({
  marque: { type: String, required: true },
  modele: { type: String, required: true },
  dailyRate: { type: Number, required: true },
  daysRented: { type: Number, required: true },
  montant: { type: Number, required: true },
  tarifType: { type: String }, // Nouveau champ pour le tarif type dapres le choix de lutilisateur  
  durationType: { type: String},// Nouveau champ pour le   durationType dapres le choix de lutilisateur 
});

// Invoice Schema
const invoiceSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    invoiceNumber: { type: String, required: true },
    issuedBy: { type: String, required: true },
    date: { type: Date, default: Date.now },
    billingPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    vehicles: { type: [invoicedVehicleSchema], required: true },
    fraisSupplementaires: {
      fraisCarburant: { type: Number, default: 0 },
      fraisKilometrage: { type: Number, default: 0 },
      fraisLivraison: { type: Number, default: 0 },
      fraisChauffeur: { type: Number },
    },
    totalHT: { type: Number, required: true },
    totalHTFrais: { type: Number, required: true },
    tva: { type: Number, required: true },
    css: { type: Number, required: true },
    totalTTC: { type: Number, required: true },
    remise: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    totalNet: { type: Number, required: true },
    
    acompte: { type: Number , default: 0 }, // Nouveau champ pour l'acompte
    montantRemboursement: { type: Number, default: 0 }, // Nouveau champ pour le remboursement
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;