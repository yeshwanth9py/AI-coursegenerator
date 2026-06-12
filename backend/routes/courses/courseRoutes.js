const { Router } = require("express");
const { generateCourseContent } = require("../../controllers/courseAiController");
const {
  deleteCourse,
  getCourseById,
  getLessonView,
  getMyCourses,
  updateSharing,
} = require("../../controllers/courseController");

const router = Router();

router.post("/generate", generateCourseContent);
router.get("/mine", getMyCourses);

router.get("/:courseId/lessons/:lessonId", getLessonView);
router.patch("/:courseId/sharing", updateSharing);

router.route("/:courseId")
  .get(getCourseById)
  .delete(deleteCourse);

module.exports = router;
