const express = require("express");
const router = express.Router();
const Client = require("../models/Client");

// Add a new client
router.post("/add", async (req, res) => {
    const { firstName, lastName, phone, email ,codeClient, typeClient} = req.body;

    try {
        const newClient = new Client({ firstName, lastName, phone, email , codeClient, typeClient });
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

// Route pour récupérer un client spécifique par son ID
router.get("/:clientId", async (req, res) => {
    try {
      const client = await Client.findById(req.params.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client introuvable." });
      }
      res.status(200).json(client);
    } catch (error) {
      console.error("Erreur lors de la récupération du client:", error);
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  });

  // Update a client by ID
router.put("/:clientId", async (req, res) => {
  const { clientId } = req.params;
  const { firstName, lastName, phone, email, codeClient, typeClient } = req.body;

  try {
      const updatedClient = await Client.findByIdAndUpdate(
          clientId,
          { firstName, lastName, phone, email, codeClient, typeClient },
          { new: true }
      );

      if (!updatedClient) {
          return res.status(404).json({ error: "Client introuvable." });
      }

      res.status(200).json(updatedClient);
  } catch (error) {
      console.error("Erreur lors de la mise à jour du client:", error);
      res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

module.exports = router;

module.exports = router;
