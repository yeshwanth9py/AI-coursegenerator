const { Router } = require("express");
const authRoutes = require("./auth");
const courseRoutes = require("./courses");
const publicRoutes = require("./public");

const router = Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/public", publicRoutes);

module.exports = router;
