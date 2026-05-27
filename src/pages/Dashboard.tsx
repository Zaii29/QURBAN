import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Beef,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { SapiStatusChart } from '../components/ui/SapiStatusChart';
import { MultiProgressBar } from '../components/ui/ProgressBar';
import { Badge, sapiStatusToBadgeVariant } from '../components/ui/Badge';
import { useSapi } from '../hooks/useMockData';
import type { StatusSapi } from '../types';

// ============================================================
// Dashboard — Fokus Data Hewan Qurban
// ============================================================

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const STATUS_FLOW: StatusSapi[] = ['Menunggu', 'Disembelih', 'Dikuliti', 'Dicacah', 'Selesai'];

const STATUS_STYLE: Record<StatusSapi, { bar: string; text: string; dot: string }> = {
  Menunggu:   { bar: 'bg-slate-200',   text: 'text-slate-400',   dot: 'bg-slate-400'   },
  Disembelih: { bar: 'bg-red-400',     text: 'text-red-500',     dot: 'bg-red-500'     },
  Dikuliti:   { bar: 'bg-orange-400',  text: 'text-orange-500',  dot: 'bg-orange-500'  },
  Dicacah:    { bar: 'bg-yellow-400',  text: 'text-yellow-500',  dot: 'bg-yellow-500'  },
  Selesai:    { bar: 'bg-emerald-500', text: 'text-emerald-600', dot: 'bg-emerald-500' },
};

// Helper: case-insensitive jenis hewan comparison
const isSapi    = (j: string) => j?.toLowerCase() === 'sapi';
const isKambing = (j: string) => j?.toLowerCase() === 'kambing';

// ============================================================
// Real-time clock + Hijriyah/Masehi formatter
// ============================================================
function useRealTimeClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function formatJam(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  });
}

function formatMasehi(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
    timeZone: 'Asia/Jakarta',
  });
}

function formatHijriyah(date: Date): string {
  try {
    // Gunakan kalender Umm al-Qura (Arab Saudi) — standar penentuan Idul Adha
    const hijri = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day:   'numeric',
      month: 'long',
      year:  'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(date);
    return hijri + ' H';
  } catch {
    // Fallback jika browser tidak support
    const hijriEn = new Intl.DateTimeFormat('en-u-ca-islamic', {
      day:   'numeric',
      month: 'long',
      year:  'numeric',
    }).format(date);
    return hijriEn + ' H';
  }
}

