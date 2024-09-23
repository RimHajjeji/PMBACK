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

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin._id }, "yourJWTSecret", {
            expiresIn: 3600, // 1 hour
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



//update profile
router.put("/update", async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({});

        if (!admin) {
            return res.status(404).json({ msg: "Admin not found" });
        }

        if (email) {
            admin.email = email;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
        }

        await admin.save();
        res.json({ msg: "Admin updated successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


module.exports = router;