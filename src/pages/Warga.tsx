import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {
  Users, Upload, Download, Search, Trash2,
  X, CheckCircle2, AlertTriangle, FileSpreadsheet,
  ChevronDown, Info, Phone, MapPin, Ticket,
} from 'lucide-react';
import { useWarga } from '../hooks/useMockData';
import type { ImportWargaRow, Warga } from '../types';

// ============================================================
// Konstanta kolom Excel
// ============================================================
const EXCEL_COLUMNS = [
  { header: 'Nama',         required: true,  contoh: 'Ahmad Sudirman',      desc: 'Nama lengkap warga' },
  { header: 'No HP',        required: false, contoh: '0812-3456-7890',      desc: 'Nomor HP aktif (opsional)' },
  { header: 'RT',           required: true,  contoh: '001',                  desc: 'Nomor RT (3 digit)' },
  { header: 'RW',           required: false, contoh: '002',                  desc: 'Nomor RW (opsional, default 001)' },
  { header: 'Alamat',       required: false, contoh: 'Jl. Melati No. 5',    desc: 'Alamat lengkap (opsional)' },
  { header: 'Jumlah Kupon', required: false, contoh: '1',                    desc: 'Jumlah kupon (default 1, maks 5)' },
];

// ============================================================
// Sub-komponen: Modal Panduan Import
// ============================================================
function PanduanModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <FileSpreadsheet size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Panduan Import Excel</h3>
              <p className="text-xs text-slate-400">Format kolom yang dibutuhkan</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Deskripsi */}
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Petunjuk penggunaan:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-600">
                <li>Unduh template Excel menggunakan tombol "Download Template"</li>
                <li>Isi data warga sesuai kolom yang tersedia</li>
                <li>Simpan file dan upload menggunakan tombol "Import Excel"</li>
                <li>Kolom dengan tanda <span className="font-bold text-red-500">*</span> wajib diisi</li>
              </ol>
            </div>
          </div>

          {/* Tabel kolom */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Format Kolom Excel</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-semibold">Nama Kolom</th>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-semibold">Wajib</th>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-semibold">Contoh</th>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-semibold">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {EXCEL_COLUMNS.map((col, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-4 py-2.5">
                        <code className="text-emerald-700 font-mono text-xs bg-emerald-50 px-1.5 py-0.5 rounded">
                          {col.header}
                        </code>
                        {col.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        {col.required
                          ? <span className="text-xs font-semibold text-red-500">Wajib</span>
                          : <span className="text-xs text-slate-400">Opsional</span>
                        }
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs font-mono">{col.contoh}</td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs">{col.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Data yang diimport akan <strong>ditambahkan</strong> ke daftar warga yang sudah ada.
              Pastikan tidak ada duplikasi nama sebelum mengimport.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Sub-komponen: Modal Hasil Import
// ============================================================
interface ImportResult {
  berhasil: number;
  gagal: number;
  pesanGagal: string[];
}

function HasilImportModal({ result, onClose }: { result: ImportResult; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            result.gagal === 0 ? 'bg-emerald-50' : 'bg-amber-50'
          }`}>
            {result.gagal === 0
              ? <CheckCircle2 size={28} className="text-emerald-500" />
              : <AlertTriangle size={28} className="text-amber-500" />
            }
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Hasil Import Excel</h3>

          <div className="flex justify-center gap-8 my-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{result.berhasil}</p>
              <p className="text-xs text-slate-500 mt-0.5">Berhasil diimpor</p>
            </div>
            {result.gagal > 0 && (
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{result.gagal}</p>
                <p className="text-xs text-slate-500 mt-0.5">Gagal / Dilewati</p>
              </div>
            )}
          </div>

          {result.pesanGagal.length > 0 && (
            <div className="text-left bg-red-50 border border-red-100 rounded-xl p-3 max-h-40 overflow-y-auto mb-4">
              <p className="text-xs font-semibold text-red-600 mb-1.5">Detail kegagalan:</p>
              {result.pesanGagal.map((msg, i) => (
                <p key={i} className="text-xs text-red-500 leading-relaxed">• {msg}</p>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="btn-primary w-full justify-center"
          >
            Selesai
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// WargaRow component
// ============================================================
function WargaRow({ warga, onDelete }: { warga: Warga; onDelete: (id: string) => void }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {warga.nama.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">{warga.nama}</p>
            {warga.noTelepon && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Phone size={10} /> {warga.noTelepon}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin size={12} className="text-slate-400" />
          {warga.alamat || `RT ${warga.rt}/RW ${warga.rw}`}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
          RT {warga.rt} / RW {warga.rw}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Ticket size={13} className="text-emerald-500" />
          <span className="text-sm font-semibold text-slate-700">{warga.jumlahKupon}</span>
          <span className="text-xs text-slate-400">kupon</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onDelete(warga.id)}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-all"
          title="Hapus warga"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </motion.tr>
  );
}

// ============================================================
// Main: Halaman Data Warga
// ============================================================
export default function WargaPage() {
  const { warga, reload, deleteWarga, importExcel } = useWarga();
  const [search, setSearch] = useState('');
  const [filterRT, setFilterRT] = useState('');
  const [showPanduan, setShowPanduan] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter logic
  const rtList = [...new Set(warga.map(w => `${w.rt}/${w.rw}`))].sort();
  const filtered = warga.filter(w => {
    const matchSearch = w.nama.toLowerCase().includes(search.toLowerCase()) ||
      (w.noTelepon ?? '').includes(search);
    const matchRT = !filterRT || `${w.rt}/${w.rw}` === filterRT;
    return matchSearch && matchRT;
  });

  // Download template Excel
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      EXCEL_COLUMNS.map(c => c.header),
      ['Ahmad Sudirman', '0812-3456-7890', '001', '001', 'Jl. Melati No. 1', '1'],
      ['Siti Aminah',    '0878-9012-3456', '001', '001', 'Jl. Melati No. 2', '2'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Warga');
    XLSX.writeFile(wb, 'Template_Import_Warga_Qurban.xlsx');
  };

  // Parse & import Excel
  const processFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv');
      return;
    }
    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<ImportWargaRow>(ws, { defval: '' });
      if (rows.length === 0) {
        alert('File Excel kosong atau tidak bisa dibaca.');
        return;
      }
      const result = importExcel(rows);
      setImportResult(result);
    } catch (err) {
      console.error(err);
      alert('Gagal membaca file Excel. Pastikan format file benar.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [importExcel]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const totalKupon = warga.reduce((s, w) => s + w.jumlahKupon, 0);

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users size={22} className="text-emerald-600" />
            Data Warga
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {warga.length} warga terdaftar • {totalKupon} kupon total
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPanduan(true)}
            className="btn-secondary text-xs"
            id="btn-panduan-import"
          >
            <Info size={14} />
            Panduan Kolom
          </button>
          <button
            onClick={downloadTemplate}
            className="btn-secondary text-xs"
            id="btn-download-template"
          >
            <Download size={14} />
            Template Excel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="btn-primary text-xs"
            id="btn-import-excel"
          >
            <Upload size={14} />
            {isImporting ? 'Mengimpor...' : 'Import Excel'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileInput}
            id="input-file-excel"
          />
        </div>
      </div>

      {/* Stat mini cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Warga',   value: warga.length,    color: 'bg-emerald-50 text-emerald-700',  icon: <Users size={16} /> },
          { label: 'Total Kupon',   value: totalKupon,      color: 'bg-amber-50 text-amber-700',      icon: <Ticket size={16} /> },
          { label: 'Jumlah RT',     value: rtList.length,   color: 'bg-blue-50 text-blue-700',        icon: <MapPin size={16} /> },
          { label: 'Warga Filtered',value: filtered.length, color: 'bg-slate-100 text-slate-600',     icon: <Search size={16} /> },
        ].map((s, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${s.color} border border-white/50`}>
            {s.icon}
            <div>
              <p className="text-lg font-bold leading-tight">{s.value}</p>
              <p className="text-xs opacity-70">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-emerald-400 bg-emerald-50 scale-[1.01]'
            : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
        }`}
        id="dropzone-excel"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          isDragging ? 'bg-emerald-100' : 'bg-slate-100'
        }`}>
          <FileSpreadsheet size={20} className={isDragging ? 'text-emerald-600' : 'text-slate-400'} />
        </div>
        <div>
          <p className={`text-sm font-medium ${isDragging ? 'text-emerald-700' : 'text-slate-600'}`}>
            {isDragging ? 'Lepaskan file di sini...' : 'Drag & drop file Excel ke sini, atau klik untuk memilih'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Mendukung format .xlsx, .xls, dan .csv</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-slate-200 rounded-xl px-3 py-2">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            id="input-search-warga"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau no HP..."
            className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            id="select-filter-rt"
            value={filterRT}
            onChange={e => setFilterRT(e.target.value)}
            className="appearance-none pl-3 pr-7 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer"
          >
            <option value="">Semua RT/RW</option>
            {rtList.map(rt => (
              <option key={rt} value={rt}>RT {rt.split('/')[0]} / RW {rt.split('/')[1]}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {(search || filterRT) && (
          <button
            onClick={() => { setSearch(''); setFilterRT(''); }}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <X size={12} /> Reset filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Nama Warga', 'Alamat', 'RT / RW', 'Kupon', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      {warga.length === 0 ? 'Belum ada data warga. Import Excel untuk memulai.' : 'Tidak ada hasil yang cocok.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map(w => (
                  <WargaRow key={w.id} warga={w} onDelete={deleteWarga} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Menampilkan {filtered.length} dari {warga.length} warga
            </p>
            <button
              onClick={reload}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPanduan && <PanduanModal onClose={() => setShowPanduan(false)} />}
        {importResult && (
          <HasilImportModal
            result={importResult}
            onClose={() => { setImportResult(null); reload(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
