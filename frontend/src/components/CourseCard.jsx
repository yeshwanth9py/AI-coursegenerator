import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Trash2 } from 'lucide-react';
import { courseProgress } from '../utils/courseProgress';

export default function CourseCard({ course, onDelete }) {
  const navigate = useNavigate();

  const modules = course.modules?.length || 0;
  const progress = courseProgress(course);

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(`/course/${course._id}`)}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="font-semibold text-white">{course.title}</h3>
          {course.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
              {course.description}
            </p>
          )}
        </button>

        <button
          type="button"
          onClick={() => onDelete(course._id)}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
          title="Delete course"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-slate-800 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          {modules} modules
        </span>
        <span>{progress.totalLessons} lessons</span>
        <span className="ml-auto">{progress.percentage}%</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-brand-500" style={{ width: `${progress.percentage}%` }} />
      </div>
      {progress.percentage === 100 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <Award className="h-3.5 w-3.5" />
          Certificate unlocked
        </p>
      )}
    </article>
  );
}
