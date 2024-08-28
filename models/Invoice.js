const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true,
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },
    issuedBy: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
