const test = require("node:test");
const assert = require("node:assert/strict");
const ContentBlockStreamParser = require("../services/contentBlockStreamParser");
const {
  formatBlock,
  isCompleteLesson,
} = require("../services/lessonContent");

test("content block parser handles objects split across chunks", () => {
  const parser = new ContentBlockStreamParser();
  const first = parser.push('{"contentBlocks":[{"type":"paragraph","text":"A {nested');
  const second = parser.push('} value"},{"type":"list","items":["one","two"]}]}');

  assert.deepEqual(first, []);
  assert.deepEqual(second, [
    { type: "paragraph", text: "A {nested} value" },
    { type: "list", items: ["one", "two"] },
  ]);
});

test("formatBlock rejects unsupported and empty blocks", () => {
  assert.equal(formatBlock({ type: "video", url: "https://example.com" }), null);
  assert.equal(formatBlock({ type: "list", items: [] }), null);
  assert.deepEqual(formatBlock({
    type: "heading",
    level: 8,
    text: "  A useful heading  ",
  }), {
    type: "heading",
    level: 2,
    text: "A useful heading",
  });
});

test("lesson completeness checks both block count and content length", () => {
  const blocks = [
    { type: "heading", text: "Introduction" },
    { type: "paragraph", text: "A".repeat(40) },
  ];

  assert.equal(isCompleteLesson(blocks, { blocks: 2, characters: 40 }), true);
  assert.equal(isCompleteLesson(blocks, { blocks: 3, characters: 40 }), false);
  assert.equal(isCompleteLesson(blocks, { blocks: 2, characters: 100 }), false);
});
