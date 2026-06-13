const { Router } = require("express");
const {
  addSuggestedVideos,
  chatAboutLesson,
  enrichLesson,
  enrichLessonStream,
  generateFlashcards,
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

// Content enrichment
router.post("/:lessonId/enrich", enrichLesson);
router.post("/:lessonId/enrich-stream", enrichLessonStream);
router.post("/:lessonId/add-videos", addSuggestedVideos);

// Study tools
router.post("/:lessonId/generate-quiz", generateQuiz);
router.post("/:lessonId/flashcards", generateFlashcards);
router.post("/:lessonId/practice-lab", generatePracticeLab);
router.post("/:lessonId/chat", chatAboutLesson);

module.exports = router;
