// PUT route pour mettre à jour une facture et enregistrer l'historique des modifications
router.put("/:invoiceId", async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const updateData = req.body;
    const modifiedBy = req.body.modifiedBy || "Utilisateur inconnu"; // Utilisateur qui effectue la modification

    // Récupérer la facture actuelle
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Facture non trouvée." });
    }

    // Préparer un objet pour enregistrer les changements
    const changes = {};
    Object.keys(updateData).forEach((key) => {
      if (JSON.stringify(invoice[key]) !== JSON.stringify(updateData[key])) {
        changes[key] = {
          oldValue: invoice[key],
          newValue: updateData[key],
        };
      }
    });

    // Ajouter l'entrée dans l'historique si des changements existent
    if (Object.keys(changes).length > 0) {
      const modificationRecord = {
        modifiedBy,
        modifiedAt: new Date(),
        changes,
      };
      // Ajout de la modification dans l'historique
      invoice.modificationHistory.push(modificationRecord);
    }

    // Mettre à jour les données de la facture avec les nouvelles valeurs
    Object.assign(invoice, updateData);

    // Sauvegarder les modifications dans la base de données
    await invoice.save();

    res.status(200).json({
      message: "Facture mise à jour avec succès.",
      invoice, // Retourne la facture mise à jour
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la facture:", error);
    res.status(500).json({ error: "Erreur interne du serveur.", details: error.message });
  }
});




module.exports = router; 