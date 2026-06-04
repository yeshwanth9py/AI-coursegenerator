import DashboardLayout from "../Layouts/DashboardLayout";
import StatsSection from "../components/dashboard/StatsSection";
import RecentCourses from "../components/dashboard/RecentCourses";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <StatsSection />
      <RecentCourses />
    </DashboardLayout>
  );
}