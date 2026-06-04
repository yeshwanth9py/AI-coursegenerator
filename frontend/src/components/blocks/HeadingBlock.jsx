export default function HeadingBlock({ block }) {
  const Tag = block.level ? `h${block.level}` : "h2";
  const styles = {
    h1: "text-4xl font-extrabold text-white mb-6 mt-12 tracking-tight",
    h2: "text-2xl font-bold text-slate-100 mb-4 mt-10 border-b border-slate-800 pb-2",
    h3: "text-xl font-semibold text-slate-200 mb-3 mt-8",
  };
  
  return <Tag className={styles[Tag] || styles.h2}>{block.text}</Tag>;
}