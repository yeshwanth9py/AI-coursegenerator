import CalloutBlock from '../blocks/CalloutBlock';
import CodeSnippet from '../blocks/CodeSnippet';
import ListBlock from '../blocks/ListBlock';
import VideoBlock from '../blocks/VideoBlock';

export default function LessonRenderer({ content = [] }) {
  if (!content.length) {
    return <p className="text-slate-400">No content available.</p>;
  }

  return (
    <article id="lesson-content" data-print-content className="space-y-5 leading-relaxed text-slate-300">
      {content.map((block, index) => {
        const animStyle = {
          animation: 'blockFadeIn 0.4s ease-out both',
          animationDelay: `${Math.min(index * 60, 600)}ms`,
        };

        if (block.type === 'heading') {
          const Heading = block.level === 3 ? 'h3' : 'h2';
          return (
            <Heading
              key={index}
              style={animStyle}
              className={`pt-5 font-semibold text-white ${
                block.level === 3 ? 'text-lg' : 'text-xl'
              }`}
            >
              {block.text}
            </Heading>
          );
        }
        if (block.type === 'code') return <div key={index} style={animStyle}><CodeSnippet block={block} /></div>;
        if (block.type === 'list') return <div key={index} style={animStyle}><ListBlock block={block} /></div>;
        if (block.type === 'callout') return <div key={index} style={animStyle}><CalloutBlock block={block} /></div>;
        if (block.type === 'video') return <div key={index} style={animStyle}><VideoBlock block={block} /></div>;
        if (block.text) return <p key={index} style={animStyle}>{block.text}</p>;
        return null;
      })}
    </article>
  );
}
