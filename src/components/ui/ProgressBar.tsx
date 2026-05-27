import { motion } from 'framer-motion';
import clsx from 'clsx';

// ============================================================
// ProgressBar — animated progress bar component
// ============================================================

type ProgressVariant = 'green' | 'gold' | 'blue' | 'red' | 'orange' | 'gradient';

const trackMap: Record<ProgressVariant, string> = {
  green:    'bg-emerald-100',
  gold:     'bg-amber-100',
  blue:     'bg-blue-100',
  red:      'bg-red-100',
  orange:   'bg-orange-100',
  gradient: 'bg-slate-100',
};

const fillMap: Record<ProgressVariant, string> = {
  green:    'bg-emerald-500',
  gold:     'bg-amber-500',
  blue:     'bg-blue-500',
  red:      'bg-red-500',
  orange:   'bg-orange-500',
  gradient: 'bg-gradient-to-r from-emerald-500 to-teal-400',
};

interface ProgressBarProps {
  value: number;       // 0–100
  max?: number;        // optional — jika tidak 100
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  variant?: ProgressVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  showPercent = true,
  variant = 'green',
  size = 'md',
  className,
  animated = true,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-slate-700">{label}</span>
          )}
          {sublabel && (
            <span className="text-xs text-slate-400">{sublabel}</span>
          )}
          {showPercent && (
            <span className="text-sm font-semibold text-slate-700">{percent}%</span>
          )}
        </div>
      )}

      <div className={clsx('w-full rounded-full overflow-hidden', trackMap[variant], sizeMap[size])}>
        {animated ? (
          <motion.div
            className={clsx('h-full rounded-full', fillMap[variant])}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        ) : (
          <div
            className={clsx('h-full rounded-full', fillMap[variant])}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// MultiProgressBar — multiple segments in one bar
// ============================================================

interface ProgressSegment {
  value: number;
  color: string; // tailwind bg class
  label: string;
}

interface MultiProgressBarProps {
  segments: ProgressSegment[];
  total: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MultiProgressBar({
  segments,
  total,
  size = 'lg',
  className,
}: MultiProgressBarProps) {
  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('w-full rounded-full overflow-hidden flex', sizeMap[size])}>
        {segments.map((seg, i) => {
          const pct = total > 0 ? (seg.value / total) * 100 : 0;
          return (
            <motion.div
              key={i}
              className={clsx('h-full', seg.color)}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={clsx('w-2.5 h-2.5 rounded-full', seg.color)} />
            <span className="text-xs text-slate-500">
              {seg.label} <span className="font-medium text-slate-700">({seg.value})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
