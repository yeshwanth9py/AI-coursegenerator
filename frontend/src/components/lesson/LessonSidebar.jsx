import { ArrowLeft, Bookmark, CheckCircle2 } from 'lucide-react';

export default function LessonSidebar({ course, currentLessonId, onBack, onSelectLesson }) {
  return (
    <aside className="hidden h-full w-72 flex-shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950 lg:block">
      <header className="border-b border-slate-800 p-4">
        <button onClick={onBack} className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <ArrowLeft className="h-3 w-3" />
          Back to course
        </button>
        <h2 className="truncate text-sm font-semibold text-white">{course.title}</h2>
      </header>

      {course.modules?.map((moduleDoc, moduleIndex) => (
        <section key={moduleDoc._id} className="border-b border-slate-800 py-3">
          <h3 className="px-4 text-xs font-medium text-slate-400">
            {moduleIndex + 1}. {moduleDoc.title}
          </h3>
          {moduleDoc.lessons?.map((lesson) => (
            <button
              key={lesson._id}
              onClick={() => onSelectLesson(lesson._id)}
              className={`mt-1 w-full px-4 py-2 text-left text-xs ${
                lesson._id === currentLessonId
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                {lesson.completedAt && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                {lesson.bookmarked && <Bookmark className="h-3 w-3 text-brand-400" />}
                <span>{lesson.title}</span>
              </span>
            </button>
          ))}
        </section>
      ))}
    </aside>
  );
}
