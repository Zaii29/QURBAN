import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {
  Wallet, TrendingUp, TrendingDown, Scale,
  Plus, Trash2, FileSpreadsheet, Printer, X,
  ChevronDown, Receipt, User, Calendar, Hash,
  Filter, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { useKeuangan } from '../hooks/useMockData';
import type {
  TransaksiKeuangan, JenisTransaksi,
  KategoriPemasukan, KategoriPengeluaran,
} from '../types';

// ============================================================
// Constants
// ============================================================
const KATEGORI_PEMASUKAN: KategoriPemasukan[] = [
  'Iuran Mudhohi', 'Donasi Warga', 'Subsidi Masjid', 'Lain-lain',
];
const KATEGORI_PENGELUARAN: KategoriPengeluaran[] = [
  'Pembelian Hewan', 'Pakan & Akomodasi Hewan', 'Perlengkapan Penyembelihan',
  'Upah Jagal', 'Konsumsi Panitia', 'Transportasi',
  'Kemasan & Plastik', 'Dekorasi & Dokumentasi', 'Administrasi & ATK', 'Lain-lain',
];

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatTgl = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

// ============================================================
// Modal Tambah Transaksi
// ============================================================
interface FormState {
  jenis: JenisTransaksi;
  kategori: string;
  deskripsi: string;
  jumlah: string;
  tanggal: string;
  noBukti: string;
  pic: string;
  catatan: string;
}

const EMPTY_FORM: FormState = {
  jenis: 'Pemasukan',
  kategori: 'Iuran Mudhohi',
  deskripsi: '',
  jumlah: '',
  tanggal: new Date().toISOString().split('T')[0],
  noBukti: '',
  pic: '',
  catatan: '',
};

function TambahModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: Omit<TransaksiKeuangan, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  const kategoriOptions =
    form.jenis === 'Pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;

  const set = (field: keyof FormState, val: string) =>
    setForm(prev => ({
      ...prev,
      [field]: val,
      ...(field === 'jenis' ? { kategori: val === 'Pemasukan' ? 'Iuran Mudhohi' : 'Pembelian Hewan' } : {}),
    }));

  const handleSubmit = () => {
    if (!form.deskripsi.trim()) { setError('Deskripsi wajib diisi.'); return; }
    const jumlah = parseInt(form.jumlah.replace(/\D/g, ''));
    if (!jumlah || jumlah <= 0) { setError('Jumlah harus lebih dari 0.'); return; }
    onSave({
      jenis:     form.jenis,
      kategori:  form.kategori as TransaksiKeuangan['kategori'],
      deskripsi: form.deskripsi.trim(),
      jumlah,
      tanggal:   new Date(form.tanggal).toISOString(),
      noBukti:   form.noBukti.trim() || undefined,
      pic:       form.pic.trim() || undefined,
      catatan:   form.catatan.trim() || undefined,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Plus size={18} className="text-emerald-600" />
            </div>
            <p className="font-bold text-slate-800">Tambah Transaksi</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Jenis toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Pemasukan', 'Pengeluaran'] as JenisTransaksi[]).map(j => (
                <button
                  key={j}
                  onClick={() => set('jenis', j)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    form.jenis === j
                      ? j === 'Pemasukan'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                        : 'bg-red-50 border-red-400 text-red-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                  id={`toggle-jenis-${j.toLowerCase()}`}
                >
                  {j === 'Pemasukan' ? <TrendingUp size={14} className="inline mr-1.5" /> : <TrendingDown size={14} className="inline mr-1.5" />}
                  {j}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Kategori</label>
            <div className="relative">
              <select
                value={form.kategori}
                onChange={e => set('kategori', e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
                id="select-kategori-transaksi"
              >
                {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Deskripsi *</label>
            <input
              type="text"
              value={form.deskripsi}
              onChange={e => set('deskripsi', e.target.value)}
              placeholder="Keterangan transaksi..."
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:bg-white transition-colors"
              id="input-deskripsi-transaksi"
            />
          </div>

          {/* Jumlah + Tanggal row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Jumlah (Rp) *</label>
              <input
                type="text"
                value={form.jumlah ? parseInt(form.jumlah.replace(/\D/g, '') || '0').toLocaleString('id-ID') : ''}
                onChange={e => set('jumlah', e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                id="input-jumlah-transaksi"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Tanggal</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={e => set('tanggal', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                id="input-tanggal-transaksi"
              />
            </div>
          </div>

          {/* No Bukti + PIC row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">No. Bukti</label>
              <input
                type="text"
                value={form.noBukti}
                onChange={e => set('noBukti', e.target.value)}
                placeholder="KWT-001 / BKK-001"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">PIC</label>
              <input
                type="text"
                value={form.pic}
                onChange={e => set('pic', e.target.value)}
                placeholder="Nama penanggung jawab"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="p-5 pt-0 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Batal</button>
          <button onClick={handleSubmit} className="btn-primary flex-1 justify-center" id="btn-simpan-transaksi">
            <CheckCircle2 size={15} /> Simpan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Tabel transaksi (pemasukan / pengeluaran)
// ============================================================
function TransaksiTable({
  data,
  jenis,
  onDelete,
}: {
  data: TransaksiKeuangan[];
  jenis: JenisTransaksi;
  onDelete: (id: string) => void;
}) {
  const isPemasukan = jenis === 'Pemasukan';
  const total = data.reduce((s, t) => s + t.jumlah, 0);

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-card overflow-hidden ${
      isPemasukan ? 'border-emerald-100' : 'border-red-100'
    }`}>
      {/* Table header strip */}
      <div className={`px-5 py-3 flex items-center justify-between ${
        isPemasukan ? 'bg-emerald-50' : 'bg-red-50'
      }`}>
        <div className="flex items-center gap-2">
          {isPemasukan
            ? <TrendingUp size={16} className="text-emerald-600" />
            : <TrendingDown size={16} className="text-red-500" />}
          <p className={`font-bold text-sm ${isPemasukan ? 'text-emerald-700' : 'text-red-700'}`}>
            {jenis} <span className="font-normal opacity-70">({data.length} transaksi)</span>
          </p>
        </div>
        <p className={`text-base font-bold ${isPemasukan ? 'text-emerald-700' : 'text-red-700'}`}>
          {formatRp(total)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Tanggal', 'Kategori', 'Deskripsi', 'No. Bukti', 'PIC', 'Jumlah', ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-300 text-sm">
                    Belum ada transaksi {jenis.toLowerCase()}.
                  </td>
                </tr>
              ) : (
                data.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-50 hover:bg-slate-50/70 group transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar size={11} />
                        {formatTgl(t.tanggal)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                        isPemasukan ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {t.kategori}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[200px]">
                      <p className="truncate text-sm">{t.deskripsi}</p>
                      {t.catatan && <p className="text-xs text-slate-400 truncate">{t.catatan}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {t.noBukti
                        ? <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{t.noBukti}</span>
                        : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {t.pic
                        ? <span className="flex items-center gap-1"><User size={10} />{t.pic}</span>
                        : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm font-bold ${isPemasukan ? 'text-emerald-700' : 'text-red-600'}`}>
                        {isPemasukan ? '+' : '–'} {formatRp(t.jumlah)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onDelete(t.id)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-all"
                        title="Hapus transaksi"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
          {data.length > 0 && (
            <tfoot>
              <tr className={`border-t-2 ${isPemasukan ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Total {jenis}
                </td>
                <td className={`px-4 py-3 text-base font-bold ${isPemasukan ? 'text-emerald-700' : 'text-red-700'}`}>
                  {formatRp(total)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ============================================================
// Hidden print area
// ============================================================
function PrintArea({
  pemasukan,
  pengeluaran,
  totalP,
  totalK,
  saldo,
}: {
  pemasukan: TransaksiKeuangan[];
  pengeluaran: TransaksiKeuangan[];
  totalP: number;
  totalK: number;
  saldo: number;
}) {
  const tglCetak = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div id="print-laporan-keuangan" style={{ display: 'none' }}>
      {/* Kop laporan */}
      <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '2px solid #065f46', paddingBottom: 12 }}>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: '#065f46', margin: 0 }}>
          LAPORAN KEUANGAN QURBAN
        </h1>
        <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0' }}>
          Pondok Riyadhussholihiin — Panitia Qurban 1446 H
        </p>
        <p style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0 0' }}>Dicetak: {tglCetak}</p>
      </div>

      {/* Ringkasan */}
      <div className="print-summary-box" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total Kas Masuk', value: formatRp(totalP), color: '#16a34a' },
          { label: 'Total Kas Keluar', value: formatRp(totalK), color: '#dc2626' },
          { label: 'Saldo Akhir', value: formatRp(saldo), color: saldo >= 0 ? '#16a34a' : '#dc2626' },
        ].map(s => (
          <div key={s.label} className="print-summary-item" style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 14px', flex: 1 }}>
            <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: s.color, margin: '2px 0 0' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabel Pemasukan */}
      <p className="print-section-header" style={{ fontSize: 12, fontWeight: 700, color: '#065f46', borderBottom: '2px solid #065f46', paddingBottom: 4, marginBottom: 8 }}>
        A. PEMASUKAN ({pemasukan.length} transaksi)
      </p>
      <table>
        <thead>
          <tr>
            {['No', 'Tanggal', 'Kategori', 'Deskripsi', 'No. Bukti', 'PIC', 'Jumlah'].map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {pemasukan.map((t, i) => (
            <tr key={t.id}>
              <td style={{ width: 28 }}>{i + 1}</td>
              <td style={{ width: 90 }}>{formatTgl(t.tanggal)}</td>
              <td>{t.kategori}</td>
              <td>{t.deskripsi}</td>
              <td style={{ width: 80 }}>{t.noBukti ?? '—'}</td>
              <td style={{ width: 120 }}>{t.pic ?? '—'}</td>
              <td style={{ width: 110, textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>{formatRp(t.jumlah)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="print-total">
            <td colSpan={6} style={{ fontWeight: 700 }}>Total Pemasukan</td>
            <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>{formatRp(totalP)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Tabel Pengeluaran */}
      <p className="print-section-header" style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', borderBottom: '2px solid #dc2626', paddingBottom: 4, marginBottom: 8, marginTop: 20 }}>
        B. PENGELUARAN ({pengeluaran.length} transaksi)
      </p>
      <table>
        <thead>
          <tr>
            {['No', 'Tanggal', 'Kategori', 'Deskripsi', 'No. Bukti', 'PIC', 'Jumlah'].map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {pengeluaran.map((t, i) => (
            <tr key={t.id}>
              <td style={{ width: 28 }}>{i + 1}</td>
              <td style={{ width: 90 }}>{formatTgl(t.tanggal)}</td>
              <td>{t.kategori}</td>
              <td>{t.deskripsi}</td>
              <td style={{ width: 80 }}>{t.noBukti ?? '—'}</td>
              <td style={{ width: 120 }}>{t.pic ?? '—'}</td>
              <td style={{ width: 110, textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>{formatRp(t.jumlah)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="print-total">
            <td colSpan={6} style={{ fontWeight: 700 }}>Total Pengeluaran</td>
            <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{formatRp(totalK)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Saldo */}
      <div style={{ marginTop: 20, padding: '10px 14px', border: '2px solid #065f46', borderRadius: 8, background: '#f0fdf4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: '#065f46', margin: 0 }}>SALDO AKHIR</p>
          <p style={{ fontWeight: 800, fontSize: 16, color: saldo >= 0 ? '#16a34a' : '#dc2626', margin: 0 }}>{formatRp(saldo)}</p>
        </div>
      </div>

      {/* TTD */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
        <div style={{ textAlign: 'center', width: 200 }}>
          <p style={{ fontSize: 11, margin: 0 }}>Bendahara Panitia Qurban,</p>
          <div style={{ height: 50 }} />
          <p style={{ fontSize: 11, fontWeight: 700, borderTop: '1px solid #000', paddingTop: 4, margin: 0 }}>
            Ibu Fatimah Zahra
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main: Halaman Laporan Keuangan
// ============================================================
export default function KeuanganPage() {
  const { transaksi, summary, addTransaksi, deleteTransaksi } = useKeuangan();
  const [showTambah, setShowTambah] = useState(false);
  const [filterJenis, setFilterJenis] = useState<JenisTransaksi | ''>('');

  const pemasukan   = transaksi.filter(t => t.jenis === 'Pemasukan');
  const pengeluaran = transaksi.filter(t => t.jenis === 'Pengeluaran');
  const displayed   = filterJenis ? transaksi.filter(t => t.jenis === filterJenis) : transaksi;

  const { totalPemasukan, totalPengeluaran, saldo } = summary;

  // ── Export Excel ─────────────────────────────────────────
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ringkasan
    const wsRing = XLSX.utils.aoa_to_sheet([
      ['LAPORAN KEUANGAN QURBAN 1446 H'],
      ['Pondok Riyadhussholihiin — Panitia Qurban'],
      [],
      ['Keterangan', 'Jumlah'],
      ['Total Kas Masuk', totalPemasukan],
      ['Total Kas Keluar', totalPengeluaran],
      ['Saldo Akhir', saldo],
    ]);
    XLSX.utils.book_append_sheet(wb, wsRing, 'Ringkasan');

    // Sheet 2: Pemasukan
    const wsP = XLSX.utils.json_to_sheet(pemasukan.map((t, i) => ({
      No: i + 1,
      Tanggal: formatTgl(t.tanggal),
      Kategori: t.kategori,
      Deskripsi: t.deskripsi,
      'No. Bukti': t.noBukti ?? '',
      PIC: t.pic ?? '',
      'Jumlah (Rp)': t.jumlah,
    })));
    XLSX.utils.book_append_sheet(wb, wsP, 'Pemasukan');

    // Sheet 3: Pengeluaran
    const wsK = XLSX.utils.json_to_sheet(pengeluaran.map((t, i) => ({
      No: i + 1,
      Tanggal: formatTgl(t.tanggal),
      Kategori: t.kategori,
      Deskripsi: t.deskripsi,
      'No. Bukti': t.noBukti ?? '',
      PIC: t.pic ?? '',
      'Jumlah (Rp)': t.jumlah,
    })));
    XLSX.utils.book_append_sheet(wb, wsK, 'Pengeluaran');

    // Sheet 4: Ledger
    const wsLedger = XLSX.utils.json_to_sheet(transaksi.map((t, i) => ({
      No: i + 1,
      Tanggal: formatTgl(t.tanggal),
      Jenis: t.jenis,
      Kategori: t.kategori,
      Deskripsi: t.deskripsi,
      'No. Bukti': t.noBukti ?? '',
      PIC: t.pic ?? '',
      'Jumlah (Rp)': t.jumlah,
    })));
    XLSX.utils.book_append_sheet(wb, wsLedger, 'Ledger Lengkap');

    const tgl = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `RAB_Qurban_${tgl}.xlsx`);
  };

  // ── Export PDF via print ──────────────────────────────────
  const exportPdf = () => window.print();

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Hidden print area */}
      <PrintArea
        pemasukan={pemasukan}
        pengeluaran={pengeluaran}
        totalP={totalPemasukan}
        totalK={totalPengeluaran}
        saldo={saldo}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3 print-hide">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet size={22} className="text-emerald-600" />
            Laporan Keuangan RAB
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Rencana Anggaran Biaya Qurban 1446 H — Pondok Riyadhussholihiin
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportExcel} className="btn-secondary text-xs" id="btn-export-excel-rab">
            <FileSpreadsheet size={14} className="text-emerald-600" /> Export Excel
          </button>
          <button onClick={exportPdf} className="btn-secondary text-xs" id="btn-export-pdf-rab">
            <Printer size={14} className="text-slate-500" /> Export PDF
          </button>
          <button onClick={() => setShowTambah(true)} className="btn-primary text-xs" id="btn-tambah-transaksi">
            <Plus size={14} /> Tambah Transaksi
          </button>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print-hide">
        {/* Kas Masuk */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border-2 border-emerald-100 shadow-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Kas Masuk</p>
              <p className="text-xl font-bold text-emerald-700">{formatRp(totalPemasukan)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{summary.jumlahPemasukan} transaksi</span>
            <span className="text-emerald-500 font-medium">Pemasukan</span>
          </div>
          <div className="h-1.5 bg-emerald-100 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: totalPemasukan > 0 ? `${Math.min((totalPemasukan / (totalPemasukan + totalPengeluaran)) * 100, 100)}%` : '0%' }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>

        {/* Kas Keluar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.10 }}
          className="bg-white rounded-2xl border-2 border-red-100 shadow-card p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Kas Keluar</p>
              <p className="text-xl font-bold text-red-600">{formatRp(totalPengeluaran)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{summary.jumlahPengeluaran} transaksi</span>
            <span className="text-red-400 font-medium">Pengeluaran</span>
          </div>
          <div className="h-1.5 bg-red-100 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full bg-red-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: totalPengeluaran > 0 ? `${Math.min((totalPengeluaran / (totalPemasukan + totalPengeluaran)) * 100, 100)}%` : '0%' }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>

        {/* Saldo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`bg-white rounded-2xl border-2 shadow-card p-5 ${
            saldo >= 0 ? 'border-blue-100' : 'border-orange-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              saldo >= 0 ? 'bg-blue-50' : 'bg-orange-50'
            }`}>
              <Scale size={20} className={saldo >= 0 ? 'text-blue-600' : 'text-orange-500'} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Saldo Akhir</p>
              <p className={`text-xl font-bold ${saldo >= 0 ? 'text-blue-700' : 'text-orange-600'}`}>
                {formatRp(Math.abs(saldo))}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{saldo >= 0 ? 'Surplus' : 'Defisit'}</span>
            <span className={`font-semibold ${saldo >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
              {saldo >= 0 ? '▲' : '▼'} {((Math.abs(saldo) / Math.max(totalPemasukan, 1)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${saldo >= 0 ? 'bg-blue-400' : 'bg-orange-400'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((Math.abs(saldo) / Math.max(totalPemasukan, 1)) * 100, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Filter bar ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap print-hide">
        <Filter size={14} className="text-slate-400" />
        {([
          { label: 'Semua Transaksi', val: '' },
          { label: 'Pemasukan Saja', val: 'Pemasukan' },
          { label: 'Pengeluaran Saja', val: 'Pengeluaran' },
        ] as const).map(f => (
          <button
            key={f.label}
            onClick={() => setFilterJenis(f.val)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterJenis === f.val
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
            }`}
          >
            {f.label} ({f.val === '' ? transaksi.length : transaksi.filter(t => t.jenis === f.val).length})
          </button>
        ))}
      </div>

      {/* ── Tabel Pemasukan ────────────────────────────────── */}
      {(filterJenis === '' || filterJenis === 'Pemasukan') && (
        <TransaksiTable data={pemasukan} jenis="Pemasukan" onDelete={deleteTransaksi} />
      )}

      {/* ── Tabel Pengeluaran ──────────────────────────────── */}
      {(filterJenis === '' || filterJenis === 'Pengeluaran') && (
        <TransaksiTable data={pengeluaran} jenis="Pengeluaran" onDelete={deleteTransaksi} />
      )}

      {/* ── Saldo Footer ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center justify-between p-5 rounded-2xl border-2 font-bold print-hide ${
          saldo >= 0
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-orange-50 border-orange-200 text-orange-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <Receipt size={20} />
          <div>
            <p className="text-base">Saldo Akhir Kas Qurban</p>
            <p className="text-xs font-normal opacity-60">
              {formatRp(totalPemasukan)} − {formatRp(totalPengeluaran)}
            </p>
          </div>
        </div>
        <p className="text-2xl">
          {saldo >= 0 ? '+' : '−'} {formatRp(Math.abs(saldo))}
        </p>
      </motion.div>

      {/* ── Modals ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showTambah && (
          <TambahModal
            onClose={() => setShowTambah(false)}
            onSave={addTransaksi}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
