const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const multer = require('multer');
const app = express(); // Use express() to create an app instance

app.use(cors());

mongoose.connect("mongodb+srv://admin:admin12345678@cluster0.awqce.mongodb.net/PM", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.listen(5000, () => {
    console.log("Server is Running on port 5000!!!");
});
