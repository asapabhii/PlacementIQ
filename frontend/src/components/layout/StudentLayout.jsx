import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function StudentLayout() {
  return (
    <div className="flex min-h-screen bg-surface-900">
      <Sidebar role="student" />
      <main className="flex-1 ml-64 transition-all duration-300">
        <div className="p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
