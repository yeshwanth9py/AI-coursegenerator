const { Router } = require("express");
const { getPublicCourse } = require("../controllers/courseController");

const router = Router();

router.get("/courses/:shareId", getPublicCourse);

module.exports = router;
