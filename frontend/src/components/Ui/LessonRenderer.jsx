import HeadingBlock from "../blocks/HeadingBlock";
import ParagraphBlock from "../blocks/ParagraphBlock";
import CodeBlock from "../blocks/Codeblock";
import VideoBlock from "../blocks/VideoBlock";

export default function LessonRenderer({ content }) {
  if (!content || content.length === 0) {
    return <p className="text-slate-400 italic">No content available.</p>;
  }

  return (
    <div className="space-y-6 text-slate-300 leading-relaxed max-w-4xl mx-auto" id="lesson-content">
      {content.map((block, index) => {
        const key = `block-${index}`;
        
        switch (block.type) {
          case "heading":
            return <HeadingBlock key={key} block={block} />;
          case "paragraph":
            return <ParagraphBlock key={key} block={block} />;
          case "code":
            return <CodeBlock key={key} block={block} />;
          case "video":
            return <VideoBlock key={key} block={block} />;
          default:
            // Fallback for unknown text types
            if (block.text) return <ParagraphBlock key={key} block={{ text: block.text }} />;
            return null;
        }
      })}
    </div>
  );
}
