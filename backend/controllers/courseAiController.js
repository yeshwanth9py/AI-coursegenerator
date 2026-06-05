const Groq = require("groq-sdk");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

const dotenv = require("dotenv");
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ───────────────────────────────────────────────
   Groq helpers
   ─────────────────────────────────────────────── */

const TOKEN_LIMITS = { brief: 2048, standard: 4096, deep: 8192 };

/**
 * Send a structured JSON request to Groq.
 * @param {string} systemPrompt - instructions for the model
 * @param {string} userPrompt   - the user's request
 * @param {number} maxTokens    - response token budget
 */
async function askGroqForJSON(systemPrompt, userPrompt, maxTokens = 4096) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt },
    ],
    model: "openai/gpt-oss-20b",
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: maxTokens,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(raw);
}

/**
 * Send a chat-style request to Groq (plain text reply).
 */
async function askGroqForText(messages, maxTokens = 2048) {
  const completion = await groq.chat.completions.create({
    messages,
    model: "openai/gpt-oss-20b",
    temperature: 0.7,
    max_tokens: maxTokens,
  });
  return completion.choices[0]?.message?.content || "";
}

/**
 * Safely extract content blocks from an AI response.
 * Handles various response shapes the model might return.
 */
function extractContentBlocks(aiData) {
  if (Array.isArray(aiData)) {
    const blocks = [];
    aiData.forEach(item => {
      if (item?.contentBlocks && Array.isArray(item.contentBlocks)) {
        blocks.push(...item.contentBlocks);
      } else if (item?.type) {
        blocks.push(item);
      }
    });
    return blocks;
  }

  if (aiData && typeof aiData === "object") {
    const candidates = aiData.contentBlocks || aiData.content_blocks
                    || aiData.blocks || aiData.content;
    if (Array.isArray(candidates)) return candidates;
    if (aiData.type) return [aiData];
  }

  return [];
}

/* ───────────────────────────────────────────────
   POST /api/courses/generate
   Generate a full course skeleton (modules + lessons)
   ─────────────────────────────────────────────── */

const generateCourseContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.sub || req.user._id;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const systemPrompt = [
      "You are an expert curriculum designer.",
      "Output a JSON object with exactly these keys:",
      '  "title"       — a catchy course title',
      '  "description" — a short summary (1-2 sentences)',
      '  "tags"        — up to 5 topic tags (string array)',
      '  "modules"     — array of module objects, each containing:',
      '      "title"   — module title',
      '      "lessons" — array of objects, each with a "title" string',
    ].join("\n");

    const aiData = await askGroqForJSON(systemPrompt, prompt);

    const course = await Course.create({
      title:       aiData.title,
      description: aiData.description,
      tags:        aiData.tags || [],
      creator:     userId,
    });

    const moduleIds = [];

    for (const mod of (aiData.modules || [])) {
      const newModule = await Module.create({
        title:  mod.title,
        course: course._id,
      });

      const lessonIds = [];
      for (const les of (mod.lessons || [])) {
        const newLesson = await Lesson.create({
          title:   les.title,
          content: [],
          module:  newModule._id,
        });
        lessonIds.push(newLesson._id);
      }

      newModule.lessons = lessonIds;
      await newModule.save();
      moduleIds.push(newModule._id);
    }

    course.modules = moduleIds;
    await course.save();

    const populated = await Course.findById(course._id).populate({
      path: "modules",
      populate: { path: "lessons" },
    });

    res.status(201).json(populated);
  } catch (err) {
    console.error("Error generating course:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ───────────────────────────────────────────────
   POST /api/courses/lessons/:lessonId/enrich
   Generate detailed content for a lesson.
   Accepts optional `depth` in body: "brief" | "standard" | "deep"
   ─────────────────────────────────────────────── */

const enrichLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { depth = "standard" } = req.body;
    const userId = req.user.sub || req.user._id;

    const lesson = await Lesson.findById(lessonId).populate({
      path: "module",
      populate: { path: "course" },
    });

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const course = lesson.module.course;
    if (String(course.creator) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const maxTokens = TOKEN_LIMITS[depth] || TOKEN_LIMITS.standard;

    const depthInstructions = {
      brief: [
        "Keep it concise: 5-8 content blocks maximum.",
        "Cover only the key concepts with brief explanations.",
        "Include 1 MCQ quiz question at the end.",
      ],
      standard: [
        "Provide a balanced explanation: 10-15 content blocks.",
        "Include examples and code samples where relevant.",
        "Include 2-3 MCQ quiz questions at the end.",
      ],
      deep: [
        "Be exhaustive and thorough: 20+ content blocks.",
        "Include detailed explanations, multiple code examples, edge cases, and best practices.",
        "Include 4-5 MCQ quiz questions at the end.",
      ],
    };

    const instructions = depthInstructions[depth] || depthInstructions.standard;

    const systemPrompt = [
      "You are an expert educator creating lesson content.",
      "Output a JSON object with a \"contentBlocks\" array.",
      "Each block must be one of these types:",
      "",
      '  { "type": "heading",   "level": 2, "text": "..." }',
      '  { "type": "paragraph", "text": "..." }',
      '  { "type": "code",      "language": "javascript", "code": "..." }',
      '  { "type": "mcq",       "question": "...", "options": ["A","B","C","D"], "correctAnswer": 0 }',
      "",
      ...instructions,
      "",
      "IMPORTANT: Always finish with a complete conclusion paragraph.",
      "Never leave content incomplete or cut off mid-sentence.",
      "Every MCQ must have exactly 4 options and a correctAnswer index (0-3).",
    ].join("\n");

    const userPrompt = [
      `Create detailed lesson content for "${lesson.title}".`,
      `Module: "${lesson.module.title}"`,
      `Course: "${course.title}"`,
    ].join("\n");

    const aiData = await askGroqForJSON(systemPrompt, userPrompt, maxTokens);
    const blocks = extractContentBlocks(aiData);

    if (blocks.length === 0) {
      console.error("No blocks extracted from AI response:", aiData);
      return res.status(502).json({ error: "AI returned an unparseable response. Try again." });
    }

    lesson.content = blocks;
    lesson.isEnriched = true;
    lesson.markModified("content");
    await lesson.save();

    res.json(lesson);
  } catch (err) {
    console.error("Error enriching lesson:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ───────────────────────────────────────────────
   POST /api/courses/lessons/:lessonId/continue
   Continue generating content from where it left off
   ─────────────────────────────────────────────── */

const continueLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.sub || req.user._id;

    const lesson = await Lesson.findById(lessonId).populate({
      path: "module",
      populate: { path: "course" },
    });

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const course = lesson.module.course;
    if (String(course.creator) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const existingBlocks = lesson.content || [];
    const lastBlocks = existingBlocks.slice(-4);
    const contextSummary = lastBlocks.map(b => {
      if (b.type === "heading")   return `[Heading] ${b.text}`;
      if (b.type === "paragraph") return `[Text] ${(b.text || "").substring(0, 120)}...`;
      if (b.type === "code")      return `[Code block in ${b.language || "unknown"}]`;
      if (b.type === "mcq")       return `[Quiz: ${b.question}]`;
      return `[${b.type || "unknown"}]`;
    }).join("\n");

    const systemPrompt = [
      "You are continuing a lesson that was previously started.",
      'Output a JSON object with a "contentBlocks" array.',
      "Continue naturally from where the previous content ended.",
      "Do NOT repeat any content that was already covered.",
      "Add 8-12 more content blocks covering the next topics.",
      "End with a conclusion paragraph.",
      "Use the same block format: heading, paragraph, code, mcq.",
    ].join("\n");

    const userPrompt = [
      `Continue the lesson "${lesson.title}" in course "${course.title}".`,
      "",
      "Here is what was covered so far:",
      contextSummary,
      "",
      "Continue from here with new content.",
    ].join("\n");

    const aiData = await askGroqForJSON(systemPrompt, userPrompt, 4096);
    const newBlocks = extractContentBlocks(aiData);

    if (newBlocks.length === 0) {
      return res.status(502).json({ error: "AI could not generate continuation. Try again." });
    }

    lesson.content = [...existingBlocks, ...newBlocks];
    lesson.markModified("content");
    await lesson.save();

    res.json(lesson);
  } catch (err) {
    console.error("Error continuing lesson:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ───────────────────────────────────────────────
   POST /api/courses/lessons/:lessonId/generate-quiz
   Generate MCQ questions from existing lesson content
   ─────────────────────────────────────────────── */

const generateQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.sub || req.user._id;

    const lesson = await Lesson.findById(lessonId).populate({
      path: "module",
      populate: { path: "course" },
    });

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const course = lesson.module.course;
    if (String(course.creator) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!lesson.content || lesson.content.length === 0) {
      return res.status(400).json({ error: "Lesson has no content to generate quiz from." });
    }

    const textContent = lesson.content
      .filter(b => b.type === "paragraph" || b.type === "heading")
      .map(b => b.text || "")
      .join("\n");

    const systemPrompt = [
      "You are a quiz generator. Based on the provided lesson content,",
      "create exactly 5 multiple-choice questions.",
      'Output a JSON object with a "questions" array.',
      "Each question must have:",
      '  "question"      — the question text',
      '  "options"       — array of exactly 4 option strings',
      '  "correctAnswer" — index (0-3) of the correct option',
      '  "explanation"   — brief explanation of why the answer is correct',
    ].join("\n");

    const userPrompt = [
      `Generate a quiz for the lesson "${lesson.title}".`,
      "",
      "Lesson content:",
      textContent.substring(0, 3000),
    ].join("\n");

    const aiData = await askGroqForJSON(systemPrompt, userPrompt, 2048);
    const questions = aiData.questions || aiData.quiz || [];

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(502).json({ error: "AI could not generate quiz questions." });
    }

    res.json({ questions });
  } catch (err) {
    console.error("Error generating quiz:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ───────────────────────────────────────────────
   POST /api/courses/lessons/:lessonId/chat
   Chat with AI about the lesson content
   ─────────────────────────────────────────────── */

const chatAboutLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { message, history = [] } = req.body;
    const userId = req.user.sub || req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const lesson = await Lesson.findById(lessonId).populate({
      path: "module",
      populate: { path: "course" },
    });

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const course = lesson.module.course;
    if (String(course.creator) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const contentSummary = (lesson.content || [])
      .filter(b => b.type === "paragraph" || b.type === "heading")
      .map(b => b.text || "")
      .join("\n")
      .substring(0, 2000);

    const systemMessage = {
      role: "system",
      content: [
        `You are a helpful tutor for the lesson "${lesson.title}"`,
        `in the module "${lesson.module.title}" of the course "${course.title}".`,
        "",
        "Here is a summary of the lesson content:",
        contentSummary,
        "",
        "Answer the student's questions based on this lesson content.",
        "Be concise, clear, and encouraging.",
        "If the question is outside the lesson scope, politely note that",
        "and still try to help if possible.",
      ].join("\n"),
    };

    const recentHistory = history.slice(-6).map(msg => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    const messages = [
      systemMessage,
      ...recentHistory,
      { role: "user", content: message },
    ];

    const reply = await askGroqForText(messages, 1024);

    res.json({ reply });
  } catch (err) {
    console.error("Error in lesson chat:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  generateCourseContent,
  enrichLesson,
  continueLesson,
  generateQuiz,
  chatAboutLesson,
};