import Navbar from './Navbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <main className="relative">{children}</main>
    </div>
  );
}
