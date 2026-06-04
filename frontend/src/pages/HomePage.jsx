import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Zap, Globe } from 'lucide-react';
import PromptForm from '../components/PromptForm';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses/mine');
      setCourses(data);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleGenerate = async (prompt) => {
    setGenerating(true);
    try {
      const { data } = await api.post('/courses/generate', { prompt });
      toast.success('Course generated successfully!');
      navigate(`/course/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate course');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
      toast.success('Course deleted');
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'Generate structured courses from a single prompt',
    },
    {
      icon: Zap,
      title: 'Instant Content',
      description: 'Enrich lessons with detailed explanations & code',
    },
    {
      icon: Globe,
      title: 'Learn Anywhere',
      description: 'Download lessons as PDF for offline study',
    },
  ];

  return (
    <div className="px-4 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="relative text-center py-12 lg:py-20 mb-12 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            AI-Powered Course Generator
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
            <span className="text-white">Create Courses with</span>
            <br />
            <span className="gradient-text">Artificial Intelligence</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed">
            Describe any topic and watch AI build a complete, structured course with modules, 
            lessons, and detailed content — in seconds.
          </p>

          {/* Prompt Form */}
          <div className="animate-slide-up">
            <PromptForm onSubmit={handleGenerate} isLoading={generating} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="glass-card p-6 text-center animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent/20 to-violet-glow/10 flex items-center justify-center border border-accent/10">
              <f.icon className="w-6 h-6 text-accent-light" />
            </div>
            <h3 className="text-white font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </section>

      {/* My Courses */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-accent-light" />
              My Courses
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {courses.length} course{courses.length !== 1 ? 's' : ''} created
            </p>
          </div>
        </div>

        {loadingCourses ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" text="Loading your courses..." />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-700/50 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Use the prompt above to generate your first AI-powered course!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
