export default function ListBlock({ block }) {
  const Tag = block.style === 'numbered' ? 'ol' : 'ul';

  return (
    <Tag
      className={`my-4 space-y-2 pl-6 text-slate-300 ${
        block.style === 'numbered'
          ? 'list-decimal marker:text-indigo-400 marker:font-semibold'
          : 'list-disc marker:text-indigo-400'
      }`}
    >
      {block.items.map((item, index) => (
        <li key={index} className="pl-1 leading-relaxed">
          {item}
        </li>
      ))}
    </Tag>
  );
}
