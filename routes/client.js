const express = require("express");
const router = express.Router();
const Client = require("../models/Client");

// Add a new client
router.post("/add", async (req, res) => {
    const { firstName, lastName, phone, email } = req.body;

    try {
        const newClient = new Client({ firstName, lastName, phone, email });
        await newClient.save();
        res.status(201).json(newClient);
    } catch (error) {
        res.status(500).json({ error: "Failed to add client" });
    }
});

// Get all clients
router.get("/", async (req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch clients" });
    }
});

module.exports = router;
