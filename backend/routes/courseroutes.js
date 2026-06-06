const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authmiddleware");
const courseController = require("../controllers/courseController");
const {
  generateCourseContent,
  enrichLesson,
  generateQuiz,
  addSuggestedVideos,
  chatAboutLesson,
} = require("../controllers/courseAiController");

/* ── Course CRUD ─────────────────────────────── */
router.post("/",                   protect, courseController.createCourse);
router.get("/mine",                protect, courseController.getMyCourses);
router.get("/:courseId",           protect, courseController.getCourseById);
router.delete("/:courseId",        protect, courseController.deleteCourse);

/* ── Module / Lesson management ──────────────── */
router.post("/:courseId/modules",          protect, courseController.addModuleToCourse);
router.post("/modules/:moduleId/lessons",  protect, courseController.addLessonToModule);
router.patch("/lessons/:lessonId/content", protect, courseController.addContentBlock);

/* ── AI-powered endpoints ────────────────────── */
router.post("/generate",                       protect, generateCourseContent);
router.post("/lessons/:lessonId/enrich",        protect, enrichLesson);
router.post("/lessons/:lessonId/generate-quiz", protect, generateQuiz);
router.post("/lessons/:lessonId/add-videos",    protect, addSuggestedVideos);
router.post("/lessons/:lessonId/chat",          protect, chatAboutLesson);

module.exports = router;
