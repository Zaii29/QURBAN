// ============================================================
// Types & Interfaces â€” Manajemen Qurban
// ============================================================

export type StatusSapi =
  | 'Menunggu'
  | 'Disembelih'
  | 'Dikuliti'
  | 'Dicacah'
  | 'Selesai';

export type StatusKupon = 'Belum Diambil' | 'Sudah Diambil' | 'Dibatalkan';

export type StatusDistribusi = 'Menunggu' | 'Proses' | 'Selesai';

export type JabatanPanitia =
  | 'Ketua'
  | 'Sekretaris'
  | 'Bendahara'
  | 'Koordinator Pemotongan'
  | 'Koordinator Distribusi'
  | 'Anggota';

// ============================================================
// Entity Interfaces
// ============================================================

export interface Sapi {
  id: string;
  nama: string;
  nomorUrut: number;
  jenisHewan: 'Sapi' | 'Kambing';
  berat: number;
  asalHewan: string;
  status: StatusSapi;
  namaKelompok?: string;
  daftarMudhohi?: string[];
  noWaMudhohi?: string;
  waktuMulai?: string;
  waktuSelesai?: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warga {
  id: string;
  nama: string;
  noKtp?: string;
  alamat: string;
  rt: string;
  rw: string;
  noTelepon?: string;
  jumlahKupon: number;
  createdAt: string;
  updatedAt: string;
}

export interface Panitia {
  id: string;
  nama: string;
  jabatan: JabatanPanitia;
  noTelepon: string;
  tugasHari: string; // misal: "Pemotongan & Distribusi"
  isAktif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Kupon {
  id: string;
  nomorKupon: string;
  wargaId: string;
  namaPenerima: string; // denormalized untuk kemudahan tampil
  status: StatusKupon;
  beratHak: number; // kg daging yang berhak diterima
  tanggalTerbit: string; // ISO date string
  tanggalDiambil?: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Distribusi {
  id: string;
  wargaId: string;
  namaWarga: string; // denormalized
  kuponId: string;
  nomorKupon: string; // denormalized
  beratDaging: number; // kg
  sapiId?: string;
  namaSapi?: string;
  tanggal: string; // ISO date string
  status: StatusDistribusi;
  petugasId?: string; // id panitia yang mendistribusi
  namaPetugas?: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Summary / Aggregate types untuk Dashboard
// ============================================================

export interface SapiSummary {
  total: number;
  menunggu: number;
  disembelih: number;
  dikuliti: number;
  dicacah: number;
  selesai: number;
  totalBeratKg: number;
}

export interface KuponSummary {
  totalTerbit: number;
  sudahDiambil: number;
  belumDiambil: number;
  dibatalkan: number;
}

export interface DistribusiSummary {
  totalWarga: number;
  sudahTerdistribusi: number;
  belumTerdistribusi: number;
  totalBeratTerdistribusi: number;
  targetBeratTotal: number;
  persenSelesai: number;
}

export interface DashboardData {
  sapiSummary: SapiSummary;
  kuponSummary: KuponSummary;
  distribusiSummary: DistribusiSummary;
  distribusiPerHari: DistribusiPerHari[];
  wargaPerRT: WargaPerRT[];
}

export interface DistribusiPerHari {
  tanggal: string;
  jumlahWarga: number;
  beratKg: number;
}

export interface WargaPerRT {
  rt: string;
  rw: string;
  jumlah: number;
}

// ============================================================
// Sesi Antrian Distribusi
// ============================================================

export type StatusSesi = 'Menunggu' | 'Berlangsung' | 'Selesai' | 'Penuh';

export interface SesiWarga {
  wargaId: string;
  namaWarga: string;
  rt: string;
  rw: string;
  nomorKupon?: string;
  statusAmbil: 'Hadir' | 'Tidak Hadir' | 'Menunggu';
  nomorAntrean: number;
}

export interface Sesi {
  id: string;
  nomorSesi: number;
  label: string;               // e.g. "Sesi 1 â€” RT 001/RW 001"
  kuotaMaks: number;           // default 50
  waktuMulai: string;          // "08:00"
  waktuSelesai: string;        // "09:00"
  daftarWarga: SesiWarga[];
  status: StatusSesi;
  tanggal: string;             // ISO date
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Import Excel
// ============================================================

/** Baris mentah dari file Excel sebelum divalidasi */
export interface ImportWargaRow {
  Nama?: string;
  'No HP'?: string;
  RT?: string;
  RW?: string;
  Alamat?: string;
  Jabatan?: string;
  'Jumlah Kupon'?: number | string;
}

/** Hasil validasi satu baris import */
export interface ImportValidationResult {
  baris: number;
  data: Partial<ImportWargaRow>;
  valid: boolean;
  errors: string[];
}


// ============================================================
// Keuangan / RAB (Rencana Anggaran Biaya)
// ============================================================

export type JenisTransaksi = 'Pemasukan' | 'Pengeluaran';

export type KategoriPemasukan =
  | 'Iuran Mudhohi'
  | 'Donasi Warga'
  | 'Subsidi Masjid'
  | 'Lain-lain';

export type KategoriPengeluaran =
  | 'Pembelian Hewan'
  | 'Pakan & Akomodasi Hewan'
  | 'Perlengkapan Penyembelihan'
  | 'Upah Jagal'
  | 'Konsumsi Panitia'
  | 'Transportasi'
  | 'Kemasan & Plastik'
  | 'Dekorasi & Dokumentasi'
  | 'Administrasi & ATK'
  | 'Lain-lain';

export type KategoriTransaksi = KategoriPemasukan | KategoriPengeluaran;

export interface TransaksiKeuangan {
  id: string;
  jenis: JenisTransaksi;
  kategori: KategoriTransaksi;
  deskripsi: string;
  jumlah: number;
  tanggal: string;
  noBukti?: string;
  pic?: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeuanganSummary {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
  jumlahPemasukan: number;
  jumlahPengeluaran: number;
}

