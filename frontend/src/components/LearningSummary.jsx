import { ArrowRight, BookOpen, CheckCircle2, Target, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { courseProgress, mostRecentLesson } from '../utils/courseProgress';

export default function LearningSummary({ courses }) {
  const navigate = useNavigate();
  const recentLesson = mostRecentLesson(courses);
  const bookmarkedLessons = [];
  let totalLessons = 0;
  let completedLessons = 0;

  for (const course of courses) {
    const progress = courseProgress(course);
    totalLessons += progress.totalLessons;
    completedLessons += progress.completedLessons;

    for (const moduleDoc of course.modules || []) {
      for (const lesson of moduleDoc.lessons || []) {
        if (lesson.bookmarked) {
          bookmarkedLessons.push({
            ...lesson,
            courseId: course._id,
            courseTitle: course.title,
          });
        }
      }
    }
  }

  const completion = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const completedCourses = courses.filter((course) => courseProgress(course).percentage === 100).length;

  return (
    <section className="mb-12 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
      <div className="surface-card relative overflow-hidden p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
        <p className="eyebrow">Continue learning</p>
        {recentLesson ? (
          <>
            <h2 className="relative mt-4 max-w-xl font-display text-2xl font-bold text-white">{recentLesson.title}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {recentLesson.courseTitle} / {recentLesson.moduleTitle}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/course/${recentLesson.courseId}/lesson/${recentLesson._id}`)}
              className="btn-primary mt-6"
            >
              Resume lesson
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-400">
            Open a lesson and it will appear here for quick access.
          </p>
        )}

        {bookmarkedLessons.length > 0 && (
          <div className="relative mt-6 border-t border-white/[0.07] pt-4">
            <p className="text-xs text-slate-500">Saved for later</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {bookmarkedLessons.slice(0, 3).map((lesson) => (
                <button
                  key={lesson._id}
                  type="button"
                  onClick={() => navigate(`/course/${lesson.courseId}/lesson/${lesson._id}`)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-slate-400 transition hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-white"
                  title={lesson.courseTitle}
                >
                  {lesson.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryItem icon={BookOpen} label="Courses" value={courses.length} color="violet" />
        <SummaryItem icon={CheckCircle2} label="Lessons done" value={completedLessons} color="cyan" />
        <SummaryItem icon={Target} label="Overall progress" value={`${completion}%`} color="blue" />
        <SummaryItem icon={Trophy} label="Certificates" value={completedCourses} color="amber" />
      </div>
    </section>
  );
}

const iconColors = {
  amber: 'bg-amber-400/10 text-amber-300',
  blue: 'bg-blue-400/10 text-blue-300',
  cyan: 'bg-cyan-400/10 text-cyan-300',
  violet: 'bg-violet-400/10 text-violet-300',
};

function SummaryItem({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-card rounded-2xl p-4 transition duration-300 hover:-translate-y-1 hover:border-brand-400/25">
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${iconColors[color]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 font-display text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
