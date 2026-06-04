const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require('./routes/authroutes');
const courseRoutes = require('./routes/courseroutes');
const { errorHandler } = require('./middlewares/errorhandler');

const app = express();
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Hello World!" });
});

// Fallback Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server executing cleanly on port ${PORT}`);
});

module.exports = app;