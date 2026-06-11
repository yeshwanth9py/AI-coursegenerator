const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authroutes");
const courseRoutes = require("./routes/courseroutes");
const { errorHandler } = require("./middlewares/errorhandler");
const customRateLimiter = require("./utils/rateLimiter");

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use("/api", customRateLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

app.get("/", (req, res) => {
  res.json({ message: "CourseAI API is running" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(process.env.FRONTEND_URL);
    console.log(`Server listening on port ${PORT}`);
  });
});

module.exports = app;
