const { Router } = require("express");
const { protect } = require("../../middlewares/sessionAuth");
const courseRoutes = require("./courseRoutes");
const lessonRoutes = require("./lessonRoutes");

const router = Router();

router.use(protect);
router.use("/lessons", lessonRoutes);
router.use("/", courseRoutes);

module.exports = router;
