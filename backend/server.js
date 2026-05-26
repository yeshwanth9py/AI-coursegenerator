const express = require("express");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Hello World!" });
});

connectDB();

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

module.exports = app;