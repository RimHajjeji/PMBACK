const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

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
            password // Assurez-vous de sécuriser les mots de passe en production
        });

        await admin.save();

        const token = jwt.sign({ id: admin._id }, "yourJWTSecret", {
            expiresIn: 3600 // 1 heure
        });

        res.json({ token });
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
        if (!admin) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Directly compare the password (if no hashing is used)
        if (password !== admin.password) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Create a JWT token
        const token = jwt.sign({ id: admin._id }, "yourJWTSecret", {
            expiresIn: 3600, // Token valid for 1 hour
        });

        // Include admin's name in the response
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


// Get specific admin details
router.get("/profile", async (req, res) => {
    const token = req.header("x-auth-token");

    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, "yourJWTSecret");

        const admin = await Admin.findById(decoded.id).select("-password");
        if (!admin) {
            return res.status(404).json({ msg: "Admin not found" });
        }

        res.json({ 
            nom: admin.nom, 
            prenom: admin.prenom 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


router.put("/update", async (req, res) => {
    const token = req.header("x-auth-token");

    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, "yourJWTSecret");
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(404).json({ msg: "Admin not found" });
        }

        const { nom, prenom, email, oldPassword, newPassword, confirmPassword } = req.body;

        // Vérification de l'ancien mot de passe
        if (oldPassword && oldPassword !== admin.password) {
            return res.status(400).json({ msg: "Ancien mot de passe incorrect" });
        }

        // Vérification du nouveau mot de passe
        if (newPassword && newPassword !== confirmPassword) {
            return res.status(400).json({ msg: "Le nouveau mot de passe et la confirmation ne correspondent pas" });
        }

        // Mise à jour des données
        if (nom) admin.nom = nom;
        if (prenom) admin.prenom = prenom;
        if (email) admin.email = email;
        if (newPassword) admin.password = newPassword;

        await admin.save();

        res.json({ msg: "Profil mis à jour avec succès" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});



module.exports = router;