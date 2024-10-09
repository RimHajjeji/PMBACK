const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

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
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.log("MongoDB connection error: ", err));

// Définition des routes
app.use("/api/admin", require("./routes/admin"));
app.use("/api/clients", require("./routes/client"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/invoices", require("./routes/invoice")); // Route pour les factures
app.use("/api/devis", require("./routes/devis")); // Route pour les devis

// Route de test pour vérifier que le serveur fonctionne
app.get("/test", (req, res) => {
    res.send("Server is running!");
});

// Utiliser le port dynamique fourni par l'hébergeur ou 5000 par défaut
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
