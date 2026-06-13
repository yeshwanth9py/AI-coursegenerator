const { generateJson } = require("./groqService");

const MAX_NARRATION_CHARACTERS = 16000;
const MAX_CHUNK_CHARACTERS = 900;
const SUPPORTED_TRANSLATION_LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Kannada",
  "Malayalam",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "Nepali",
  "Japanese",
  "Korean",
  "Mandarin Chinese",
  "Arabic",
  "Portuguese",
  "Italian",
  "Russian",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Dutch",
  "Turkish",
  "Polish",
];

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function speakableParts(lesson) {
  const parts = [cleanText(lesson.title)];

  for (const block of lesson.content || []) {
    if (!block || typeof block !== "object") continue;

    if (block.type === "heading" || block.type === "paragraph") {
      parts.push(cleanText(block.text));
    } else if (block.type === "list") {
      parts.push(...(Array.isArray(block.items) ? block.items.map(cleanText) : []));
    } else if (block.type === "callout") {
      parts.push(cleanText(block.title), cleanText(block.text));
    }
  }

  return parts.filter(Boolean);
}

function narrationChunks(lesson) {
  const chunks = [];
  let current = "";
  let totalCharacters = 0;

  for (const part of speakableParts(lesson)) {
    if (totalCharacters >= MAX_NARRATION_CHARACTERS) break;

    let remainingText = part.slice(0, MAX_NARRATION_CHARACTERS - totalCharacters);

    while (remainingText && totalCharacters < MAX_NARRATION_CHARACTERS) {
      const separatorLength = current ? 1 : 0;
      const available = MAX_CHUNK_CHARACTERS - current.length - separatorLength;

      if (remainingText.length <= available) {
        current = current ? `${current} ${remainingText}` : remainingText;
        break;
      }

      if (current) {
        chunks.push(current);
        totalCharacters += current.length;
        current = "";
        continue;
      }

      const lastSpace = remainingText.lastIndexOf(" ", MAX_CHUNK_CHARACTERS);
      const splitAt = lastSpace > MAX_CHUNK_CHARACTERS / 2
        ? lastSpace
        : MAX_CHUNK_CHARACTERS;
      const chunk = remainingText.slice(0, splitAt).trim();
      chunks.push(chunk);
      totalCharacters += chunk.length;
      remainingText = remainingText.slice(splitAt).trim();
    }
  }

  if (current && totalCharacters < MAX_NARRATION_CHARACTERS) {
    chunks.push(current.slice(0, MAX_NARRATION_CHARACTERS - totalCharacters));
  }
  return chunks;
}

function sameLanguage(first, second) {
  return cleanText(first).toLocaleLowerCase() === cleanText(second).toLocaleLowerCase();
}

async function createLessonNarration(lesson, requestedLanguage) {
  const sourceLanguage = cleanText(lesson.language) || "English";
  const requestedTarget = cleanText(requestedLanguage).slice(0, 80);
  const targetLanguage = requestedTarget
    ? SUPPORTED_TRANSLATION_LANGUAGES.find((language) => sameLanguage(language, requestedTarget))
    : sourceLanguage;
  const chunks = narrationChunks(lesson);

  if (!targetLanguage) {
    const error = new Error("That narration language is not supported.");
    error.statusCode = 400;
    throw error;
  }

  if (!chunks.length) {
    const error = new Error("Generate lesson content before creating narration.");
    error.statusCode = 400;
    throw error;
  }

  if (sameLanguage(sourceLanguage, targetLanguage)) {
    return {
      chunks,
      sourceLanguage,
      targetLanguage: sourceLanguage,
      translated: false,
    };
  }

  const result = await generateJson(
    `
Translate lesson narration from ${sourceLanguage} to ${targetLanguage}.
Return JSON with one "chunks" array containing exactly ${chunks.length} translated strings.
Keep the same order and meaning. Preserve technical names, formulas, and code identifiers.
Write natural spoken ${targetLanguage}. Do not add commentary, markdown, labels, or extra chunks.
    `.trim(),
    JSON.stringify({ chunks }),
    7000,
  );

  const translatedChunks = Array.isArray(result.chunks)
    ? result.chunks.map(cleanText).filter(Boolean)
    : [];

  if (translatedChunks.length !== chunks.length) {
    const error = new Error("AI could not translate this lesson narration. Please try again.");
    error.statusCode = 502;
    throw error;
  }

  return {
    chunks: translatedChunks,
    sourceLanguage,
    targetLanguage,
    translated: true,
  };
}

module.exports = { createLessonNarration, narrationChunks };
