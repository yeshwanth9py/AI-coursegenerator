import { useState } from 'react';
import { Search, Link2, Plus, X, ExternalLink, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

/**
 * Modal for searching YouTube videos and adding them to lesson content.
 * Users search externally on YouTube, then paste the URL to embed it.
 */
export default function VideoSearchModal({ lessonId, lessonTitle, isOpen, onClose, onVideoAdded }) {
  const [searchQuery, setSearchQuery] = useState(lessonTitle || '');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  if (!isOpen) return null;

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSearchYouTube = () => {
    if (!searchQuery.trim()) return;
    const encoded = encodeURIComponent(searchQuery.trim());
    window.open(`https://www.youtube.com/results?search_query=${encoded}`, '_blank');
  };

  const handleUrlPaste = (value) => {
    setYoutubeUrl(value);
    const id = extractYouTubeId(value);
    setPreviewId(id);
  };

  const handleAddVideo = async () => {
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setSaving(true);
    try {
      const block = {
        type: 'video',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: videoTitle.trim() || `Video: ${lessonTitle}`,
      };

      const { data } = await api.patch(`/courses/lessons/${lessonId}/content`, { block });
      toast.success('Video added to lesson!');
      onVideoAdded?.(data);
      resetAndClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add video');
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setYoutubeUrl('');
    setVideoTitle('');
    setPreviewId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetAndClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/50 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-semibold text-white">Add Video</h3>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1: Search YouTube */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Step 1: Search for a video
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search YouTube..."
                  className="input-field pl-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchYouTube()}
                />
              </div>
              <button onClick={handleSearchYouTube} className="btn-secondary flex-shrink-0">
                <ExternalLink className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>

          {/* Step 2: Paste URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Step 2: Paste the YouTube URL
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => handleUrlPaste(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* Video title (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Video title (optional)
            </label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Give this video a descriptive title..."
              className="input-field"
            />
          </div>

          {/* Preview */}
          {previewId && (
            <div className="rounded-xl overflow-hidden border border-slate-700/50">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${previewId}`}
                  title="Video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800/60">
          <button onClick={resetAndClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleAddVideo}
            disabled={!previewId || saving}
            className="btn-primary disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            {saving ? 'Adding...' : 'Add to Lesson'}
          </button>
        </div>
      </div>
    </div>
  );
}
