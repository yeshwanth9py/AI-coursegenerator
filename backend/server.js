const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require('./routes/authroutes');
const courseRoutes = require('./routes/courseroutes');
const { errorHandler } = require('./middlewares/errorhandler');
const main = require("./services/aiservice");

const app = express();
app.use(express.json());

const dotenv = require("dotenv");
dotenv.config();

connectDB();


console.log(process.env.GROQ_API_KEY);

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