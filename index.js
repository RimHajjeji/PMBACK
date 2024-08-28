const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

const app = express(); 

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://admin:admin12345678@cluster0.awqce.mongodb.net/PM", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use("/api/admin", require("./routes/admin"));
app.use("/api/clients", require("./routes/client"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/invoices", require("./routes/invoice")); // Add invoice route

app.listen(5000, () => {
    console.log("Server is Running on port 5000!!!");
});
