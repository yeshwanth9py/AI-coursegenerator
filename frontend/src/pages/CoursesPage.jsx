import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Loader2 } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      setLoading(false);
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

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            My Courses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {courses.length} course{courses.length !== 1 ? 's' : ''} total
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60 w-72">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses..."
            className="bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none flex-1"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-700/50 bg-slate-900/40">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            {searchTerm ? 'No matching courses' : 'No courses yet'}
          </h3>
          <p className="text-sm text-slate-500">
            {searchTerm
              ? 'Try a different search term.'
              : 'Generate your first course from the home page!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}