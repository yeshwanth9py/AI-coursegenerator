const ContentBlockStreamParser = require("./contentBlockStreamParser");
const { generateJsonStream, generateText } = require("./groqService");
const {
  assertCompleteLesson,
  formatBlock,
  hasContent,
  lessonSize,
  lessonText,
} = require("./lessonContent");

const CONTENT_BLOCK_INSTRUCTIONS = `
Allowed block types: "heading", "paragraph", "code", "list", "callout".
- heading: { "type": "heading", "level": 2 or 3, "text": "..." }
- paragraph: { "type": "paragraph", "text": "..." }
- code: { "type": "code", "language": "python", "code": "..." }
- list: { "type": "list", "style": "bullet" or "numbered", "items": ["item1", "item2"] }
- callout: { "type": "callout", "title": "Key Insight", "text": "..." }
Use a useful mix of block types. Include at least one realistic, runnable code example.
Use callouts for important insights or warnings and lists for steps or comparisons.
`.trim();

function lessonPrompt({ lesson, moduleDoc, course, depth, language }) {
  const size = lessonSize(depth);

  return {
    size,
    instructions: `
Write a complete standalone lesson as JSON with a "contentBlocks" array.
${CONTENT_BLOCK_INSTRUCTIONS}
Write roughly ${size.words} words using substantial paragraphs and useful examples.
Teach the topic fully and end with a practical conclusion.
Write in ${language}. Do not include quizzes, markdown, or videos.
Return only valid JSON. Do not add text before or after the JSON.
    `.trim(),
    context: `
Lesson: ${lesson.title}
Module: ${moduleDoc.title}
Course: ${course.title}
Course description: ${course.description || "Not provided"}
    `.trim(),
  };
}

async function streamLessonContent({ lesson, moduleDoc, course, depth, language, onBlock }) {
  const { context, instructions, size } = lessonPrompt({
    lesson,
    moduleDoc,
    course,
    depth,
    language,
  });
  const parser = new ContentBlockStreamParser();
  const blocks = [];

  for await (const chunk of generateJsonStream(instructions, context, size.maxTokens)) {
    for (const value of parser.push(chunk)) {
      const block = formatBlock(value);
      if (hasContent(block)) {
        blocks.push(block);
        onBlock?.(block);
      }
    }
  }

  assertCompleteLesson(blocks, size);
  return blocks;
}

async function answerLessonQuestion({ lesson, moduleDoc, course, message, history }) {
  const recentHistory = (Array.isArray(history) ? history : [])
    .slice(-6)
    .map((item) => ({
      role: item?.role === "user" ? "user" : "assistant",
      content: String(item?.content || "").trim().slice(0, 1000),
    }))
    .filter((item) => item.content);

  return generateText([
    {
      role: "system",
      content: `
You are a tutor for "${lesson.title}" in "${moduleDoc.title}" from "${course.title}".
Use this lesson when answering:
${lessonText(lesson, 2000) || "No detailed lesson content is available yet."}
Answer clearly and in the same language as the student.
Lead with a direct answer, then add only the detail needed to teach it well.
Format longer answers with short Markdown paragraphs, bullets, or numbered steps.
Use fenced code blocks for code. Avoid oversized headings and long walls of text.
      `.trim(),
    },
    ...recentHistory,
    { role: "user", content: message },
  ]);
}

module.exports = { answerLessonQuestion, streamLessonContent };
