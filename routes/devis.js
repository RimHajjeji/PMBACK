const express = require("express");
const router = express.Router();
const Devis = require("../models/Devis");
const Client = require("../models/Client");
const Admin = require("../models/Admin");

// Function to generate a unique devis number
const generateDevisNumber = async () => {
  const lastDevis = await Devis.findOne().sort({ createdAt: -1 });
  const lastNumber = lastDevis
    ? parseInt(lastDevis.devisNumber.replace("PMC.", ""))
    : 336;
  const newNumber = lastNumber + 1;
  return `PMC.${newNumber}`;
};

// POST route to add a new devis
router.post("/add", async (req, res) => {
  try {
    const {
      clientId,
      issuedBy,
      billingPeriod,
      vehicles,
      fraisSupplementaires,
      totalHT,
      totalHTFrais,
      tva,
      css,
      totalTTC,
      remise,
      discountPercentage,
      totalNet,
      acompte, // Nouveau champ
      montantRemboursement, // Nouveau champ
    } = req.body;

    // Validation des champs requis
    if (
      !clientId ||
      !issuedBy ||
      !billingPeriod.startDate ||
      !billingPeriod.endDate ||
      !vehicles ||
      vehicles.length === 0 ||
      totalHT === undefined ||
      totalHTFrais === undefined ||
      tva === undefined ||
      css === undefined ||
      totalTTC === undefined ||
      totalNet === undefined
    ) {
      return res
        .status(400)
        .json({ error: "Tous les champs requis doivent être remplis." });
    }

    // Vérifier si le client existe
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ error: "Client non trouvé." });

    // Générer le numéro de devis unique
    const devisNumber = await generateDevisNumber();

    // Créer une nouvelle devis
    const newDevis = new Devis({
      client: clientId,
      devisNumber,
      issuedBy,
      billingPeriod,
      vehicles,
      fraisSupplementaires,
      totalHT,
      totalHTFrais,
      tva,
      css,
      totalTTC,
      remise: remise || 0,
      discountPercentage: discountPercentage || 0,
      totalNet,
      acompte: acompte || 0, // Enregistrer l'acompte
      montantRemboursement: montantRemboursement || 0, // Enregistrer le remboursement
      modificationHistory: [],
    });

    // Sauvegarder la devis dans la base de données
    await newDevis.save();
    res
      .status(201)
      .json({ message: "devis créée avec succès.", devis: newDevis });
  } catch (error) {
    console.error("Erreur lors de la création de la devis:", error);
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

// GET route to fetch all devis with client details
router.get("/", async (req, res) => {
  try {
    const devis = await Devis.find().populate("client");
    res.status(200).json(devis);
  } catch (error) {
    console.error("Erreur lors de la récupération des devis:", error);
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

// GET route to fetch a single devis by ID
router.get("/:devisId", async (req, res) => {
  try {
    const { devisId } = req.params;
    const devis = await Devis.findById(devisId).populate("client");
    if (!devis) {
      return res.status(404).json({ error: "devis non trouvée." });
    }
    res.status(200).json(devis);
  } catch (error) {
    console.error("Erreur lors de la récupération de la devis:", error);
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

// GET route to fetch devis of a specific client by clientId
router.get("/client/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params; // Récupère le clientId depuis les paramètres de l'URL
    console.log("Client ID reçu :", clientId); // Log pour debug

    // Vérifier si le client existe
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: "Client non trouvé." });
    }

    // Rechercher toutes les devis liées au client
    const devis = await Devis.find({ client: clientId }).populate("client");

    res.status(200).json({
      message: `Devis pour le client ${client.nom || clientId}`,
      devis,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des devis du client:", error);
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

// PUT route pour mettre à jour une Devis et enregistrer l'historique des modifications
router.put("/:devisId", async (req, res) => {
  try {
    const { devisId } = req.params;
    const updateData = req.body;
    const { modifiedBy, password } = req.body; // On attend l'ID de l'admin et le mot de passe

    // Vérification si l'admin est sélectionné et le mot de passe est fourni
    if (!modifiedBy || !password) {
      return res.status(400).json({ error: "Admin et mot de passe requis." });
    }

    // Trouver l'admin par son ID (modifiedBy)
    const admin = await Admin.findById(modifiedBy);
    if (!admin) {
      return res.status(404).json({ error: "Admin non trouvé." });
    }

    // Comparer le mot de passe fourni avec celui stocké dans la base de données
    const isPasswordValid = password === admin.password; // Ici, vous pouvez appliquer une logique de cryptage si nécessaire
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mot de passe incorrect." });
    }

    // Récupérer la Devis actuelle
    const devis = await Devis.findById(devisId);
    if (!devis) {
      return res.status(404).json({ error: "devis non trouvée." });
    }

    // Préparer un objet pour enregistrer les changements
    const changes = {};
    Object.keys(updateData).forEach((key) => {
      if (JSON.stringify(devis[key]) !== JSON.stringify(updateData[key])) {
        changes[key] = {
          oldValue: devis[key],
          newValue: updateData[key],
        };
      }
    });

    // Ajouter l'entrée dans l'historique si des changements existent
    if (Object.keys(changes).length > 0) {
      const modificationRecord = {
        modifiedBy: admin.nom + " " + admin.prenom, // Le nom et prénom de l'admin
        modifiedAt: new Date(),
        changes,
      };
      // Ajout de la modification dans l'historique
      devis.modificationHistory.push(modificationRecord);
    }

    // Mettre à jour les données de la Devis avec les nouvelles valeurs
    Object.assign(devis, updateData);

    // Sauvegarder les modifications dans la base de données
    await devis.save();

    res.status(200).json({
      message: "devis mise à jour avec succès.",
      devis, // Retourne la Devis mise à jour
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la Devis:", error);
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

// Route pour récupérer l'historique des modifications d'une Devis
router.get("/:devisId/modification-history", async (req, res) => {
  try {
    const { devisId } = req.params;

    // Rechercher la Devis et projeter uniquement l'historique des modifications (sans 'changes')
    const devis = await Devis.findById(devisId, "modificationHistory");
    if (!devis) {
      return res.status(404).json({ error: "devis non trouvée." });
    }

    // Mapper les résultats pour n'afficher que les champs requis
    const history = devis.modificationHistory.map((entry) => ({
      modifiedBy: entry.modifiedBy,
      timestamp: entry.modifiedAt, // Correspond à `modifiedAt` dans le schéma
    }));

    res.status(200).json(history);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique des modifications:",
      error,
    );
    res
      .status(500)
      .json({ error: "Erreur interne du serveur.", details: error.message });
  }
});

module.exports = router;
