import CalloutBlock from '../blocks/CalloutBlock';
import CodeSnippet from '../blocks/CodeSnippet';
import ListBlock from '../blocks/ListBlock';
import VideoBlock from '../blocks/VideoBlock';

export default function LessonRenderer({ content = [] }) {
  if (!content.length) {
    return <p className="surface-card p-8 text-center text-slate-500">Generate the lesson to begin learning.</p>;
  }

  return (
    <article id="lesson-content" data-print-content className="space-y-6 text-[15px] leading-8 text-slate-300 sm:text-base">
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
              className={`font-display font-bold text-white ${
                block.level === 3
                  ? 'pt-5 text-xl text-brand-100'
                  : 'mt-10 border-t border-white/[0.07] pt-10 text-2xl sm:text-3xl'
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
        if (block.text) return <p key={index} style={animStyle} className="text-slate-300/95">{block.text}</p>;
        return null;
      })}
    </article>
  );
}
