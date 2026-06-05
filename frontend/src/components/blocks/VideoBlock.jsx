import { Play, ExternalLink } from 'lucide-react';

/**
 * Renders a YouTube video embed (inline playback).
 * Falls back to a link card for non-YouTube URLs.
 */
export default function VideoBlock({ block }) {
  if (!block) return null;

  const url   = block.url || block.src || '';
  const title = block.title || block.text || 'Video';

  const getYouTubeId = (videoUrl) => {
    if (!videoUrl) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const youtubeId = getYouTubeId(url);

  // YouTube embed — plays inline, no redirect
  if (youtubeId) {
    return (
      <div className="my-6 glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Video
            </span>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            YouTube
          </a>
        </div>

        {/* 16:9 responsive iframe — plays directly on the page */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {title && (
          <div className="px-5 py-3 border-t border-slate-700/50">
            <p className="text-sm text-slate-300 font-medium">{title}</p>
          </div>
        )}
      </div>
    );
  }

  // Non-YouTube URL — link card
  if (url) {
    return (
      <div className="my-6 flex items-center gap-3 p-4 glass-card">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
          <Play className="w-5 h-5 text-rose-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-200">{title}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            {url}
          </a>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-500" />
      </div>
    );
  }

  return (
    <div className="my-6 p-4 glass-card text-slate-500 text-sm italic">
      Video content not available.
    </div>
  );
}
