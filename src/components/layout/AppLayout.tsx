import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useState } from 'react';

// ============================================================
// AppLayout — wraps all pages with Sidebar + Navbar
// ============================================================

interface AppLayoutProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function AppLayout({ onRefresh, isLoading }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-surface-100">
      {/* Fixed Sidebar for Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="relative z-50 w-60 h-full" onClick={() => setMenuOpen(false)}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col md:ml-60 min-h-screen min-w-0">
        <Navbar onRefresh={onRefresh} isLoading={isLoading} onMenuClick={() => setMenuOpen(true)} />

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
