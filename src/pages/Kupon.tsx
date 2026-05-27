import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Ticket, Search, X, Download, Eye, CheckCircle2,
  Clock, XCircle, Printer, QrCode, Info, ChevronDown,
} from 'lucide-react';
import { useKupon, useWarga } from '../hooks/useMockData';
import type { Kupon, StatusKupon } from '../types';

// ============================================================
// QR Code data encoder
// ============================================================
function encodeKuponQR(kupon: Kupon): string {
  return JSON.stringify({
    id:       kupon.id,
    no:       kupon.nomorKupon,
    warga:    kupon.namaPenerima,
    berat:    kupon.beratHak,
    terbit:   kupon.tanggalTerbit.split('T')[0],
    app:      'QurbanManager-v1',
  });
}

// ============================================================
// Status config
// ============================================================
const STATUS_CONFIG: Record<StatusKupon, { cls: string; icon: React.ReactNode; label: string }> = {
  'Belum Diambil': { cls: 'bg-slate-100 text-slate-600 border-slate-200',    icon: <Clock size={12} />,       label: 'Belum Diambil' },
  'Sudah Diambil': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={12} />, label: 'Sudah Diambil' },
  'Dibatalkan':    { cls: 'bg-red-50 text-red-600 border-red-200',            icon: <XCircle size={12} />,     label: 'Dibatalkan' },
};