// Sub-component: Clock Banner
function ClockBanner() {
  const now = useRealTimeClock();
  const jam     = formatJam(now);
  const masehi  = formatMasehi(now);
  const hijriyah = formatHijriyah(now);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-700 rounded-2xl p-4 text-white shadow-lg"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Kiri: nama lembaga */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">🕌</span>
          <div>
            <p className="text-base font-black tracking-tight">Pondok Riyadhussholihiin</p>
            <p className="text-emerald-200 text-xs">Manajemen Qurban · Idul Adha 1446 H</p>
          </div>
        </div>

        {/* Kanan: jam + tanggal */}
        <div className="flex items-end gap-6 flex-wrap justify-end">
          {/* Jam digital */}
          <div className="text-right">
            <p className="text-4xl font-black tabular-nums tracking-widest leading-none">{jam}</p>
            <p className="text-emerald-300 text-[11px] mt-0.5 text-right">WIB (Asia/Jakarta)</p>
          </div>

          {/* Tanggal */}
          <div className="border-l border-emerald-500 pl-6 text-right">
            <p className="text-sm font-semibold text-white leading-snug">{masehi}</p>
            <p className="text-emerald-200 text-xs mt-0.5 flex items-center justify-end gap-1">
              <span>☽</span>
              <span>{hijriyah}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  // Ambil data langsung dari localStorage via useSapi — single source of truth
  const { sapi: allHewan } = useSapi();

  // ── Counter yang benar ─────────────────────────────────────
  const totalHewan    = allHewan.length;
  const jumlahSapi    = allHewan.filter(h => isSapi(h.jenisHewan)).length;
  const jumlahKambing = allHewan.filter(h => isKambing(h.jenisHewan)).length;
  const sudahSelesai  = allHewan.filter(h => h.status === 'Selesai').length;
  const totalBeratKg  = allHewan.reduce((acc, h) => acc + (h.berat || 0), 0);

  // ── Hitungan per status ─────────────────────────────────────
  const countByStatus = (s: StatusSapi) => allHewan.filter(h => h.status === s).length;
  const disembelih = countByStatus('Disembelih');
  const dikuliti   = countByStatus('Dikuliti');
  const dicacah    = countByStatus('Dicacah');
  const menunggu   = countByStatus('Menunggu');
  const selesai    = countByStatus('Selesai');
  const sedangProses = disembelih + dikuliti + dicacah;

  const persen = totalHewan > 0 ? Math.round((sudahSelesai / totalHewan) * 100) : 0;

  // ── Data untuk chart (format SapiSummary) ──────────────────
  const sapiSummaryForChart = {
    total: totalHewan,
    menunggu,
    disembelih,
    dikuliti,
    dicacah,
    selesai,
    totalBeratKg,
  };

  const sapiSegments = [
    { value: selesai,    color: 'bg-emerald-500', label: 'Selesai'    },
    { value: dicacah,    color: 'bg-yellow-400',  label: 'Dicacah'    },
    { value: dikuliti,   color: 'bg-orange-400',  label: 'Dikuliti'   },
    { value: disembelih, color: 'bg-red-500',     label: 'Disembelih' },
    { value: menunggu,   color: 'bg-slate-300',   label: 'Menunggu'   },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1400px]"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Beef size={22} className="text-emerald-600" />
            Hewan Qurban
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pantau status seluruh hewan qurban secara real-time
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">Live Monitor</span>
        </div>
      </motion.div>

      {/* ── Summary Cards ──────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Hewan Qurban',
            value: totalHewan,
            emoji: '🐾',
            border: 'border-slate-200',
            sub: `${totalBeratKg.toLocaleString('id-ID')} kg total`,
            note: `${jumlahSapi} sapi + ${jumlahKambing} kambing`,
          },
          {
            label: 'Jumlah Sapi',
            // Filter murni: hanya hewan dengan jenisHewan === 'Sapi'
            value: jumlahSapi,
            emoji: '🐄',
            border: 'border-emerald-200',
            sub: 'ekor sapi',
            note: allHewan.filter(h => isSapi(h.jenisHewan)).map(h => h.namaKelompok || h.nama).slice(0, 2).join(', ') || '—',
          },
          {
            label: 'Jumlah Kambing/Domba',
            // Filter murni: hanya hewan dengan jenisHewan === 'Kambing'
            value: jumlahKambing,
            emoji: '🐐',
            border: 'border-teal-200',
            sub: 'ekor kambing/domba',
            note: allHewan.filter(h => isKambing(h.jenisHewan)).map(h => h.namaKelompok || h.nama).slice(0, 2).join(', ') || '—',
          },
          {
            label: 'Sudah Selesai',
            value: sudahSelesai,
            emoji: '✅',
            border: 'border-emerald-300',
            sub: `${persen}% tuntas`,
            note: `${totalHewan - sudahSelesai} masih diproses`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white rounded-2xl border-2 shadow-card p-4 ${s.border}`}
          >
            <p className="text-2xl mb-2">{s.emoji}</p>
            <p className="text-4xl font-black text-slate-800">{s.value}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">{s.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>
            <p className="text-[11px] text-slate-300 mt-0.5 truncate">{s.note}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Chart + Rekap ──────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Status Donut Chart */}
        <div className="card-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Status Hewan</h2>
              <p className="text-xs text-slate-400 mt-0.5">{totalHewan} ekor terdaftar</p>
            </div>
            {sudahSelesai > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <CheckCircle2 size={12} />
                {sudahSelesai} selesai
              </div>
            )}
          </div>

          {totalHewan > 0 ? (
            <>
              <SapiStatusChart summary={sapiSummaryForChart} />
              <div className="mt-4">
                <MultiProgressBar segments={sapiSegments} total={totalHewan} size="lg" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-300">
              <span className="text-4xl mb-2">🐄</span>
              <p className="text-sm">Belum ada data hewan</p>
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="card-lg lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Rekap per Status</h2>
            <span className="text-xs text-slate-400">{persen}% selesai</span>
          </div>

          {/* Overall progress */}
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-5">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${persen}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          <div className="space-y-3">
            {STATUS_FLOW.map(status => {
              const count = countByStatus(status);
              const pct   = totalHewan > 0 ? (count / totalHewan) * 100 : 0;
              const style = STATUS_STYLE[status];
              const pulse = status !== 'Menunggu' && status !== 'Selesai' && count > 0;

              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-28 flex-shrink-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot} ${pulse ? 'animate-pulse' : ''}`} />
                    <span className={`text-xs font-semibold ${style.text}`}>{status}</span>
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${style.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          {sedangProses > 0 && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <Clock size={14} className="text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                {sedangProses} hewan sedang dalam proses pemotongan
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Daftar Lengkap Hewan ───────────────────────────── */}
      <motion.div variants={itemVariants} className="card-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Daftar Seluruh Hewan Qurban</h2>
          <span className="text-xs text-slate-400">{totalHewan} ekor terdaftar</span>
        </div>

        {totalHewan === 0 ? (
          <div className="text-center py-16">
            <AlertCircle size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Belum ada hewan qurban terdaftar.</p>
            <p className="text-slate-300 text-xs mt-1">Tambahkan hewan di menu "Data Sapi".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {allHewan.map((h, i) => {
              const style     = STATUS_STYLE[h.status];
              const isSelesai = h.status === 'Selesai';
              const isActive  = h.status !== 'Menunggu' && h.status !== 'Selesai';
              const stepIdx   = STATUS_FLOW.indexOf(h.status);

              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`bg-white rounded-2xl border-2 p-4 transition-all ${
                    isSelesai ? 'border-emerald-200 opacity-80' :
                    isActive  ? 'border-orange-200 shadow-md'   :
                                'border-slate-100'
                  }`}
                >
                  {/* Icon + nomor */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {isSapi(h.jenisHewan) ? '🐄' : '🐐'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        #{String(h.nomorUrut).padStart(2, '0')}
                      </span>
                    </div>
                    <Badge variant={sapiStatusToBadgeVariant(h.status)} label={h.status} dot />
                  </div>

                  {/* Nama kelompok */}
                  <p className="text-sm font-bold text-slate-800 leading-snug truncate">
                    {h.namaKelompok || h.nama}
                  </p>
                  {h.daftarMudhohi && h.daftarMudhohi.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {h.daftarMudhohi.join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">⚖️ {h.berat} kg</p>

                  {/* Stepper mini */}
                  <div className="flex gap-0.5 mt-3">
                    {STATUS_FLOW.map((_, si) => (
                      <div
                        key={si}
                        className={`flex-1 h-1 rounded-full transition-all ${
                          si < stepIdx   ? 'bg-emerald-400' :
                          si === stepIdx ? `${style.bar} ${isActive ? 'animate-pulse' : ''}` :
                                          'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
