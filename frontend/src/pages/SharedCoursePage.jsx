import { BookOpen, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import LessonRenderer from '../components/lesson/LessonRenderer';
import api from '../utils/api';

export default function SharedCoursePage() {
  const { shareId } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/courses/${shareId}`)
      .then(({ data }) => {
        setCourse(data);

        for (const moduleDoc of data.modules || []) {
          const lesson = moduleDoc.lessons?.find((item) => item.isEnriched);
          if (lesson) {
            setSelectedLesson(lesson);
            break;
          }
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) return <LoadingSpinner text="Loading shared course..." />;
  if (!course) return <p className="py-20 text-center text-slate-400">This course is not public.</p>;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-slate-800 px-4 py-5 lg:px-8">
        <p className="text-sm font-semibold text-white">CourseAI</p>
        <p className="mt-1 text-xs text-slate-500">Read-only shared course</p>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[20rem_1fr] lg:px-8">
        <aside>
          <h1 className="text-2xl font-semibold text-white">{course.title}</h1>
          {course.description && <p className="mt-3 text-sm leading-relaxed text-slate-400">{course.description}</p>}

          <div className="mt-8 space-y-5">
            {course.modules?.map((moduleDoc, moduleIndex) => (
              <section key={moduleDoc._id}>
                <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {moduleIndex + 1}. {moduleDoc.title}
                </h2>
                <div className="mt-2 space-y-1">
                  {moduleDoc.lessons?.map((lesson) => (
                    <button
                      key={lesson._id}
                      type="button"
                      disabled={!lesson.isEnriched}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                        lesson._id === selectedLesson?._id
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-500 hover:text-slate-300 disabled:opacity-40'
                      }`}
                    >
                      <ChevronRight className="h-3 w-3" />
                      {lesson.title}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <section className="min-w-0 rounded-xl border border-slate-800 bg-slate-900 p-6 lg:p-10">
          {selectedLesson ? (
            <>
              <h2 className="mb-8 text-2xl font-semibold text-white">{selectedLesson.title}</h2>
              <LessonRenderer content={selectedLesson.content} />
            </>
          ) : (
            <div className="py-20 text-center text-slate-500">
              <BookOpen className="mx-auto h-8 w-8" />
              <p className="mt-4">This course does not have a generated lesson yet.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
