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
    <section className="mb-10 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-400">Continue learning</p>
        {recentLesson ? (
          <>
            <h2 className="mt-3 text-xl font-semibold text-white">{recentLesson.title}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {recentLesson.courseTitle} / {recentLesson.moduleTitle}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/course/${recentLesson.courseId}/lesson/${recentLesson._id}`)}
              className="btn-primary mt-5"
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
          <div className="mt-6 border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500">Saved for later</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {bookmarkedLessons.slice(0, 3).map((lesson) => (
                <button
                  key={lesson._id}
                  type="button"
                  onClick={() => navigate(`/course/${lesson.courseId}/lesson/${lesson._id}`)}
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
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
        <SummaryItem icon={BookOpen} label="Courses" value={courses.length} />
        <SummaryItem icon={CheckCircle2} label="Lessons done" value={completedLessons} />
        <SummaryItem icon={Target} label="Overall progress" value={`${completion}%`} />
        <SummaryItem icon={Trophy} label="Certificates" value={completedCourses} />
      </div>
    </section>
  );
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <Icon className="h-4 w-4 text-brand-400" />
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
