const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");
const { errorHandler } = require("./middlewares/handleErrors");

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use("/api", apiRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "CourseAI API is running" });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
