export default function ParagraphBlock({ block }) {
  // Bold **text** parser for basic markdown styling
  const formatText = (text) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-slate-100 font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return <p className="mb-4 text-lg text-slate-300/90 leading-relaxed">{formatText(block.text)}</p>;
}   