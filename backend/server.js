const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require('./routes/authroutes');
const courseRoutes = require('./routes/courseroutes');
const { errorHandler } = require('./middlewares/errorhandler');

require("dotenv").config();
const app = express();

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Hello World!" });
});

connectDB();

app.listen(3000, () => {
    console.log("Server started on port 3000");
});






// Base Route fallback
app.get('/', (req, res) => {
    res.send('API is running successfully...');
});

// Fallback Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server executing cleanly on port ${PORT}`);
});



module.exports = app;