import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';

// ============================================================
// StatCard — widget ringkasan angka di Dashboard
// ============================================================

type ColorVariant = 'green' | 'gold' | 'blue' | 'slate' | 'red' | 'orange';

const gradientMap: Record<ColorVariant, string> = {
  green:  'from-emerald-600 to-teal-600',
  gold:   'from-amber-500 to-yellow-500',
  blue:   'from-blue-600 to-indigo-600',
  slate:  'from-slate-500 to-slate-600',
  red:    'from-red-500 to-rose-500',
  orange: 'from-orange-500 to-amber-500',
};


const iconBgMap: Record<ColorVariant, string> = {
  green:  'bg-emerald-50 text-emerald-600',
  gold:   'bg-amber-50 text-amber-600',
  blue:   'bg-blue-50 text-blue-600',
  slate:  'bg-slate-100 text-slate-600',
  red:    'bg-red-50 text-red-600',
  orange: 'bg-orange-50 text-orange-600',
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: ColorVariant;
  trend?: {
    value: string;
    up?: boolean;
    label?: string;
  };
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'green',
  trend,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={clsx(
        'card hover:shadow-card-lg transition-shadow duration-300 group',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={clsx(
            'w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
            iconBgMap[color]
          )}
        >
          {icon}
        </div>

        {trend && (
          <span
            className={clsx(
              'text-xs font-semibold px-2 py-1 rounded-lg',
              trend.up !== false
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-500'
            )}
          >
            {trend.up !== false ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      <div>
        <p className="stat-label mb-1">{title}</p>
        <motion.p
          className="stat-value text-slate-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: delay + 0.1 }}
        >
          {value}
        </motion.p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        )}
        {trend?.label && (
          <p className="text-xs text-slate-400 mt-1">{trend.label}</p>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// GradientStatCard — card dengan gradient header (premium look)
// ============================================================

interface GradientStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: ColorVariant;
  children?: ReactNode;
  className?: string;
  delay?: number;
}

export function GradientStatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'green',
  children,
  className,
  delay = 0,
}: GradientStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={clsx(
        'rounded-2xl overflow-hidden shadow-card hover:shadow-card-lg transition-shadow duration-300',
        className
      )}
    >
      {/* Gradient Header */}
      <div className={clsx('bg-gradient-to-r p-5 text-white', gradientMap[color])}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white/80">{title}</span>
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-base">
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && <p className="text-sm text-white/70 mt-1">{subtitle}</p>}
      </div>

      {/* Content */}
      {children && (
        <div className="bg-white p-4">
          {children}
        </div>
      )}
    </motion.div>
  );
}
