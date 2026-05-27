import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageCheck, Users, Clock, CheckCircle2, AlertCircle,
  Play, RotateCcw, ChevronDown, ChevronUp, Zap,
  Shield, XCircle, Calendar, Layers,
} from 'lucide-react';
import { useSesi } from '../hooks/useMockData';
import type { Sesi, SesiWarga, StatusSesi } from '../types';

// ============================================================
// Badge status sesi
// ============================================================
const sesiStatusConfig: Record<StatusSesi, { label: string; cls: string; dot: string }> = {
  Menunggu:    { label: 'Menunggu',    cls: 'bg-slate-100 text-slate-600 border-slate-200',   dot: 'bg-slate-400' },
  Berlangsung: { label: 'Berlangsung', cls: 'bg-blue-50 text-blue-600 border-blue-200',       dot: 'bg-blue-500 animate-pulse' },
  Selesai:     { label: 'Selesai',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Penuh:       { label: 'Kuota Penuh', cls: 'bg-red-50 text-red-600 border-red-200',           dot: 'bg-red-500' },
};

function SesiStatusBadge({ status }: { status: StatusSesi }) {
  const cfg = sesiStatusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ============================================================
// Badge status hadir warga
// ============================================================
const hadirConfig = {
  Menunggu:      { cls: 'bg-slate-100 text-slate-500',   icon: <Clock size={11} /> },
  Hadir:         { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={11} /> },
  'Tidak Hadir': { cls: 'bg-red-100 text-red-600',        icon: <XCircle size={11} /> },
};

function HadirBadge({ status }: { status: SesiWarga['statusAmbil'] }) {
  const cfg = hadirConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.cls}`}>
      {cfg.icon}
      {status}
    </span>
  );
}

// ============================================================
// Warga Row inside a Sesi
// ============================================================
function WargaSesiRow({
  wargaSesi,
  sesiId,
  onUpdateStatus,
}: {
  wargaSesi: SesiWarga;
  sesiId: string;
  onUpdateStatus: (sesiId: string, wargaId: string, status: SesiWarga['statusAmbil']) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors group">
      {/* Nomor antrian */}
      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
        {String(wargaSesi.nomorAntrean).padStart(2, '0')}
      </span>

      {/* Nama & RT */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{wargaSesi.namaWarga}</p>
        <p className="text-xs text-slate-400">
          RT {wargaSesi.rt}/RW {wargaSesi.rw}
          {wargaSesi.nomorKupon && (
            <span className="ml-2 font-mono text-emerald-600">{wargaSesi.nomorKupon}</span>
          )}
        </p>
      </div>

      {/* Status badge */}
      <HadirBadge status={wargaSesi.statusAmbil} />

      {/* Action buttons */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {wargaSesi.statusAmbil !== 'Hadir' && (
          <button
            onClick={() => onUpdateStatus(sesiId, wargaSesi.wargaId, 'Hadir')}
            className="w-6 h-6 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600"
            title="Tandai Hadir"
          >
            <CheckCircle2 size={12} />
          </button>
        )}
        {wargaSesi.statusAmbil !== 'Tidak Hadir' && (
          <button
            onClick={() => onUpdateStatus(sesiId, wargaSesi.wargaId, 'Tidak Hadir')}
            className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500"
            title="Tandai Tidak Hadir"
          >
            <XCircle size={12} />
          </button>
        )}
        {wargaSesi.statusAmbil !== 'Menunggu' && (
          <button
            onClick={() => onUpdateStatus(sesiId, wargaSesi.wargaId, 'Menunggu')}
            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
            title="Reset ke Menunggu"
          >
            <RotateCcw size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Sesi Card
// ============================================================
function SesiCard({
  sesi,
  onUpdateStatus,
  onUpdateWargaStatus,
}: {
  sesi: Sesi;
  onUpdateStatus: (id: string, status: Sesi['status']) => void;
  onUpdateWargaStatus: (sesiId: string, wargaId: string, status: SesiWarga['statusAmbil']) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const jumlahHadir = sesi.daftarWarga.filter(w => w.statusAmbil === 'Hadir').length;
  const jumlahTidakHadir = sesi.daftarWarga.filter(w => w.statusAmbil === 'Tidak Hadir').length;
  const jumlahMenunggu = sesi.daftarWarga.filter(w => w.statusAmbil === 'Menunggu').length;
  const isPenuh = sesi.daftarWarga.length >= sesi.kuotaMaks;
  const persen = Math.round((jumlahHadir / sesi.daftarWarga.length) * 100) || 0;

  const statusBorderMap: Record<StatusSesi, string> = {
    Menunggu:    'border-slate-200',
    Berlangsung: 'border-blue-300 shadow-blue-100',
    Selesai:     'border-emerald-200',
    Penuh:       'border-red-300',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border-2 shadow-card overflow-hidden ${statusBorderMap[sesi.status]}`}
    >
      {/* Kuota penuh banner */}
      {isPenuh && sesi.status !== 'Selesai' && (
        <div className="bg-red-500 text-white text-xs font-semibold px-4 py-1.5 flex items-center gap-2">
          <Shield size={12} />
          KUOTA PENUH — Tidak bisa menambah warga ke sesi ini
        </div>
      )}

      {/* Sesi Header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Nomor Sesi */}
        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-bold text-white ${
          isPenuh && sesi.status !== 'Selesai'
            ? 'bg-gradient-to-br from-red-500 to-rose-600'
            : sesi.status === 'Selesai'
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : sesi.status === 'Berlangsung'
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
            : 'bg-gradient-to-br from-slate-400 to-slate-500'
        }`}>
          <span className="text-[10px] font-medium opacity-80">Sesi</span>
          <span className="text-lg leading-none">{sesi.nomorSesi}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800">{sesi.label}</p>
            <SesiStatusBadge status={sesi.status} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {sesi.waktuMulai} – {sesi.waktuSelesai}
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {sesi.daftarWarga.length} / {sesi.kuotaMaks} orang
            </span>
            {jumlahHadir > 0 && (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 size={11} />
                {jumlahHadir} hadir
              </span>
            )}
          </div>

          {/* Mini progress bar */}
          <div className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden w-full max-w-[200px]">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${(sesi.daftarWarga.length / sesi.kuotaMaks) * 100}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {sesi.status === 'Menunggu' && (
            <button
              onClick={() => onUpdateStatus(sesi.id, 'Berlangsung')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-xl transition-colors"
              id={`btn-mulai-sesi-${sesi.nomorSesi}`}
            >
              <Play size={12} /> Mulai
            </button>
          )}
          {sesi.status === 'Berlangsung' && (
            <button
              onClick={() => onUpdateStatus(sesi.id, 'Selesai')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition-colors"
              id={`btn-selesai-sesi-${sesi.nomorSesi}`}
            >
              <CheckCircle2 size={12} /> Selesai
            </button>
          )}
          <button className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Progress stats row */}
      <div className="grid grid-cols-3 border-t border-slate-50 divide-x divide-slate-50">
        {[
          { label: 'Hadir',       value: jumlahHadir,      cls: 'text-emerald-600' },
          { label: 'Menunggu',    value: jumlahMenunggu,   cls: 'text-slate-500' },
          { label: 'Tidak Hadir', value: jumlahTidakHadir, cls: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="py-2 text-center">
            <p className={`text-lg font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Expanded warga list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="p-3 max-h-72 overflow-y-auto space-y-0.5">
              {/* Progress bar hadir */}
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${persen}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">{persen}% hadir</span>
              </div>

              {sesi.daftarWarga.map(w => (
                <WargaSesiRow
                  key={w.wargaId}
                  wargaSesi={w}
                  sesiId={sesi.id}
                  onUpdateStatus={onUpdateWargaStatus}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
// Setup panel: generate sesi
// ============================================================
function SetupSesiPanel({ onGenerate }: { onGenerate: (kuota: number) => void }) {
  const [kuota, setKuota] = useState(50);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-5 shadow-glow-green">
        <Layers size={36} className="text-white" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Buat Sesi Antrian</h2>
      <p className="text-sm text-slate-500 max-w-md mb-8">
        Sistem akan otomatis membagi daftar warga ke dalam sesi berdasarkan RT/RW,
        dengan batas maksimal per sesi yang bisa Anda atur.
      </p>

      {/* Kuota input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card w-full max-w-sm mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Maksimal Peserta per Sesi
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setKuota(k => Math.max(10, k - 10))}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <p className="text-4xl font-bold text-slate-800">{kuota}</p>
            <p className="text-xs text-slate-400 mt-1">orang / sesi</p>
          </div>
          <button
            onClick={() => setKuota(k => Math.min(200, k + 10))}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
          >
            +
          </button>
        </div>
        <div className="flex gap-2 mt-4 justify-center">
          {[25, 50, 100].map(v => (
            <button
              key={v}
              onClick={() => setKuota(v)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                kuota === v
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {v} orang
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onGenerate(kuota)}
        className="btn-primary px-8 py-3 text-base"
        id="btn-generate-sesi"
      >
        <Zap size={18} />
        Generate Sesi Otomatis
      </button>

      <p className="text-xs text-slate-400 mt-3">
        Warga akan diurutkan berdasarkan RT/RW lalu nama
      </p>
    </motion.div>
  );
}

// ============================================================
// Main: Halaman Distribusi Daging
// ============================================================
export default function DistribusiPage() {
  const { sesiList, hasSesi, generateSesi, resetSesi, updateStatus, updateWargaStatus } = useSesi();
  const [filterStatus, setFilterStatus] = useState<StatusSesi | ''>('');

  const filtered = sesiList.filter(s => !filterStatus || s.status === filterStatus);

  // Hitung ringkasan
  const totalWarga      = sesiList.reduce((s, ss) => s + ss.daftarWarga.length, 0);
  const totalHadir      = sesiList.reduce((s, ss) => s + ss.daftarWarga.filter(w => w.statusAmbil === 'Hadir').length, 0);
  const sesiPenuh       = sesiList.filter(s => s.daftarWarga.length >= s.kuotaMaks).length;
  const sesiSelesai     = sesiList.filter(s => s.status === 'Selesai').length;
  const persenHadir     = totalWarga > 0 ? Math.round((totalHadir / totalWarga) * 100) : 0;

  return (
    <div className="space-y-5 max-w-[1000px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PackageCheck size={22} className="text-emerald-600" />
            Distribusi Daging
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {hasSesi
              ? `${sesiList.length} sesi • ${totalWarga} warga • maks 50/sesi`
              : 'Buat sesi antrian untuk memulai distribusi'}
          </p>
        </div>

        {hasSesi && (
          <div className="flex gap-2">
            <button
              onClick={resetSesi}
              className="btn-secondary text-xs"
              id="btn-reset-sesi"
            >
              <RotateCcw size={14} />
              Reset Sesi
            </button>
          </div>
        )}
      </div>

      {!hasSesi ? (
        <SetupSesiPanel onGenerate={(kuota) => generateSesi(kuota)} />
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: <Layers size={16} />,
                label: 'Total Sesi',
                value: sesiList.length,
                cls: 'bg-slate-50 text-slate-700',
              },
              {
                icon: <CheckCircle2 size={16} />,
                label: 'Sesi Selesai',
                value: sesiSelesai,
                cls: 'bg-emerald-50 text-emerald-700',
              },
              {
                icon: <AlertCircle size={16} />,
                label: 'Kuota Penuh',
                value: sesiPenuh,
                cls: sesiPenuh > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400',
              },
              {
                icon: <Users size={16} />,
                label: `Hadir (${persenHadir}%)`,
                value: `${totalHadir}/${totalWarga}`,
                cls: 'bg-blue-50 text-blue-700',
              },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border border-white/50 ${s.cls}`}>
                {s.icon}
                <div>
                  <p className="font-bold text-lg leading-tight">{s.value}</p>
                  <p className="text-xs opacity-70">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress distribusi keseluruhan */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">Progres Kehadiran Keseluruhan</p>
              <span className="text-sm font-bold text-emerald-600">{persenHadir}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                initial={{ width: 0 }}
                animate={{ width: `${persenHadir}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>{totalHadir} warga sudah hadir</span>
              <span>{totalWarga - totalHadir} masih menunggu</span>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-slate-500 font-medium">Filter:</p>
            {(['', 'Menunggu', 'Berlangsung', 'Selesai', 'Penuh'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  filterStatus === s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
                id={`btn-filter-${s || 'semua'}`}
              >
                {s || 'Semua'} {s === '' ? `(${sesiList.length})` : `(${sesiList.filter(ss => ss.status === s).length})`}
              </button>
            ))}
          </div>

          {/* Ikon info maks kuota */}
          {sesiPenuh > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl"
            >
              <Shield size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                <strong>{sesiPenuh} sesi</strong> telah mencapai kuota penuh.
                Warga yang belum terdaftar tidak dapat masuk ke sesi tersebut.
              </p>
            </motion.div>
          )}

          {/* Sesi Cards */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p className="text-sm">Tidak ada sesi dengan filter ini.</p>
              </div>
            ) : (
              filtered.map(sesi => (
                <SesiCard
                  key={sesi.id}
                  sesi={sesi}
                  onUpdateStatus={updateStatus}
                  onUpdateWargaStatus={updateWargaStatus}
                />
              ))
            )}
          </div>

          {/* Tanggal distribusi */}
          {sesiList.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <Calendar size={13} />
              Sesi dibuat untuk distribusi hari ini:&nbsp;
              <span className="font-medium text-slate-500">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
