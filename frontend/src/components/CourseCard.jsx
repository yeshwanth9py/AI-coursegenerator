import { useNavigate } from 'react-router-dom';
import { BookOpen, Trash2, Clock, Tag } from 'lucide-react';

export default function CourseCard({ course, onDelete }) {
  const navigate = useNavigate();

  if (!course) return null;

  const moduleCount = course.modules?.length || 0;
  const createdDate = course.createdAt
    ? new Date(course.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div
      onClick={() => navigate(`/course/${course._id}`)}
      className="group relative rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-6 cursor-pointer transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-800/60 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-b opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/10 flex-shrink-0">
          <BookOpen className="w-5 h-5 text-indigo-400" />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(course._id);
          }}
          className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="Delete course"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-200 transition-colors">
        {course.title}
      </h3>

      {course.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {course.description}
        </p>
      )}

      {/* Tags */}
      {course.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {course.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          {course.tags.length > 3 && (
            <span className="text-xs text-slate-500 px-2 py-1">
              +{course.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{moduleCount} module{moduleCount !== 1 ? 's' : ''}</span>
        </div>

        {createdDate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{createdDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}