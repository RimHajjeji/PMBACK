const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();
const validTokens = new Set(); // Contient les tokens valides pour la session en cours

const JWT_SECRET = "yourJWTSecret"; // À sécuriser avec des variables d'environnement

// Fonction pour vérifier si un token est valide
const isTokenValid = (token) => validTokens.has(token);

// Admin signup route
router.post("/signup", async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: "Admin already exists" });
    }

    admin = new Admin({
      nom,
      prenom,
      email,
      password, // Assurez-vous de sécuriser les mots de passe en production
    });

    await admin.save();

    const token = jwt.sign(
      { id: admin._id, nom: admin.nom, prenom: admin.prenom, email: admin.email },
      JWT_SECRET,
      {
        expiresIn: "24h", // Expiration fixée à 24 heures
      }
    );

    validTokens.add(token); // Ajout du token valide
    res.json({
      token,
      admin: {
        id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Admin login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin || password !== admin.password) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, nom: admin.nom, prenom: admin.prenom, email: admin.email },
      JWT_SECRET,
      {
        expiresIn: "24h", // Expiration fixée à 24 heures
      }
    );

    validTokens.add(token); // Ajout du token valide
    res.json({
      token,
      admin: {
        id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Admin logout route
router.post("/logout", async (req, res) => {
  const token = req.header("x-auth-token");

  if (!token || !isTokenValid(token)) {
    return res.status(400).json({ msg: "Invalid or missing token" });
  }

  validTokens.delete(token); // Invalidation du token
  res.json({ msg: "Déconnecté avec succès" });
});

// Get specific admin details
router.get("/profile", async (req, res) => {
  const token = req.header("x-auth-token");

  if (!token || !isTokenValid(token)) {
    return res.status(401).json({ msg: "No token or invalid token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      id: decoded.id,
      nom: decoded.nom,
      prenom: decoded.prenom,
      email: decoded.email,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update admin details
router.put("/update", async (req, res) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    const { nom, prenom, email, oldPassword, newPassword, confirmPassword } =
      req.body;

    // Vérification de l'ancien mot de passe
    if (oldPassword && oldPassword !== admin.password) {
      return res.status(400).json({ msg: "Ancien mot de passe incorrect" });
    }

    // Vérification du nouveau mot de passe
    if (newPassword && newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({
          msg: "Le nouveau mot de passe et la confirmation ne correspondent pas",
        });
    }

    // Mise à jour des données
    if (nom) admin.nom = nom;
    if (prenom) admin.prenom = prenom;
    if (email) admin.email = email;
    if (newPassword) admin.password = newPassword;

    await admin.save();

    // Re-génération du token après modification
    const newToken = jwt.sign(
      { id: admin._id, nom: admin.nom, prenom: admin.prenom, email: admin.email },
      JWT_SECRET,
      { expiresIn: "24h" } // Expiration fixée à 24 heures
    );

    res.json({
      msg: "Profil mis à jour avec succès",
      admin: {
        id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
      },
      token: newToken, // Retour du nouveau token
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/admins", async (req, res) => {
  try {
    const admins = await Admin.find({}, "nom prenom _id"); // Récupère uniquement nom, prénom et ID
    res.status(200).json(admins);
  } catch (error) {
    console.error("Erreur lors de la récupération des administrateurs:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// Route pour renouveler le token si l'ancien est proche de l'expiration
router.post("/refresh-token", async (req, res) => {
  const token = req.header("x-auth-token");

  if (!token || !isTokenValid(token)) {
    return res.status(400).json({ msg: "No token or invalid token" });
  }

  try {
    // Vérifier si le token est encore valide
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ msg: "Token expired" });
    }

    // Générer un nouveau token
    const newToken = jwt.sign(
      { id: decoded.id, nom: decoded.nom, prenom: decoded.prenom, email: decoded.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Retourner le nouveau token
    res.json({ token: newToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


module.exports = router;
