import { Bell, RefreshCw, Wifi, Menu } from 'lucide-react';
import { useState } from 'react';

// ============================================================
// Top Navbar
// ============================================================

interface NavbarProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  onMenuClick?: () => void;
}

function getHijriDate(): string {
  // Format tanggal Masehi yang bersamaan dengan Idul Adha 1446 H (diperkirakan Juni 2025)
  // Tampilkan tanggal lokal dengan konteks islami
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return now.toLocaleDateString('id-ID', options);
}

function getHijriLabel(): string {
  return '6 Dzulhijjah 1447 H';
}

export function Navbar({ onRefresh, isLoading, onMenuClick }: NavbarProps) {
  const [rotating, setRotating] = useState(false);

  const handleRefresh = () => {
    if (isLoading || rotating) return;
    setRotating(true);
    setTimeout(() => setRotating(false), 800);
    onRefresh?.();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-20 shadow-sm">
      {onMenuClick && (
        <button onClick={onMenuClick} className="md:hidden w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500">
          <Menu size={18} />
        </button>
      )}

      {/* Page Title Area — diisi oleh halaman */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Wifi size={12} className="text-emerald-500" />
            <span className="text-emerald-600 font-semibold">Data Lokal</span>
            <span>•</span>
            <span>{getHijriLabel()}</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{getHijriDate()}</p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Refresh Button */}
        {onRefresh && (
          <button
            id="btn-refresh-navbar"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh data"
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200
                       flex items-center justify-center text-slate-500 hover:text-slate-700
                       transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={rotating || isLoading ? 'animate-spin' : ''}
            />
          </button>
        )}

        {/* Notification Bell */}
        <button
          id="btn-notification-bell"
          className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200
                     flex items-center justify-center text-slate-500 hover:text-slate-700
                     transition-all duration-200 relative"
          title="Notifikasi"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600
                     flex items-center justify-center text-white text-xs font-bold
                     cursor-pointer hover:shadow-glow-green transition-shadow duration-200"
          title="Panitia"
        >
          P
        </div>
      </div>
    </header>
  );
}
