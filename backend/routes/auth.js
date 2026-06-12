const { Router } = require("express");
const {
  auth0Sync,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} = require("../controllers/authController");
const { verifyAuth0Token } = require("../middlewares/auth0Auth");
const { protect } = require("../middlewares/sessionAuth");

const router = Router();

// Email and password authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// External identity authentication
router.post("/auth0-sync", verifyAuth0Token, auth0Sync);

// Current session
router.get("/me", protect, getCurrentUser);
router.post("/logout", logoutUser);

module.exports = router;
