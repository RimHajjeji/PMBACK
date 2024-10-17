const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

// Admin signup route
router.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    try {
        let admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({ msg: "Admin already exists" });
        }

        admin = new Admin({
            email,
            password,
        });

        await admin.save();

        const token = jwt.sign({ id: admin._id }, "yourJWTSecret", {
            expiresIn: 3600, // 1 hour
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

        console.log("Mot de passe fourni:", password); // DEBUG pour vérifier le mot de passe entré
        console.log("Mot de passe dans la base de données:", admin.password); // DEBUG pour vérifier le mot de passe haché

        // Comparer le mot de passe fourni avec celui haché dans la base de données
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin._id }, "yourJWTSecret", {
            expiresIn: 3600, // 1 heure
        });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


// Get admin details
router.get("/profile", async (req, res) => {
    try {
        const admin = await Admin.findOne({});
        if (!admin) {
            return res.status(404).json({ msg: "Admin not found" });
        }
        res.json({ email: admin.email });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});



// Update admin profile
router.put("/update", async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({});

        if (!admin) {
            return res.status(404).json({ msg: "Admin not found" });
        }

        // Mise à jour de l'email si fourni
        if (email) {
            admin.email = email;
        }

        // Si un nouveau mot de passe est fourni, on le hache avant de le sauvegarder
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            console.log("Mot de passe haché:", hashedPassword); // DEBUG pour vérifier le hash
            admin.password = hashedPassword; // Stocker le mot de passe haché
        }

        await admin.save();
        console.log("Admin mis à jour:", admin); // DEBUG pour vérifier si l'admin est bien mis à jour

        res.json({ msg: "Admin updated successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});




module.exports = router;