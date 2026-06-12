function youtubeId(url) {
  const hostname = url.hostname.replace('www.', '');

  if (hostname === 'youtu.be') return url.pathname.slice(1);
  if (hostname !== 'youtube.com' && hostname !== 'm.youtube.com') return null;
  if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2];
  return url.searchParams.get('v');
}

export default function VideoBlock({ block }) {
  if (!block.url) return null;

  let url;
  try {
    url = new URL(block.url);
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const id = youtubeId(url);
  const title = block.title || 'Lesson video';

  if (!id) {
    return (
      <a
        href={url.href}
        target="_blank"
        rel="noreferrer"
        className="block rounded-lg border border-slate-800 p-4 text-brand-400"
      >
        {title}
      </a>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800">
      <iframe
        className="aspect-video w-full"
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        loading="lazy"
        allowFullScreen
      />
      <p className="border-t border-slate-800 p-3 text-sm text-slate-300">{title}</p>
    </div>
  );
}
