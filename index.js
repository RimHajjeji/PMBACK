const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

const app = express(); 

// Configuration CORS : autoriser uniquement le domaine de production et localhost en développement
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://envoices.premiummotorscars.com'] // Autoriser uniquement ce domaine en production
        : '*', // Autorise toutes les origines en développement (localhost)
    optionsSuccessStatus: 200, // Pour gérer certains navigateurs anciens
};

// Appliquer CORS avec les options configurées
app.use(cors(corsOptions));

// Middleware pour le parsing JSON
app.use(express.json());

// Connexion à la base de données MongoDB
mongoose.connect("mongodb+srv://admin:admin12345678@cluster0.awqce.mongodb.net/PM", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Définition des routes
app.use("/api/admin", require("./routes/admin"));
app.use("/api/clients", require("./routes/client"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/invoices", require("./routes/invoice")); // Route pour les factures
app.use("/api/devis", require("./routes/devis")); // Route pour les devis

// Lancement du serveur sur le port 5000
app.listen(5000, () => {
    console.log("Server is Running on port 5000!!!");
});
