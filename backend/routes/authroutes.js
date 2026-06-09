const { Router } = require("express");
const {
  registerUser,
  loginUser,
  auth0Sync,
  getCurrentUser,
  logoutUser,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authmiddleware");
const { verifyAuth0Token } = require("../middlewares/auth0middleware");

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/auth0-sync", verifyAuth0Token, auth0Sync);
router.get("/me", protect, getCurrentUser);
router.post("/logout", logoutUser);

module.exports = router;