function KuponStatusBadge({ status }: { status: StatusKupon }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ============================================================
// Modal: Detail QR Code Kupon
// ============================================================
interface QRModalProps {
  kupon: Kupon;
  onClose: () => void;
  onAmbil: (id: string) => void;
  onBatal: (id: string) => void;
}

function QRModal({ kupon, onClose, onAmbil, onBatal }: QRModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const qrData = encodeKuponQR(kupon);

  const downloadQR = () => {
    const canvas = canvasRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `QR_${kupon.nomorKupon}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 250 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header strip */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/70">Kupon Digital Qurban</p>
              <p className="text-xl font-bold tracking-wider">{kupon.nomorKupon}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
            >
              <X size={15} className="text-white" />
            </button>
          </div>
        </div>

        {/* QR Code area */}
        <div className="flex flex-col items-center py-6 px-6 bg-slate-50">
          <div
            className="bg-white p-4 rounded-2xl shadow-md border-2 border-slate-100 relative"
            ref={canvasRef}
          >
            {/* Hidden canvas for download */}
            <div className="absolute opacity-0 pointer-events-none">
              <QRCodeCanvas
                value={qrData}
                size={256}
                level="H"
                imageSettings={{
                  src: '',
                  height: 0,
                  width: 0,
                  excavate: false,
                }}
              />
            </div>
            {/* Visible SVG */}
            <QRCodeSVG
              value={qrData}
              size={180}
              level="H"
              bgColor="#ffffff"
              fgColor="#065f46"
              imageSettings={{
                src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzA1OTY2OSIgZD0iTTEyIDJhMTAgMTAgMCAxIDAgMTAgMTBBMTAgMTAgMCAwIDAgMTIgMloiLz48L3N2Zz4=',
                height: 28,
                width: 28,
                excavate: true,
              }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Tunjukkan QR ini kepada petugas distribusi
          </p>
        </div>

        {/* Kupon Info */}
        <div className="px-5 pb-2 space-y-2">
          {[
            { label: 'Penerima',     value: kupon.namaPenerima },
            { label: 'Berat Daging', value: `${kupon.beratHak} kg` },
            { label: 'Terbit',       value: new Date(kupon.tanggalTerbit).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'Status',       value: <KuponStatusBadge status={kupon.status} /> },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{row.label}</span>
              <span className="text-xs font-semibold text-slate-700">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 p-4 pt-3 border-t border-slate-100 mt-2">
          <button
            onClick={downloadQR}
            className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
            id={`btn-download-qr-${kupon.nomorKupon}`}
          >
            <Download size={16} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium">Unduh</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <Printer size={16} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium">Cetak</span>
          </button>
          {kupon.status === 'Belum Diambil' ? (
            <button
              onClick={() => { onAmbil(kupon.id); onClose(); }}
              className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
              id={`btn-tandai-ambil-${kupon.nomorKupon}`}
            >
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span className="text-[10px] text-emerald-700 font-semibold">Tandai Ambil</span>
            </button>
          ) : kupon.status === 'Sudah Diambil' ? (
            <button
              onClick={() => { onBatal(kupon.id); onClose(); }}
              className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
            >
              <XCircle size={16} className="text-red-500" />
              <span className="text-[10px] text-red-600 font-semibold">Batalkan</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl bg-slate-50 opacity-40">
              <XCircle size={16} className="text-slate-400" />
              <span className="text-[10px] text-slate-400">Dibatalkan</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Kupon Card (grid view)
// ============================================================
function KuponCard({ kupon, onView }: { kupon: Kupon; onView: (k: Kupon) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-2xl border-2 shadow-card hover:shadow-card-lg transition-all duration-200 overflow-hidden cursor-pointer group
        ${kupon.status === 'Sudah Diambil' ? 'border-emerald-200' : kupon.status === 'Dibatalkan' ? 'border-red-200 opacity-60' : 'border-slate-200 hover:border-emerald-300'}`}
      onClick={() => onView(kupon)}
    >
      {/* QR Preview */}
      <div className={`flex items-center justify-center py-5 ${
        kupon.status === 'Sudah Diambil' ? 'bg-emerald-50' : kupon.status === 'Dibatalkan' ? 'bg-slate-50' : 'bg-slate-50 group-hover:bg-emerald-50/40'
      } transition-colors relative`}>
        <div className="p-2 bg-white rounded-xl shadow-sm">
          <QRCodeSVG
            value={encodeKuponQR(kupon)}
            size={72}
            level="M"
            fgColor={kupon.status === 'Dibatalkan' ? '#94a3b8' : '#065f46'}
            bgColor="#ffffff"
          />
        </div>

        {/* Status overlay untuk Sudah Diambil */}
        {kupon.status === 'Sudah Diambil' && (
          <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
            <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full rotate-[-12deg] shadow">
              DIAMBIL ✓
            </div>
          </div>
        )}
        {kupon.status === 'Dibatalkan' && (
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
            <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              BATAL ✗
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-1">
          <p className="text-xs font-mono font-bold text-slate-700">{kupon.nomorKupon}</p>
          <KuponStatusBadge status={kupon.status} />
        </div>
        <p className="text-sm font-medium text-slate-800 truncate">{kupon.namaPenerima}</p>
        <p className="text-xs text-slate-400 mt-0.5">{kupon.beratHak} kg daging</p>
      </div>

      {/* View button */}
      <div className="px-3 pb-3">
        <button
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 text-xs font-medium transition-colors"
          id={`btn-view-qr-${kupon.nomorKupon}`}
        >
          <QrCode size={13} /> Lihat QR
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main: Halaman Kupon Digital
// ============================================================
export default function KuponPage() {
  const { kupon, ambilKupon, batalKupon } = useKupon();
  const { warga } = useWarga();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusKupon | ''>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedKupon, setSelectedKupon] = useState<Kupon | null>(null);
  const [filterRT, setFilterRT] = useState('');

  const rtList = [...new Set(warga.map(w => `${w.rt}/${w.rw}`))].sort();

  const filtered = kupon.filter(k => {
    const matchSearch = k.nomorKupon.toLowerCase().includes(search.toLowerCase()) ||
      k.namaPenerima.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || k.status === filterStatus;
    const matchRT = !filterRT || (() => {
      const w = warga.find(x => x.id === k.wargaId);
      return w ? `${w.rt}/${w.rw}` === filterRT : false;
    })();
    return matchSearch && matchStatus && matchRT;
  });

  const sudah  = kupon.filter(k => k.status === 'Sudah Diambil').length;
  const belum  = kupon.filter(k => k.status === 'Belum Diambil').length;
  const batal  = kupon.filter(k => k.status === 'Dibatalkan').length;
  const persen = kupon.length > 0 ? Math.round((sudah / kupon.length) * 100) : 0;

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <QrCode size={22} className="text-emerald-600" />
            Kupon Digital Qurban
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {kupon.length} kupon diterbitkan — klik untuk melihat QR Code
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <Info size={13} className="text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">
            {persen}% sudah diambil
          </span>
        </div>
      </div>

      {/* Summary bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Progres Pengambilan Kupon</p>
          <span className="text-lg font-bold text-emerald-600">{persen}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${persen}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
          {[
            { label: 'Sudah Diambil', value: sudah,  cls: 'text-emerald-600' },
            { label: 'Belum Diambil', value: belum,  cls: 'text-slate-500'   },
            { label: 'Dibatalkan',    value: batal,  cls: 'text-red-500'     },
          ].map(s => (
            <div key={s.label} className="py-1">
              <p className={`text-xl font-bold ${s.cls}`}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-white border border-slate-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input
            id="input-search-kupon"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nomor kupon atau nama..."
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
          />
          {search && <button onClick={() => setSearch('')}><X size={13} className="text-slate-400" /></button>}
        </div>

        {/* Status filter */}
        {(['', 'Belum Diambil', 'Sudah Diambil', 'Dibatalkan'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === s ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
            }`}
          >
            {s || 'Semua'} ({s === '' ? kupon.length : kupon.filter(k => k.status === s).length})
          </button>
        ))}

        {/* RT filter */}
        <div className="relative">
          <select
            value={filterRT}
            onChange={e => setFilterRT(e.target.value)}
            className="appearance-none pl-3 pr-7 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer"
          >
            <option value="">Semua RT/RW</option>
            {rtList.map(rt => (
              <option key={rt} value={rt}>RT {rt.split('/')[0]}/RW {rt.split('/')[1]}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
          {(['grid', 'list'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === mode ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {mode === 'grid' ? '⊞ Grid' : '☰ List'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid / List view */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <AnimatePresence>
            {filtered.map(k => (
              <KuponCard key={k.id} kupon={k} onView={setSelectedKupon} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-300">
              <Ticket size={32} className="mx-auto mb-2" />
              <p className="text-sm">Tidak ada kupon ditemukan.</p>
            </div>
          )}
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['No. Kupon', 'Penerima', 'Berat', 'Status', 'QR Code', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => (
                <tr
                  key={k.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedKupon(k)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-bold text-slate-700">{k.nomorKupon}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{k.namaPenerima}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{k.beratHak} kg</td>
                  <td className="px-4 py-3"><KuponStatusBadge status={k.status} /></td>
                  <td className="px-4 py-3">
                    <div className="p-1 bg-white rounded-lg border border-slate-100 w-fit">
                      <QRCodeSVG value={encodeKuponQR(k)} size={32} level="L" fgColor={k.status === 'Dibatalkan' ? '#94a3b8' : '#065f46'} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                      <Eye size={13} /> Detail
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">Tidak ada kupon.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Modal */}
      <AnimatePresence>
        {selectedKupon && (
          <QRModal
            kupon={selectedKupon}
            onClose={() => setSelectedKupon(null)}
            onAmbil={(id) => { ambilKupon(id); setSelectedKupon(null); }}
            onBatal={(id) => { batalKupon(id); setSelectedKupon(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
