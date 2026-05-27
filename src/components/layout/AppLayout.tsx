import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

// ============================================================
// AppLayout — wraps all pages with Sidebar + Navbar
// ============================================================

interface AppLayoutProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function AppLayout({ onRefresh, isLoading }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex bg-surface-100">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <div className="flex-1 flex flex-col ml-60 min-h-screen">
        <Navbar onRefresh={onRefresh} isLoading={isLoading} />

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
