import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, Play, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function VideoSearchModal({ lessonId, lessonTitle, isOpen, onClose, onVideoAdded }) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [videos, setVideos] = useState([]);
  const onVideoAddedRef = useRef(onVideoAdded);

  useEffect(() => {
    onVideoAddedRef.current = onVideoAdded;
  }, [onVideoAdded]);

  useEffect(() => {
    if (!isOpen || !lessonId) return;

    let cancelled = false;
    setStatus('loading');
    setError('');
    setVideos([]);

    api.post(`/courses/lessons/${lessonId}/add-videos`, { count: 3 })
      .then(({ data }) => {
        if (cancelled) return;

        const addedVideos = Array.isArray(data.videos) ? data.videos : [];
        setVideos(addedVideos);
        setStatus('success');
        onVideoAddedRef.current?.(data.lesson);
        toast.success(`${addedVideos.length || 1} video${addedVideos.length === 1 ? '' : 's'} added below the lesson`);
      })
      .catch((err) => {
        if (cancelled) return;

        setStatus('error');
        setError(err.response?.data?.error || 'Failed to add videos');
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, lessonId, lessonTitle]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (status === 'loading') return;

    setStatus('idle');
    setError('');
    setVideos([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/50 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-semibold text-white">Add Videos</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={status === 'loading'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-10 h-10 text-brand-400 animate-spin mx-auto mb-4" />
              <h4 className="text-base font-semibold text-white mb-2">Finding relevant videos</h4>
              <p className="text-sm text-slate-400">
                AI is matching YouTube videos to "{lessonTitle}" and embedding them below the lesson.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">Videos added</h4>
                  <p className="text-sm text-slate-500">They are embedded below the lesson content.</p>
                </div>
              </div>

              {videos.length > 0 && (
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <div key={`${video.url}-${index}`} className="rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-3">
                      <p className="text-sm font-medium text-slate-200 line-clamp-2">{video.title || 'YouTube video'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
              <h4 className="text-base font-semibold text-white mb-2">Could not add videos</h4>
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800/60">
          <button onClick={handleClose} disabled={status === 'loading'} className="btn-secondary disabled:opacity-40">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
