const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    codeClient: { // Added "code client" field
        type: String,
        required: true,
    },
    typeClient: { // Added "type client" field
        type: String,
        required: true,
    },
}, { timestamps: true });

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
