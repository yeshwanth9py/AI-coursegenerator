import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Award, BookOpen, Layers3, Trash2 } from 'lucide-react';
import { courseProgress } from '../utils/courseProgress';

export default function CourseCard({ course, onDelete }) {
  const navigate = useNavigate();

  const modules = course.modules?.length || 0;
  const progress = courseProgress(course);

  return (
    <article className="group rounded-xl border border-white/[0.08] bg-white/[0.025] p-5 transition duration-200 hover:border-brand-400/30 hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(`/course/${course._id}`)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="mb-4 grid h-11 w-11 place-items-center rounded-lg border border-brand-400/20 bg-brand-500/10 text-brand-200">
            <BookOpen className="h-5 w-5" />
          </span>
          <h3 className="font-display text-lg font-bold leading-snug text-white transition group-hover:text-brand-200">{course.title}</h3>
          {course.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
              {course.description}
            </p>
          )}
        </button>

        <button
          type="button"
          onClick={() => onDelete(course._id)}
          className="icon-button relative z-10 h-9 w-9 opacity-60 hover:border-rose-400/30 hover:text-rose-300 group-hover:opacity-100"
          title="Delete course"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4 border-t border-white/[0.07] pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Layers3 className="h-3.5 w-3.5 text-brand-300" />
          {modules} modules
        </span>
        <span>{progress.totalLessons} lessons</span>
        <span className="ml-auto font-semibold text-slate-300">{progress.percentage}%</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-brand-400 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all duration-700" style={{ width: `${progress.percentage}%` }} />
      </div>
      {progress.percentage === 100 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <Award className="h-3.5 w-3.5" />
          Certificate unlocked
        </p>
      )}
      <button
        type="button"
        onClick={() => navigate(`/course/${course._id}`)}
        className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 text-xs font-semibold text-slate-400 transition hover:border-brand-400/25 hover:bg-brand-500/10 hover:text-white"
      >
        Open course
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </button>
    </article>
  );
}
