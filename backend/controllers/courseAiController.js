const Groq = require("groq-sdk");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

const dotenv = require("dotenv");
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TOKEN_LIMITS = { brief: 1600, standard: 3200, deep: 5000 };
const VALID_DEPTHS = new Set(Object.keys(TOKEN_LIMITS));
const GROQ_TPM_LIMIT = Number(process.env.GROQ_TPM_LIMIT) || 8000;
const GROQ_TOKEN_RESERVE = 600;
const GROQ_REASONING_EFFORT = ["low", "medium", "high"].includes(process.env.GROQ_REASONING_EFFORT)
  ? process.env.GROQ_REASONING_EFFORT
  : "low";
const MAX_PROMPT_LENGTH = 2000;
const MAX_TEXT_BLOCK_LENGTH = 5000;
const MAX_CODE_BLOCK_LENGTH = 10000;
const MAX_VIDEO_BLOCKS = 3;

class RequestError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function getUserId(req) {
  return req.user?.sub || req.user?._id;
}

function sanitizeText(value, maxLength = 1000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeLanguage(value) {
  return sanitizeText(value, 80) || "English";
}

function extractYouTubeVideoId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = String(url).match(pattern);
    if (match) return match[1];
  }

  return null;
}

function buildHttpError(statusCode, message) {
  return new RequestError(statusCode, message);
}

function handleControllerError(res, label, err) {
  console.error(label, err);

  if (err instanceof RequestError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err?.name === "CastError") {
    return res.status(400).json({ error: "Invalid id provided." });
  }

  if (err?.status === 413 || err?.status === 429 || err?.error?.code === "rate_limit_exceeded") {
    return res.status(429).json({
      error: "AI token limit reached. Please wait a few seconds and try again.",
    });
  }

  return res.status(500).json({ error: "Internal Server Error" });
}

function getSafeGroqMaxTokens(messages, requestedMaxTokens) {
  const estimatedInputTokens = messages.reduce((total, message) => {
    const content = typeof message?.content === "string" ? message.content : "";
    return total + Math.ceil(content.length / 2) + 12;
  }, 0);

  const availableOutputTokens = GROQ_TPM_LIMIT - estimatedInputTokens - GROQ_TOKEN_RESERVE;
  return Math.max(256, Math.min(requestedMaxTokens, availableOutputTokens));
}

async function askGroqForJSON(systemPrompt, userPrompt, maxTokens = 4096) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
  const safeMaxTokens = getSafeGroqMaxTokens(messages, maxTokens);

  const completion = await groq.chat.completions.create({
    messages,
    model: "openai/gpt-oss-20b",
    response_format: { type: "json_object" },
    reasoning_effort: GROQ_REASONING_EFFORT,
    temperature: 0.5,
    max_tokens: safeMaxTokens,
  });

  const raw = completion.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Invalid JSON returned by AI:", raw);
    throw buildHttpError(502, "AI returned invalid JSON. Please try again.");
  }
}

async function askGroqForText(messages, maxTokens = 2048) {
  const safeMaxTokens = getSafeGroqMaxTokens(messages, maxTokens);

  const completion = await groq.chat.completions.create({
    messages,
    model: "openai/gpt-oss-20b",
    reasoning_effort: GROQ_REASONING_EFFORT,
    temperature: 0.7,
    max_tokens: safeMaxTokens,
  });

  return completion.choices[0]?.message?.content || "";
}

async function loadAuthorizedLesson(lessonId, userId) {
  if (!userId) {
    throw buildHttpError(401, "Unauthorized");
  }

  const lesson = await Lesson.findById(lessonId).populate({
    path: "module",
    populate: { path: "course" },
  });

  if (!lesson) {
    throw buildHttpError(404, "Lesson not found");
  }

  if (!lesson.module || !lesson.module.course) {
    throw buildHttpError(404, "Lesson is not attached to a valid course");
  }

  const course = lesson.module.course;
  if (String(course.creator) !== String(userId)) {
    throw buildHttpError(403, "Forbidden");
  }

  return { lesson, course, moduleDoc: lesson.module };
}

