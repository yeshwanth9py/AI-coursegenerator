const { Router } = require("express");
const {
  addSuggestedVideos,
  chatAboutLesson,
  generateFlashcards,
  generateLesson,
  generatePracticeLab,
  generateQuiz,
} = require("../../controllers/courseAiController");
const {
  saveQuizResult,
  updateLessonProgress,
} = require("../../controllers/courseController");

const router = Router();

// Lesson state
router.patch("/:lessonId/progress", updateLessonProgress);
router.post("/:lessonId/quiz-result", saveQuizResult);

// Lesson generation
router.post("/:lessonId/generate", generateLesson);
router.post("/:lessonId/add-videos", addSuggestedVideos);

// Study tools
router.post("/:lessonId/generate-quiz", generateQuiz);
router.post("/:lessonId/flashcards", generateFlashcards);
router.post("/:lessonId/practice-lab", generatePracticeLab);
router.post("/:lessonId/chat", chatAboutLesson);

module.exports = router;
