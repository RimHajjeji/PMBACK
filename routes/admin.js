const express = require("express");
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
            password, // Stocker le mot de passe sans cryptage
        });

        await admin.save();

        const token = jwt.sign({ id: admin._id }, "yourJWTSecret", {
            expiresIn: 3600, // 1 heure
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

        // Comparer directement le mot de passe sans cryptage
        if (password !== admin.password) {
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

// Get specific admin details
router.get("/profile", async (req, res) => {
    // Extract the token from the request headers
    const token = req.header("x-auth-token");

    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        // Verify the token and get the admin's ID
        const decoded = jwt.verify(token, "yourJWTSecret");

        // Find the admin by ID
        const admin = await Admin.findById(decoded.id).select("-password"); // Exclude password from the result
        if (!admin) {
            return res.status(404).json({ msg: "Admin not found" });
        }

        // Return admin details
        res.json({ email: admin.email });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


// Update admin profile
router.put("/update", async (req, res) => {
    const token = req.header("x-auth-token"); // Get the token from the headers

    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        // Verify the token and get the admin's ID
        const decoded = jwt.verify(token, "yourJWTSecret");
        
        // Find the admin by ID
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(404).json({ msg: "Admin not found" });
        }

        // Update the email if provided
        const { email, password } = req.body;
        if (email) {
            admin.email = email;
        }

        // Update the password if provided (no hashing as per your request)
        if (password) {
            admin.password = password; // Storing the password in plain text
        }

        // Save the updated admin data
        await admin.save();

        res.json({ msg: "Admin updated successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


module.exports = router;
