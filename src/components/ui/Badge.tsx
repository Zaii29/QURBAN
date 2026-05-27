import clsx from 'clsx';
import type { StatusSapi, StatusKupon, StatusDistribusi } from '../../types';

// ============================================================
// Badge — untuk status sapi, kupon, distribusi
// ============================================================

type BadgeVariant =
  | 'menunggu'
  | 'disembelih'
  | 'dikuliti'
  | 'dicacah'
  | 'selesai'
  | 'sudah'
  | 'belum'
  | 'dibatalkan'
  | 'proses'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

const variantClasses: Record<BadgeVariant, string> = {
  menunggu:   'bg-slate-100 text-slate-600 border-slate-200',
  disembelih: 'bg-red-50 text-red-600 border-red-200',
  dikuliti:   'bg-orange-50 text-orange-600 border-orange-200',
  dicacah:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  selesai:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  sudah:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  belum:      'bg-slate-100 text-slate-600 border-slate-200',
  dibatalkan: 'bg-red-50 text-red-600 border-red-200',
  proses:     'bg-blue-50 text-blue-600 border-blue-200',
  success:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  error:      'bg-red-50 text-red-600 border-red-200',
  info:       'bg-blue-50 text-blue-600 border-blue-200',
};

const dotClasses: Record<BadgeVariant, string> = {
  menunggu:   'bg-slate-400',
  disembelih: 'bg-red-500',
  dikuliti:   'bg-orange-500',
  dicacah:    'bg-yellow-500',
  selesai:    'bg-emerald-500',
  sudah:      'bg-emerald-500',
  belum:      'bg-slate-400',
  dibatalkan: 'bg-red-500',
  proses:     'bg-blue-500',
  success:    'bg-emerald-500',
  warning:    'bg-yellow-500',
  error:      'bg-red-500',
  info:       'bg-blue-500',
};

export function sapiStatusToBadgeVariant(status: StatusSapi): BadgeVariant {
  const map: Record<StatusSapi, BadgeVariant> = {
    Menunggu:   'menunggu',
    Disembelih: 'disembelih',
    Dikuliti:   'dikuliti',
    Dicacah:    'dicacah',
    Selesai:    'selesai',
  };
  return map[status];
}

export function kuponStatusToBadgeVariant(status: StatusKupon): BadgeVariant {
  const map: Record<StatusKupon, BadgeVariant> = {
    'Sudah Diambil': 'sudah',
    'Belum Diambil': 'belum',
    'Dibatalkan':    'dibatalkan',
  };
  return map[status];
}

export function distribusiStatusToBadgeVariant(status: StatusDistribusi): BadgeVariant {
  const map: Record<StatusDistribusi, BadgeVariant> = {
    Menunggu: 'menunggu',
    Proses:   'proses',
    Selesai:  'selesai',
  };
  return map[status];
}

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  dot?: boolean;
  className?: string;
}

export function Badge({ variant, label, dot = true, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'badge border',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', dotClasses[variant])} />
      )}
      {label}
    </span>
  );
}
