import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Beef,
  Users,
  Ticket,
  PackageCheck,
  Wallet,
  ChevronRight,
  Moon,
} from 'lucide-react';
import clsx from 'clsx';

// ============================================================
// Sidebar Navigation
// ============================================================

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number | string;
}

const navItems: NavItem[] = [
  { to: '/',           icon: <LayoutDashboard size={18} />, label: 'Dashboard'          },
  { to: '/sapi',       icon: <Beef size={18} />,            label: 'Data Sapi'          },
  { to: '/warga',      icon: <Users size={18} />,           label: 'Data Warga'         },
  { to: '/kupon',      icon: <Ticket size={18} />,          label: 'Kupon Digital'      },
  { to: '/distribusi', icon: <PackageCheck size={18} />,    label: 'Distribusi Daging'  },
  { to: '/panitia',    icon: <Wallet size={18} />,          label: 'Laporan Keuangan'   },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="h-screen w-60 bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-30 shadow-sm">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-glow-green">
            <Moon size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">Qurban Manager</p>
            <p className="text-xs text-slate-400 font-arabic">إدارة قربان</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
          Menu Utama
        </p>

        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={clsx(
                    'sidebar-link',
                    isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight size={14} className="text-white/60" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      <div className="px-5 py-4 border-t border-slate-100">
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold text-emerald-700 mb-0.5">Idul Adha 1446 H</p>
          <p className="text-xs text-emerald-600">Pondok Riyadhussholihiin</p>
          <p className="text-[10px] text-emerald-500 mt-1">Data tersimpan lokal (localStorage)</p>
        </div>
      </div>
    </aside>
  );
}
