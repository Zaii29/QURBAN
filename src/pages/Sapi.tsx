/**
 * Halaman Manajemen Hewan Qurban
 * Mendukung Sapi & Kambing, integrasi WA Fonnte / Simulasi
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Settings2, X, ChevronDown,
  CheckCircle2, AlertTriangle, MessageSquare,
  Trash2, ToggleLeft, ToggleRight, Loader2,
  ZapOff, Zap, Filter, Weight, MapPin, Phone,
  Users, SlidersHorizontal, WifiOff,
} from 'lucide-react';
import { useSapi } from '../hooks/useMockData';
import type { Sapi, StatusSapi } from '../types';

// ============================================================
// Constants & Helpers
// ============================================================
const STATUS_FLOW: StatusSapi[] = ['Menunggu', 'Disembelih', 'Dikuliti', 'Dicacah', 'Selesai'];

// Helper to normalize status string
const normalizeStatus = (status: string | undefined): StatusSapi => {
  if (!status) return 'Menunggu';
  const capStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  return (STATUS_FLOW.includes(capStatus as StatusSapi) ? capStatus : 'Menunggu') as StatusSapi;
};

const STATUS_CFG: Record<StatusSapi, { color: string; bg: string; border: string; dot: string }> = {
  Menunggu:    { color: 'text-slate-500',   bg: 'bg-slate-50',    border: 'border-slate-200', dot: 'bg-slate-400'   },
  Disembelih:  { color: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-200',   dot: 'bg-red-500'     },
  Dikuliti:    { color: 'text-orange-600',  bg: 'bg-orange-50',   border: 'border-orange-200',dot: 'bg-orange-500'  },
  Dicacah:     { color: 'text-yellow-600',  bg: 'bg-yellow-50',   border: 'border-yellow-200',dot: 'bg-yellow-500'  },
  Selesai:     { color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200',dot: 'bg-emerald-500' },
};

const WA_MESSAGES: Record<StatusSapi, (nama: string, kelompok: string) => string> = {
  Menunggu:    (n, k) => `Assalamu'alaikum, ${n}! Hewan Qurban kelompok *${k}* sedang dalam antrean pemotongan. Mohon bersabar. 🐄`,
  Disembelih:  (n, k) => `Assalamu'alaikum, ${n}! Alhamdulillah, hewan Qurban kelompok *${k}* baru saja *disembelih*. Proses sedang berlanjut. 🔪`,
  Dikuliti:    (n, k) => `Assalamu'alaikum, ${n}! Hewan Qurban kelompok *${k}* sedang dalam proses *pengkulitan*. Sebentar lagi! 🥩`,
  Dicacah:     (n, k) => `Assalamu'alaikum, ${n}! Hewan Qurban kelompok *${k}* sedang *dicacah/dibagi*. Distribusi akan segera dimulai. ⚖️`,
  Selesai:     (n, k) => `Assalamu'alaikum, ${n}! Hewan Qurban kelompok *${k}* telah *selesai* diproses. Silakan ambil daging Anda sesuai jadwal. Jazakallahu Khairan! 🎉`,
};

const WA_CONFIG_LS = 'qurban_wa_config';
const WA_LOG_LS    = 'qurban_wa_log';

interface WaConfig { token: string; modeAsli: boolean; }
interface WaLog {
  id: string;
  namaHewan: string;
  status: StatusSapi;
  target: string;
  pesan: string;
  success: boolean | null; // null = simulated
  timestamp: string;
}

function loadWaConfig(): WaConfig {
  try { return JSON.parse(localStorage.getItem(WA_CONFIG_LS) || '{}'); } catch { return { token: '', modeAsli: false }; }
}
function saveWaConfig(cfg: WaConfig) { localStorage.setItem(WA_CONFIG_LS, JSON.stringify(cfg)); }
function loadWaLog(): WaLog[] {
  try { return JSON.parse(localStorage.getItem(WA_LOG_LS) || '[]'); } catch { return []; }
}
function saveWaLog(logs: WaLog[]) { localStorage.setItem(WA_LOG_LS, JSON.stringify(logs.slice(0, 100))); }

async function sendFonnte(token: string, target: string, message: string): Promise<boolean> {
  try {
    const normalized = target.replace(/\D/g, '').replace(/^0/, '62');
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: normalized, message, countryCode: '62' }),
    });
    const json = await res.json();
    return json.status === true || json.status === 'true' || res.ok;
  } catch {
    return false;
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ============================================================
// Sub-component: Status Badge
// ============================================================
function StatusBadge({ status }: { status: StatusSapi }) {
  const safeStatus = normalizeStatus(status);
  const cfg = STATUS_CFG[safeStatus] || STATUS_CFG['Menunggu'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg?.color || ''} ${cfg?.bg || ''} ${cfg?.border || ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot || 'bg-slate-400'}`} />
      {safeStatus}
    </span>
  );
}

// ============================================================
// Sub-component: Progress Stepper
// ============================================================
function StatusStepper({ status }: { status: StatusSapi }) {
  const safeStatus = normalizeStatus(status);
  const current = STATUS_FLOW.indexOf(safeStatus);
  return (
    <div className="flex items-center gap-0.5 mt-2">
      {STATUS_FLOW.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${
            i <= current ? 'bg-emerald-500' : 'bg-slate-100'
          }`} />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Modal: Token API WA
// ============================================================
function TokenModal({ config, onSave, onClose }: {
  config: WaConfig;
  onSave: (cfg: WaConfig) => void;
  onClose: () => void;
}) {
  const [token, setToken] = useState(config.token);
  const [modeAsli, setModeAsli] = useState(config.modeAsli);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        transition={{ type: 'spring', damping: 22 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <Settings2 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Pengaturan WA Blast</p>
              <p className="text-xs text-slate-400">Fonnte API Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Mode toggle */}
          <div className={`p-4 rounded-xl border-2 ${modeAsli ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {modeAsli ? <Zap size={16} className="text-green-600" /> : <ZapOff size={16} className="text-slate-400" />}
                <span className={`text-sm font-semibold ${modeAsli ? 'text-green-700' : 'text-slate-500'}`}>
                  {modeAsli ? 'WA Asli (Fonnte)' : 'WA Simulasi'}
                </span>
              </div>
              <button
                onClick={() => setModeAsli(!modeAsli)}
                className="flex items-center gap-1.5"
                id="toggle-wa-mode"
              >
                {modeAsli
                  ? <ToggleRight size={32} className="text-green-500" />
                  : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {modeAsli
                ? 'Pesan WA akan dikirim nyata melalui Fonnte ke nomor Mudhohi.'
                : 'Pesan WA hanya disimulasikan dan tampil sebagai log di layar.'}
            </p>
          </div>

          {/* Token input */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Token Fonnte API
            </label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Masukkan token Fonnte Anda..."
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-green-400 focus:bg-white transition-colors font-mono"
              id="input-fonnte-token"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Dapatkan token di <span className="text-green-600 font-medium">fonnte.com → Device → Token</span>
            </p>
          </div>

          {!token && modeAsli && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Token wajib diisi jika mode WA Asli aktif. Tanpa token, sistem akan otomatis fallback ke simulasi.</p>
            </div>
          )}
        </div>

        <div className="p-5 pt-0 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Batal</button>
          <button
            onClick={() => { onSave({ token, modeAsli }); onClose(); }}
            className="btn-primary flex-1 justify-center"
            id="btn-simpan-wa-config"
          >
            <CheckCircle2 size={15} /> Simpan Konfigurasi
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Modal: Tambah Hewan Baru
// ============================================================
interface TambahHewanForm {
  jenisHewan: 'Sapi' | 'Kambing';
  namaKelompok: string;
  namaJemaah: string;        // → customer_name di Supabase
  noWaMudhohi: string;       // → whatsapp di Supabase
  berat: string;
  asalHewan: string;
  catatan: string;
}

const EMPTY_HEWAN: TambahHewanForm = {
  jenisHewan: 'Sapi',
  namaKelompok: '',
  namaJemaah: '',
  noWaMudhohi: '',
  berat: '',
  asalHewan: '',
  catatan: '',
};

function TambahHewanModal({ maxUrut, onClose, onSave }: {
  maxUrut: number;
  onClose: () => void;
  onSave: (data: Omit<Sapi, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [form, setForm] = useState<TambahHewanForm>(EMPTY_HEWAN);
  const [error, setError] = useState('');

  const set = (k: keyof TambahHewanForm, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.namaKelompok.trim()) { setError('Nama kelompok wajib diisi.'); return; }
    if (!form.namaJemaah.trim()) { setError('Nama Jemaah / Mudhohi utama wajib diisi.'); return; }
    if (!form.berat || Number(form.berat) <= 0) { setError('Berat hewan harus lebih dari 0.'); return; }
    if (!form.asalHewan.trim()) { setError('Asal/Supplier wajib diisi.'); return; }

    onSave({
      nomorUrut:     maxUrut + 1,
      nama:          form.namaJemaah.trim(), // Multiple names can be entered here directly
      jenisHewan:    form.jenisHewan,
      namaKelompok:  form.namaKelompok.trim(),
      noWaMudhohi:   form.noWaMudhohi.trim() || undefined,
      berat:         Number(form.berat),
      asalHewan:     form.asalHewan.trim(),
      catatan:       form.catatan.trim() || undefined,
      status:        'Menunggu',
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        transition={{ type: 'spring', damping: 22 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{form.jenisHewan === 'Sapi' ? '🐄' : '🐐'}</span>
            <div>
              <p className="font-bold text-slate-800">Tambah Hewan Qurban</p>
              <p className="text-xs text-slate-400">Hewan #{maxUrut + 1}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Jenis Hewan */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Jenis Hewan</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Sapi', 'Kambing'] as const).map(j => (
                <button
                  key={j}
                  onClick={() => set('jenisHewan', j)}
                  className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                    form.jenisHewan === j
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-500 hover:border-emerald-200'
                  }`}
                  id={`toggle-jenis-${j.toLowerCase()}`}
                >
                  <span className="text-xl">{j === 'Sapi' ? '🐄' : '🐐'}</span>
                  {j === 'Sapi' ? 'Sapi' : 'Kambing/Domba'}
                </button>
              ))}
            </div>
          </div>

          {/* Nama Kelompok */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Nama Kelompok *
              <span className="text-slate-400 font-normal ml-1 normal-case">(disimpan ke group_name)</span>
            </label>
            <input
              type="text"
              value={form.namaKelompok}
              onChange={e => set('namaKelompok', e.target.value)}
              placeholder="Misal: Kelompok RT 003, Keluarga Pak Hasan..."
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:bg-white transition-colors"
              id="input-nama-kelompok"
            />
          </div>

          {/* Nama Jemaah / Customer */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Nama Jemaah / Mudhohi Utama *
              <span className="text-slate-400 font-normal ml-1 normal-case">(disimpan ke customer_name)</span>
            </label>
            <input
              type="text"
              value={form.namaJemaah}
              onChange={e => set('namaJemaah', e.target.value)}
              placeholder="Misal: Pak Hasan bin Ali..."
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:bg-white transition-colors"
              id="input-nama-jemaah"
            />
          </div>

          {/* Nomor WA */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Nomor WA Mudhohi Utama
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">+62</span>
              <input
                type="tel"
                value={form.noWaMudhohi}
                onChange={e => set('noWaMudhohi', e.target.value)}
                placeholder="812-3456-7890"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:bg-white transition-colors font-mono"
                id="input-no-wa-mudhohi"
              />
            </div>
          </div>

          {/* Berat + Asal row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Berat (kg) *</label>
              <input
                type="number"
                value={form.berat}
                onChange={e => set('berat', e.target.value)}
                placeholder="280"
                min="10"
                max="800"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                id="input-berat-hewan"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Asal / Supplier *</label>
              <input
                type="text"
                value={form.asalHewan}
                onChange={e => set('asalHewan', e.target.value)}
                placeholder="Pak Peternak – Ciawi"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                id="input-asal-hewan"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Catatan</label>
            <input
              type="text"
              value={form.catatan}
              onChange={e => set('catatan', e.target.value)}
              placeholder="Keterangan tambahan..."
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:bg-white transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="p-5 pt-0 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Batal</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center" id="btn-simpan-hewan">
            <Plus size={14} /> Tambah Hewan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Sub-component: Hewan Card
// ============================================================
function HewanCard({
  hewan,
  onStatusChange,
  onDelete,
  isSending,
}: {
  hewan: Sapi;
  onStatusChange: (id: string, status: StatusSapi) => void;
  onDelete: (id: string) => void;
  isSending: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!hewan) return null;
  const safeStatus = normalizeStatus(hewan?.status);
  const cfg = STATUS_CFG[safeStatus] || STATUS_CFG['Menunggu'];
  const stepIdx = STATUS_FLOW.indexOf(safeStatus);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full bg-white rounded-2xl border-2 shadow-card hover:shadow-card-lg transition-all duration-200 overflow-hidden ${cfg?.border || 'border-slate-200'}`}
    >
      {/* Card header */}
      <div className={`px-4 pt-4 pb-3 ${cfg?.bg || 'bg-slate-50'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">
              {hewan?.jenisHewan?.toLowerCase() === 'sapi' ? '🐄' : '🐐'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400">#{String(hewan?.nomorUrut || 0).padStart(2, '0')}</span>
                <StatusBadge status={safeStatus} />
              </div>
              
              {/* Identitas Jemaah & Kelompok */}
              <div className="mt-2 flex flex-col gap-1.5">
                <div className="flex items-start gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase w-14 mt-0.5 flex-shrink-0">Mudhohi</span>
                  <span className="text-sm font-bold text-slate-800 leading-snug break-words whitespace-normal flex-1">{hewan?.nama || 'Tanpa Nama'}</span>
                </div>
                {hewan?.namaKelompok && (
                  <div className="flex items-start gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase w-14 mt-0.5 flex-shrink-0">Kelompok</span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md break-words whitespace-normal flex-1">{hewan?.namaKelompok}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onDelete(hewan?.id)}
            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
            title="Hapus hewan"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Stepper */}
        <StatusStepper status={safeStatus} />
        <div className="flex justify-between mt-1">
          {STATUS_FLOW.map((s, i) => (
            <span key={s} className={`text-[8px] font-medium ${i <= stepIdx ? 'text-emerald-600' : 'text-slate-300'}`}>
              {s.slice(0, 4)}
            </span>
          ))}
        </div>
      </div>

      {/* Info rows */}
      <div className="px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Weight size={11} className="text-slate-400" />
          <span className="font-medium">{hewan?.berat || 0} kg</span>
          <span className="text-slate-300">·</span>
          <MapPin size={11} className="text-slate-400" />
          <span className="truncate">{hewan?.asalHewan || '-'}</span>
        </div>

        {hewan?.daftarMudhohi && hewan.daftarMudhohi.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-slate-500">
            <Users size={11} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{hewan.daftarMudhohi.join(', ')}</span>
          </div>
        )}

        {hewan?.noWaMudhohi && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Phone size={10} />
            <span className="font-mono">{hewan.noWaMudhohi}</span>
          </div>
        )}
      </div>

      {/* Status update dropdown */}
      <div className="px-4 pb-4">
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            disabled={safeStatus === 'Selesai' || isSending}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              safeStatus === 'Selesai'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 opacity-60 cursor-not-allowed'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300 cursor-pointer'
            }`}
            id={`btn-status-${hewan?.id}`}
          >
            <span className="flex items-center gap-1.5">
              {isSending
                ? <Loader2 size={12} className="animate-spin text-emerald-500" />
                : <SlidersHorizontal size={12} className="text-slate-400" />}
              {safeStatus === 'Selesai' ? 'Proses Selesai ✓' : 'Ubah Status'}
            </span>
            {safeStatus !== 'Selesai' && <ChevronDown size={12} className="text-slate-400" />}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-10"
              >
                {STATUS_FLOW.filter(s => s !== safeStatus).map(s => {
                  const c = STATUS_CFG[s] || STATUS_CFG['Menunggu'];
                  return (
                    <button
                      key={s}
                      onClick={() => { setOpen(false); onStatusChange(hewan?.id, s); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:${c?.bg || 'bg-slate-50'} transition-colors ${c?.color || 'text-slate-500'}`}
                      id={`btn-set-status-${s.toLowerCase().replace(' ', '-')}-${hewan?.id}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${c?.dot || 'bg-slate-400'}`} />
                      {s}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Sub-component: WA Log Sidebar
// ============================================================
function WaLogSidebar({ logs, onClear }: { logs: WaLog[]; onClear: () => void }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-emerald-600" />
          <p className="text-sm font-bold text-slate-800">Log WA Blast</p>
          {logs.length > 0 && (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
              {logs.length}
            </span>
          )}
        </div>
        {logs.length > 0 && (
          <button onClick={onClear} className="text-[10px] text-slate-400 hover:text-red-400 transition-colors">
            Hapus log
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <WifiOff size={24} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-300">Belum ada WA blast terkirim.</p>
            <p className="text-[11px] text-slate-300 mt-1">Ubah status hewan untuk memicu blast.</p>
          </div>
        ) : (
          [...logs].reverse().map(log => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-xl border text-xs ${
                log.success === null
                  ? 'bg-slate-50 border-slate-200'
                  : log.success
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{log.namaHewan?.includes('Kambing') ? '🐐' : '🐄'}</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[100px]">{log.namaHewan || 'Hewan'}</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  log.success === null ? 'bg-slate-200 text-slate-500' :
                  log.success ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'
                }`}>
                  {log.success === null ? 'SIMULASI' : log.success ? 'TERKIRIM ✓' : 'GAGAL ✗'}
                </span>
              </div>

              <p className="font-mono text-[10px] text-slate-400 mb-1">{log.target || '—'}</p>

              {/* Chat bubble style */}
              <div className="bg-white rounded-xl rounded-tl-none border border-slate-100 p-2 text-slate-600 leading-relaxed">
                {log.pesan}
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <StatusBadge status={log.status} />
                <span className="text-[10px] text-slate-400">{formatTime(log.timestamp)}</span>
              </div>
            </motion.div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

// ============================================================
// Main Page: Manajemen Hewan Qurban
// ============================================================
export default function SapiPage() {
  const { sapi, addSapi, deleteSapi, updateStatus } = useSapi();

  // WA config state
  const [waConfig, setWaConfig] = useState<WaConfig>(() => loadWaConfig());
  const [waLog, setWaLog]       = useState<WaLog[]>(() => loadWaLog());
  const [sending, setSending]   = useState<Record<string, boolean>>({});

  // UI state
  const [showToken, setShowToken]   = useState(false);
  const [showTambah, setShowTambah] = useState(false);
  const [filterJenis, setFilterJenis] = useState<'Semua' | 'Sapi' | 'Kambing'>('Semua');
  const [filterStatus, setFilterStatus] = useState<StatusSapi | 'Semua'>('Semua');

  // Persist wa config
  const saveConfig = useCallback((cfg: WaConfig) => {
    setWaConfig(cfg);
    saveWaConfig(cfg);
  }, []);

  // Persist log
  const appendLog = useCallback((entry: Omit<WaLog, 'id'>) => {
    const newLog: WaLog = { ...entry, id: `${Date.now()}-${Math.random()}` };
    setWaLog(prev => {
      const updated = [...prev, newLog];
      saveWaLog(updated);
      return updated;
    });
  }, []);

  // Handle status change + WA blast
  const handleStatusChange = useCallback(async (id: string, newStatus: StatusSapi) => {
    const hewan = sapi.find(s => s.id === id);
    if (!hewan) return;

    updateStatus(id, newStatus);
    setSending(p => ({ ...p, [id]: true }));

    const namaKelompok = hewan.namaKelompok || hewan.nama;
    const mudhohi = hewan.daftarMudhohi?.[0] || namaKelompok;
    const pesan = WA_MESSAGES[newStatus](mudhohi, namaKelompok);
    const target = hewan.noWaMudhohi || '';

    const useReal = waConfig.modeAsli && !!waConfig.token && !!target;

    if (useReal) {
      const success = await sendFonnte(waConfig.token, target, pesan);
      appendLog({
        namaHewan: namaKelompok,
        status: newStatus,
        target,
        pesan,
        success,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Simulated with delay
      await new Promise(r => setTimeout(r, 600));
      appendLog({
        namaHewan: namaKelompok,
        status: newStatus,
        target,
        pesan,
        success: null,
        timestamp: new Date().toISOString(),
      });
    }

    setSending(p => ({ ...p, [id]: false }));
  }, [sapi, waConfig, updateStatus, appendLog]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Hapus hewan ini dari daftar?')) deleteSapi(id);
  }, [deleteSapi]);

  const clearLog = useCallback(() => {
    setWaLog([]);
    saveWaLog([]);
  }, []);

  const maxUrut = sapi?.reduce((m, s) => Math.max(m, s?.nomorUrut || 0), 0) || 0;

  // Filtered list
  const filtered = sapi?.filter(s => {
    if (!s) return false;
    const matchJenis  = filterJenis === 'Semua' || s?.jenisHewan === filterJenis;
    const matchStatus = filterStatus === 'Semua' || normalizeStatus(s?.status) === filterStatus;
    return matchJenis && matchStatus;
  }) || [];

  // Summary counts
  const countSapi    = sapi?.filter(s => s?.jenisHewan?.toLowerCase() === 'sapi')?.length || 0;
  const countKambing = sapi?.filter(s => s?.jenisHewan?.toLowerCase() === 'kambing')?.length || 0;
  const countSelesai = sapi?.filter(s => normalizeStatus(s?.status) === 'Selesai')?.length || 0;
  const isWaActive   = waConfig.modeAsli && !!waConfig.token;

  return (
    <div className="flex gap-5 max-w-[1400px] h-full">
      {/* ── Main Panel ──────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-2xl">🐄🐐</span> Manajemen Hewan Qurban
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {countSapi} sapi · {countKambing} kambing · {countSelesai} selesai
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* WA Mode Indicator + Toggle */}
            <button
              onClick={() => saveConfig({ ...waConfig, modeAsli: !waConfig.modeAsli })}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isWaActive
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
              id="toggle-wa-mode-header"
              title={isWaActive ? 'Mode WA Asli aktif — klik untuk simulasi' : 'Mode Simulasi — klik untuk aktifkan WA asli'}
            >
              {isWaActive
                ? <><ToggleRight size={18} className="text-green-500" /> WA Asli (Fonnte)</>
                : <><ToggleLeft size={18} className="text-slate-300" /> WA Simulasi</>}
            </button>

            {/* Token button */}
            <button
              onClick={() => setShowToken(true)}
              className="btn-secondary text-xs"
              id="btn-open-wa-token"
            >
              <Settings2 size={14} /> Token API WA
            </button>

            {/* Tambah hewan */}
            <button
              onClick={() => setShowTambah(true)}
              className="btn-primary text-xs"
              id="btn-tambah-hewan"
            >
              <Plus size={14} /> Tambah Hewan Baru
            </button>
          </div>
        </div>

        {/* WA warning banner */}
        {waConfig.modeAsli && !waConfig.token && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl"
          >
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Mode WA Asli aktif tetapi token belum diisi. Klik <strong>Token API WA</strong> untuk mengisi token Fonnte.
            </p>
          </motion.div>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400" />

          {/* Jenis filter */}
          {(['Semua', 'Sapi', 'Kambing'] as const).map(j => (
            <button
              key={j}
              onClick={() => setFilterJenis(j)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                filterJenis === j ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              {j === 'Sapi' ? '🐄' : j === 'Kambing' ? '🐐' : ''} {j}
            </button>
          ))}

          <span className="w-px h-4 bg-slate-200" />

          {/* Status filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as StatusSapi | 'Semua')}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <span className="ml-auto text-xs text-slate-400">{filtered.length} dari {sapi.length} hewan</span>
        </div>

        {/* Hewan grid */}
        {!sapi ? (
          <div className="text-center py-20">
            <Loader2 size={32} className="animate-spin text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Memuat data hewan qurban...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">🐄</span>
            <p className="text-slate-400 text-sm mt-3">Tidak ada hewan ditemukan.</p>
            <button onClick={() => setShowTambah(true)} className="btn-primary text-sm mt-4">
              <Plus size={14} /> Tambah Hewan Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((h, i) => {
                if (!h) return null;
                return (
                  <HewanCard
                    key={h?.id || i}
                    hewan={h}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    isSending={!!sending[h?.id]}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Log Sidebar ──────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 hidden lg:block">
        <div className="sticky top-0 bg-white rounded-2xl border border-slate-100 shadow-card p-4 h-[calc(100vh-7rem)] overflow-hidden flex flex-col">
          <WaLogSidebar logs={waLog} onClear={clearLog} />
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showToken && (
          <TokenModal config={waConfig} onSave={saveConfig} onClose={() => setShowToken(false)} />
        )}
        {showTambah && (
          <TambahHewanModal maxUrut={maxUrut} onClose={() => setShowTambah(false)} onSave={addSapi} />
        )}
      </AnimatePresence>
    </div>
  );
}