function normalizeCourseAIData(aiData) {
  const title = sanitizeText(aiData?.title, 160);
  const description = sanitizeText(aiData?.description, 600);
  const tags = Array.isArray(aiData?.tags)
    ? aiData.tags.map((tag) => sanitizeText(tag, 40)).filter(Boolean).slice(0, 5)
    : [];

  const modules = Array.isArray(aiData?.modules)
    ? aiData.modules.map((mod) => ({
      title: sanitizeText(mod?.title, 160),
      lessons: Array.isArray(mod?.lessons)
        ? mod.lessons.map((lesson) => ({ title: sanitizeText(lesson?.title, 160) })).filter((lesson) => lesson.title)
        : [],
    })).filter((mod) => mod.title && mod.lessons.length > 0)
    : [];

  if (!title || !description || modules.length === 0) {
    throw buildHttpError(502, "AI returned an incomplete course outline. Please try again.");
  }

  return { title, description, tags, modules };
}

function normalizeLessonContentBlocks(aiData) {
  const candidates = Array.isArray(aiData)
    ? aiData
    : aiData?.contentBlocks || aiData?.content_blocks || aiData?.blocks || aiData?.content || [];

  if (!Array.isArray(candidates)) return [];

  return candidates.map((block) => {
    if (!block || typeof block !== "object") return null;

    if (block.type === "heading") {
      const text = sanitizeText(block.text, 300);
      if (!text) return null;
      return { type: "heading", level: Number(block.level) === 3 ? 3 : 2, text };
    }

    if (block.type === "paragraph") {
      const text = sanitizeText(block.text, MAX_TEXT_BLOCK_LENGTH);
      if (!text) return null;
      return { type: "paragraph", text };
    }

    if (block.type === "code") {
      const code = sanitizeText(block.code, MAX_CODE_BLOCK_LENGTH);
      if (!code) return null;
      return {
        type: "code",
        language: sanitizeText(block.language, 40) || "text",
        code,
      };
    }

    return null;
  }).filter(Boolean);
}

function lessonTextSummary(lesson, maxLength = 3000) {
  return (lesson.content || [])
    .filter((block) => block?.type === "paragraph" || block?.type === "heading")
    .map((block) => sanitizeText(block.text, 1000))
    .filter(Boolean)
    .join("\n")
    .slice(0, maxLength);
}

function normalizeQuizQuestions(aiData) {
  const candidates = aiData?.questions || aiData?.quiz || [];
  if (!Array.isArray(candidates)) return [];

  return candidates.map((item) => {
    const question = sanitizeText(item?.question, 500);
    const options = Array.isArray(item?.options)
      ? item.options.map((option) => sanitizeText(
        typeof option === "string" ? option : option?.text || option?.label,
        250,
      )).filter(Boolean).slice(0, 4)
      : [];
    const correctAnswer = Number(item?.correctAnswer);
    const explanation = sanitizeText(item?.explanation, 700);

    if (!question || options.length !== 4 || !Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
      return null;
    }

    return { question, options, correctAnswer, explanation };
  }).filter(Boolean).slice(0, 5);
}

function normalizeVideoSuggestions(aiData) {
  const candidates = aiData?.videos || aiData?.suggestions || [];
  if (!Array.isArray(candidates)) return [];

  return candidates.map((item) => {
    const title = sanitizeText(item?.title, 180);
    const searchQuery = sanitizeText(item?.searchQuery || item?.query, 220);
    const reason = sanitizeText(item?.reason, 500);

    if (!title || !searchQuery) return null;
    return { title, searchQuery, reason };
  }).filter(Boolean).slice(0, 5);
}

function decodeYouTubeText(value) {
  if (!value) return "";

  return String(value)
    .replace(/\\u0026/g, "&")
    .replace(/\\"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

async function searchYouTubeWithApi(suggestions) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || typeof fetch !== "function") return [];

  const videos = [];
  const seen = new Set();

  for (const suggestion of suggestions.slice(0, 3)) {
    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "2",
      q: suggestion.searchQuery,
      key: apiKey,
      safeSearch: "moderate",
      relevanceLanguage: "en",
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
    if (!response.ok) continue;

    const data = await response.json();
    for (const item of data.items || []) {
      const videoId = item?.id?.videoId;
      if (!videoId || seen.has(videoId)) continue;
      seen.add(videoId);

      videos.push({
        title: sanitizeText(item?.snippet?.title, 180) || suggestion.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        channelTitle: sanitizeText(item?.snippet?.channelTitle, 120),
        description: sanitizeText(item?.snippet?.description, 300),
        thumbnail: item?.snippet?.thumbnails?.medium?.url || item?.snippet?.thumbnails?.default?.url || "",
        reason: suggestion.reason,
        source: "youtube",
      });
    }
  }

  return videos.slice(0, 5);
}

