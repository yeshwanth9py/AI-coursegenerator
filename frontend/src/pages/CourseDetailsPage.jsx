import { Navigate, useParams } from 'react-router-dom';

// CourseDetailsPage redirects to CourseOverviewPage since they serve the same purpose
export default function CourseDetailsPage() {
  const { id } = useParams();
  return <Navigate to={`/course/${id}`} replace />;
}