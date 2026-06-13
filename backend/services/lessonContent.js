const LESSON_DEPTHS = {
  brief: { words: "700-1000", blocks: 5, characters: 2000, maxTokens: 3000 },
  standard: { words: "1100-1600", blocks: 6, characters: 3500, maxTokens: 5000 },
  deep: { words: "1800-2600", blocks: 8, characters: 6000, maxTokens: 7000 },
};

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function formatBlock(block) {
  if (!block || typeof block !== "object") return null;

  if (block.type === "heading") {
    return {
      type: "heading",
      level: block.level === 3 ? 3 : 2,
      text: cleanText(block.text, 300),
    };
  }

  if (block.type === "paragraph") {
    return { type: "paragraph", text: cleanText(block.text, 5000) };
  }

  if (block.type === "code") {
    return {
      type: "code",
      language: cleanText(block.language || "text", 40),
      code: cleanText(block.code, 10000),
    };
  }

  if (block.type === "list") {
    const items = (Array.isArray(block.items) ? block.items : [])
      .map((item) => cleanText(item, 1000))
      .filter(Boolean);

    return items.length
      ? {
        type: "list",
        style: block.style === "numbered" ? "numbered" : "bullet",
        items,
      }
      : null;
  }

  if (block.type === "callout") {
    return {
      type: "callout",
      title: cleanText(block.title, 200),
      text: cleanText(block.text, 2000),
    };
  }

  return null;
}

function hasContent(block) {
  if (!block) return false;
  if (block.type === "list") return block.items.length > 0;
  return Boolean(block.text || block.code);
}

function lessonText(lesson, maxLength = 3000) {
  return (lesson.content || [])
    .filter((block) => block?.type === "heading" || block?.type === "paragraph")
    .map((block) => cleanText(block.text, maxLength))
    .filter(Boolean)
    .join("\n")
    .slice(0, maxLength);
}

function lessonSize(depth) {
  return LESSON_DEPTHS[depth] || LESSON_DEPTHS.standard;
}

function isCompleteLesson(blocks, size) {
  const characters = blocks.reduce((total, block) => {
    if (block.type === "list") return total + block.items.join("").length;
    return total + String(block.text || block.code || "").length;
  }, 0);

  return blocks.length >= size.blocks && characters >= size.characters;
}

function assertCompleteLesson(blocks, size) {
  if (isCompleteLesson(blocks, size)) return;

  const error = new Error("AI returned incomplete lesson content. Please try again.");
  error.statusCode = 502;
  throw error;
}

module.exports = {
  assertCompleteLesson,
  formatBlock,
  hasContent,
  isCompleteLesson,
  lessonSize,
  lessonText,
};