async function searchYouTubeWithoutApi(suggestions) {
  if (typeof fetch !== "function") return [];

  const videos = [];
  const seen = new Set();

  for (const suggestion of suggestions.slice(0, 3)) {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(suggestion.searchQuery)}`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) continue;

    const html = await response.text();
    const matches = html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
    let addedForSuggestion = 0;

    for (const match of matches) {
      const videoId = match[1];
      if (!videoId || seen.has(videoId)) continue;

      const nearby = html.slice(match.index, match.index + 1600);
      const titleMatch = nearby.match(/"title":\{"runs":\[\{"text":"([^"]+)"/)
        || nearby.match(/"title":\{"simpleText":"([^"]+)"/);

      seen.add(videoId);
      addedForSuggestion += 1;

      videos.push({
        title: sanitizeText(decodeYouTubeText(titleMatch?.[1]) || suggestion.title, 180),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        channelTitle: "",
        description: "",
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        reason: suggestion.reason,
        source: "youtube-search",
      });

      if (addedForSuggestion >= 2 || videos.length >= 5) break;
    }

    if (videos.length >= 5) break;
  }

  return videos.slice(0, 5);
}

async function searchYouTubeVideos(suggestions) {
  const apiVideos = await searchYouTubeWithApi(suggestions).catch((err) => {
    console.error("YouTube API search failed:", err);
    return [];
  });

  if (apiVideos.length > 0) return apiVideos;

  return searchYouTubeWithoutApi(suggestions).catch((err) => {
    console.error("YouTube search fallback failed:", err);
    return [];
  });
}

async function buildVideoSuggestionsForLesson(lesson, course, moduleDoc) {
  const contentSummary = lessonTextSummary(lesson, 2500);

  const systemPrompt = [
    "You are helping a teacher find relevant YouTube videos for a lesson.",
    'Output only a JSON object with a "suggestions" array.',
    "Return 3-5 suggestions. Each suggestion must have:",
    '  "title": a clear video topic title',
    '  "searchQuery": a precise YouTube search query',
    '  "reason": why this video would help the learner',
    "Prefer reputable educational channels, current tutorials, and videos that match the lesson level.",
    "Do not invent YouTube video IDs or fake URLs.",
  ].join("\n");

  const userPrompt = [
    `Lesson: "${lesson.title}"`,
    `Module: "${moduleDoc.title}"`,
    `Course: "${course.title}"`,
    "",
    "Lesson content summary:",
    contentSummary || "No generated content yet. Use the lesson title, module, and course to infer the topic.",
  ].join("\n");

  const aiData = await askGroqForJSON(systemPrompt, userPrompt, 2048);
  const suggestions = normalizeVideoSuggestions(aiData);

  if (suggestions.length === 0) {
    throw buildHttpError(502, "AI could not suggest relevant video searches. Try again.");
  }

  return suggestions;
}

const generateCourseContent = async (req, res) => {
  const created = { course: null, modules: [], lessons: [] };

  try {
    const prompt = sanitizeText(req.body?.prompt, MAX_PROMPT_LENGTH);
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const systemPrompt = [
      "You are an expert curriculum designer.",
      "Output only a JSON object with exactly these keys:",
      '  "title": a catchy course title',
      '  "description": a short summary in 1-2 sentences',
      '  "tags": up to 5 topic tags as strings',
      '  "modules": array of module objects',
      "Each module must contain:",
      '  "title": module title',
      '  "lessons": array of objects, each with a "title" string',
      "Do not include quizzes, MCQs, videos, lesson body content, or markdown.",
      "If the user asks for a specific language, write the course outline in that language.",
      "Otherwise, use the same language as the user's prompt.",
    ].join("\n");

    const aiData = await askGroqForJSON(systemPrompt, prompt);
    const normalized = normalizeCourseAIData(aiData);

    const course = await Course.create({
      title: normalized.title,
      description: normalized.description,
      tags: normalized.tags,
      creator: userId,
    });
    created.course = course;

    const moduleIds = [];

    for (const mod of normalized.modules) {
      const newModule = await Module.create({
        title: mod.title,
        course: course._id,
      });
      created.modules.push(newModule._id);

      const lessonIds = [];
      for (const les of mod.lessons) {
        const newLesson = await Lesson.create({
          title: les.title,
          content: [],
          module: newModule._id,
        });
        created.lessons.push(newLesson._id);
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

    return res.status(201).json(populated);
  } catch (err) {
    if (created.course) {
      await Lesson.deleteMany({ _id: { $in: created.lessons } }).catch((cleanupErr) => {
        console.error("Failed to clean up lessons after course generation error:", cleanupErr);
      });
      await Module.deleteMany({ _id: { $in: created.modules } }).catch((cleanupErr) => {
        console.error("Failed to clean up modules after course generation error:", cleanupErr);
      });
      await Course.deleteOne({ _id: created.course._id }).catch((cleanupErr) => {
        console.error("Failed to clean up course after course generation error:", cleanupErr);
      });
    }

    return handleControllerError(res, "Error generating course:", err);
  }
};

const enrichLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const depth = sanitizeText(req.body?.depth, 20) || "standard";
    const language = normalizeLanguage(req.body?.language);
    const safeDepth = VALID_DEPTHS.has(depth) ? depth : "standard";
    const userId = getUserId(req);
    const { lesson, course, moduleDoc } = await loadAuthorizedLesson(lessonId, userId);
    const maxTokens = TOKEN_LIMITS[safeDepth] || TOKEN_LIMITS.standard;

    const depthInstructions = {
      brief: [
        "Keep it concise: 5-8 content blocks maximum.",
        "Cover only the key concepts with brief explanations.",
      ],
      standard: [
        "Provide a balanced explanation: 8-12 content blocks.",
        "Include examples and code samples where relevant.",
      ],
      deep: [
        "Be thorough but focused: 14-18 content blocks.",
        "Include detailed explanations, multiple code examples, edge cases, and best practices.",
      ],
    };

    const systemPrompt = [
      "You are an expert educator creating lesson content.",
      'Output only a JSON object with a "contentBlocks" array.',
      "Allowed block types are exactly:",
      '  { "type": "heading", "level": 2, "text": "..." }',
      '  { "type": "paragraph", "text": "..." }',
      '  { "type": "code", "language": "javascript", "code": "..." }',
      "",
      ...depthInstructions[safeDepth],
      "",
      `Write the lesson in ${language}.`,
      "Keep programming language names, API names, package names, and code syntax unchanged.",
      "Do not include quizzes, MCQs, quiz questions, answer options, or video blocks.",
      "Always finish with a complete conclusion paragraph.",
      "Never leave content incomplete or cut off mid-sentence.",
    ].join("\n");

    const userPrompt = [
      `Create detailed lesson content for "${lesson.title}".`,
      `Module: "${moduleDoc.title}"`,
      `Course: "${course.title}"`,
      `Language: "${language}"`,
    ].join("\n");

    const aiData = await askGroqForJSON(systemPrompt, userPrompt, maxTokens);
    const blocks = normalizeLessonContentBlocks(aiData);

    if (blocks.length === 0) {
      return res.status(502).json({ error: "AI returned no valid lesson content. Try again." });
    }

    lesson.content = blocks;
    lesson.isEnriched = true;
    lesson.markModified("content");
    await lesson.save();

    return res.json(lesson);
  } catch (err) {
    return handleControllerError(res, "Error enriching lesson:", err);
  }
};

const generateQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = getUserId(req);
    const { lesson } = await loadAuthorizedLesson(lessonId, userId);

    if (!lesson.content || lesson.content.length === 0) {
      return res.status(400).json({ error: "Lesson has no content to generate quiz from." });
    }

    const textContent = lessonTextSummary(lesson, 3000);
    if (!textContent) {
      return res.status(400).json({ error: "Lesson has no text content to generate quiz from." });
    }

    const systemPrompt = [
      "You are a quiz generator. Based on the provided lesson content, create exactly 5 multiple-choice questions.",
      'Output only a JSON object with a "questions" array.',
      "Each question must have:",
      '  "question": the question text',
      '  "options": array of exactly 4 option strings',
      '  "correctAnswer": index from 0 to 3 of the correct option',
      '  "explanation": brief explanation of why the answer is correct',
      "Write the quiz in the same language as the lesson content.",
    ].join("\n");

    const userPrompt = [
      `Generate a quiz for the lesson "${lesson.title}".`,
      "",
      "Lesson content:",
      textContent,
    ].join("\n");

    const aiData = await askGroqForJSON(systemPrompt, userPrompt, 2048);
    const questions = normalizeQuizQuestions(aiData);

    if (questions.length !== 5) {
      return res.status(502).json({ error: "AI could not generate 5 valid quiz questions. Try again." });
    }

    return res.json({ questions });
  } catch (err) {
    return handleControllerError(res, "Error generating quiz:", err);
  }
};

const addSuggestedVideos = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const requestedCount = Number(req.body?.count) || MAX_VIDEO_BLOCKS;
    const count = Math.min(Math.max(requestedCount, 1), MAX_VIDEO_BLOCKS);
    const userId = getUserId(req);
    const { lesson, course, moduleDoc } = await loadAuthorizedLesson(lessonId, userId);
    const suggestions = await buildVideoSuggestionsForLesson(lesson, course, moduleDoc);
    const videos = await searchYouTubeVideos(suggestions);

    if (videos.length === 0) {
      return res.status(502).json({ error: "Could not find playable YouTube videos right now. Try again." });
    }

    const existingVideoIds = new Set(
      (lesson.content || [])
        .filter((block) => block?.type === "video")
        .map((block) => extractYouTubeVideoId(block.url || block.src))
        .filter(Boolean),
    );

    const videoBlocks = videos
      .filter((video) => {
        const videoId = extractYouTubeVideoId(video.url);
        if (!videoId || existingVideoIds.has(videoId)) return false;
        existingVideoIds.add(videoId);
        return true;
      })
      .slice(0, count)
      .map((video) => ({
        type: "video",
        url: video.url,
        title: video.channelTitle ? `${video.title} - ${video.channelTitle}` : video.title,
      }));

    if (videoBlocks.length === 0) {
      return res.status(409).json({ error: "Relevant videos are already added to this lesson." });
    }

    lesson.content = [...(lesson.content || []), ...videoBlocks];
    lesson.markModified("content");
    await lesson.save();

    return res.json({ lesson, videos: videoBlocks });
  } catch (err) {
    return handleControllerError(res, "Error adding lesson videos:", err);
  }
};

const chatAboutLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const message = sanitizeText(req.body?.message, 2000);
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const userId = getUserId(req);

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const { lesson, course, moduleDoc } = await loadAuthorizedLesson(lessonId, userId);
    const contentSummary = lessonTextSummary(lesson, 2000);

    const systemMessage = {
      role: "system",
      content: [
        `You are a helpful tutor for the lesson "${lesson.title}"`,
        `in the module "${moduleDoc.title}" of the course "${course.title}".`,
        "",
        "Here is a summary of the lesson content:",
        contentSummary || "No detailed lesson content has been generated yet.",
        "",
        "Answer the student's questions based on this lesson content.",
        "Answer in the same language the student uses. If the language is unclear, use the lesson content language.",
        "Be concise, clear, and encouraging.",
        "If the question is outside the lesson scope, politely note that and still try to help if possible.",
      ].join("\n"),
    };

    const recentHistory = history.slice(-6).map((msg) => ({
      role: msg?.role === "user" ? "user" : "assistant",
      content: sanitizeText(msg?.content, 1000),
    })).filter((msg) => msg.content);

    const messages = [
      systemMessage,
      ...recentHistory,
      { role: "user", content: message },
    ];

    const reply = await askGroqForText(messages, 1024);

    return res.json({ reply });
  } catch (err) {
    return handleControllerError(res, "Error in lesson chat:", err);
  }
};

module.exports = {
  generateCourseContent,
  enrichLesson,
  generateQuiz,
  addSuggestedVideos,
  chatAboutLesson,
};
