const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authmiddleware");
const courseController = require("../controllers/courseController");
const { generateCourseContent, enrichLesson } = require("../controllers/courseAiController");


router.post("/", protect, courseController.createCourse);
router.get("/mine", protect, courseController.getMyCourses);
router.get("/:courseId", protect, courseController.getCourseById);
router.delete("/:courseId", protect, courseController.deleteCourse);
router.post("/:courseId/modules", protect, courseController.addModuleToCourse);
router.post("/modules/:moduleId/lessons", protect, courseController.addLessonToModule);


router.post("/generate", protect, generateCourseContent);
router.post("/lessons/:lessonId/enrich", protect, enrichLesson);


module.exports = router;