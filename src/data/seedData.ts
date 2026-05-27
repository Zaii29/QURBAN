import { v4 as uuidv4 } from 'uuid';
import type {
  Sapi,
  Warga,
  Panitia,
  Kupon,
  Distribusi,
  TransaksiKeuangan,
} from '../types';

// ============================================================
// Helpers
// ============================================================
const now = () => new Date().toISOString();
const today = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};

// ============================================================
// Seed: Sapi (10 ekor)
// ============================================================
export const seedSapi: Sapi[] = [
  {
    id: uuidv4(), nomorUrut: 1, nama: 'Sapi 01 – Pak Hasan', jenisHewan: 'Sapi',
    berat: 320, asalHewan: 'Pak Hasan – Ciawi', status: 'Selesai',
    waktuMulai: today(-1), waktuSelesai: today(-1),
    catatan: 'Hewan sehat, proses lancar.', createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nomorUrut: 2, nama: 'Sapi 02 – Bu Sari', jenisHewan: 'Sapi',
    berat: 295, asalHewan: 'Bu Sari – Bogor', status: 'Selesai',
    waktuMulai: today(-1), waktuSelesai: today(-1),
    catatan: '', createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nomorUrut: 3, nama: 'Sapi 03 – Pak Rudi', jenisHewan: 'Sapi',
    berat: 310, asalHewan: 'Pak Rudi – Sukabumi', status: 'Selesai',
    waktuMulai: today(), waktuSelesai: today(),
    catatan: 'Berjalan lancar.', createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nomorUrut: 4, nama: 'Sapi 04 – Pak Dedi', jenisHewan: 'Sapi',
    berat: 340, asalHewan: 'Pak Dedi – Bandung', status: 'Dicacah',
    waktuMulai: today(), catatan: 'Dalam proses pencacahan.',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nomorUrut: 5, nama: 'Sapi 05 – Pak Ahmad', jenisHewan: 'Sapi',
    berat: 280, asalHewan: 'Pak Ahmad – Cibinong', status: 'Dicacah',
    waktuMulai: today(), catatan: '',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nomorUrut: 6, nama: 'Sapi 06 – Bu Rina', jenisHewan: 'Sapi',
    berat: 305, asalHewan: 'Bu Rina – Depok', status: 'Dikuliti',
    waktuMulai: today(), catatan: 'Sedang dikuliti oleh tim panitia.',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nomorUrut: 7, nama: 'Sapi 07 – Pak Yusuf', jenisHewan: 'Sapi',
    berat: 330, asalHewan: 'Pak Yusuf – Tangerang', status: 'Disembelih',
    waktuMulai: today(), catatan: 'Baru disembelih.',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nomorUrut: 8, nama: 'Sapi 08 – Pak Budi', jenisHewan: 'Sapi',
    berat: 315, asalHewan: 'Pak Budi – Bekasi', status: 'Menunggu',
    catatan: 'Menunggu giliran pemotongan.',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nomorUrut: 9, nama: 'Sapi 09 – Bu Dewi', jenisHewan: 'Sapi',
    berat: 290, asalHewan: 'Bu Dewi – Karawang', status: 'Menunggu',
    catatan: '', createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nomorUrut: 10, nama: 'Sapi 10 – Pak Irwan', jenisHewan: 'Sapi',
    berat: 350, asalHewan: 'Pak Irwan – Purwakarta', status: 'Menunggu',
    catatan: 'Sapi terbesar, antrian terakhir.',
    createdAt: now(), updatedAt: now(),
  },
];

// ============================================================
// Seed: Panitia (6 orang)
// ============================================================
export const seedPanitia: Panitia[] = [
  {
    id: uuidv4(), nama: 'H. Abdul Karim', jabatan: 'Ketua',
    noTelepon: '0812-3456-7890', tugasHari: 'Koordinasi umum & pengawasan',
    isAktif: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nama: 'Ustadz Rizky Fadillah', jabatan: 'Sekretaris',
    noTelepon: '0821-4567-8901', tugasHari: 'Pencatatan & administrasi kupon',
    isAktif: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nama: 'Ibu Fatimah Zahra', jabatan: 'Bendahara',
    noTelepon: '0857-5678-9012', tugasHari: 'Keuangan & laporan RAB',
    isAktif: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nama: 'Pak Surya Darma', jabatan: 'Koordinator Pemotongan',
    noTelepon: '0813-6789-0123', tugasHari: 'Supervisi pemotongan & penyembelihan',
    isAktif: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nama: 'Pak Hendra Wijaya', jabatan: 'Koordinator Distribusi',
    noTelepon: '0878-7890-1234', tugasHari: 'Koordinasi distribusi daging ke warga',
    isAktif: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: uuidv4(), nama: 'Pak Doni Saputra', jabatan: 'Anggota',
    noTelepon: '0895-8901-2345', tugasHari: 'Pemotongan & pengemasan daging',
    isAktif: true, createdAt: now(), updatedAt: now(),
  },
];

// ============================================================
// Seed: Warga (50 warga, 5 RT, 2 RW)
// ============================================================
const namaWarga = [
  'Suherman', 'Romlah', 'Agus Santoso', 'Siti Aminah', 'Bambang Purnomo',
  'Nur Hidayah', 'Wahyu Utomo', 'Dewi Rahayu', 'Eko Prasetyo', 'Aisyah Putri',
  'Djoko Widodo', 'Mariam Sari', 'Fauzi Rahman', 'Rahayu Ningsih', 'Teguh Santoso',
  'Yuliana Sari', 'Irwan Kusuma', 'Nuraini', 'Darmadi', 'Sumiati',
  'Kurniawan', 'Endang Susanti', 'Prayitno', 'Laila Fitriani', 'Supriadi',
  'Wulandari', 'Mulyono', 'Sri Wahyuni', 'Purwanto', 'Ina Kurniasih',
  'Hartanto', 'Nurlaela', 'Bagus Setiawan', 'Fitri Handayani', 'Rudi Hartono',
  'Sari Dewi', 'Suparman', 'Emi Rosita', 'Anton Hidayat', 'Tuti Lestari',
  'Hendro Prasetyo', 'Yulia Permata', 'Zulkifli', 'Astuti', 'Fahrurozi',
  'Kurnia Dewi', 'Sugiyono', 'Halimah', 'Arif Budiman', 'Maryati',
];

const rts = ['001', '002', '003', '004', '005'];
const rws = ['001', '002'];

export const seedWarga: Warga[] = namaWarga.map((nama, i) => ({
  id: uuidv4(),
  nama,
  alamat: `Jl. Melati No. ${i + 1}, Blok ${String.fromCharCode(65 + (i % 5))}`,
  rt: rts[i % 5],
  rw: rws[i % 2],
  noTelepon: `08${String(Math.floor(10000000000 + Math.random() * 89999999999)).slice(0, 11)}`,
  jumlahKupon: i < 35 ? 1 : 2,
  noKtp: `320101${String(Math.floor(100000000000 + Math.random() * 899999999999)).slice(0, 12)}`,
  createdAt: now(),
  updatedAt: now(),
}));

// ============================================================
// Seed: Kupon (65 kupon total)
// ============================================================
let kuponCounter = 1;
export const seedKupon: Kupon[] = seedWarga.flatMap((warga) => {
  const kuponWarga: Kupon[] = [];
  for (let k = 0; k < warga.jumlahKupon; k++) {
    const nomorKupon = `QRB-${String(kuponCounter).padStart(3, '0')}`;
    kuponCounter++;
    const isAmbil = kuponCounter <= 52;

    kuponWarga.push({
      id: uuidv4(),
      nomorKupon,
      wargaId: warga.id,
      namaPenerima: warga.nama,
      status: isAmbil ? 'Sudah Diambil' : 'Belum Diambil',
      beratHak: 2.5,
      tanggalTerbit: today(-2),
      tanggalDiambil: isAmbil ? today(-1) : undefined,
      catatan: '',
      createdAt: now(),
      updatedAt: now(),
    });
  }
  return kuponWarga;
});

// ============================================================
// Seed: Distribusi (42 record)
// ============================================================
const sudahDistribusiKupon = seedKupon.filter(k => k.status === 'Sudah Diambil').slice(0, 42);
const petugasDistribusi = seedPanitia.find(p => p.jabatan === 'Koordinator Distribusi')!;
const sapiSelesai = seedSapi.filter(s => s.status === 'Selesai' || s.status === 'Dicacah');

export const seedDistribusi: Distribusi[] = sudahDistribusiKupon.map((kupon, i) => {
  const warga = seedWarga.find(w => w.id === kupon.wargaId)!;
  const sapi = sapiSelesai[i % sapiSelesai.length];
  return {
    id: uuidv4(),
    wargaId: warga.id,
    namaWarga: warga.nama,
    kuponId: kupon.id,
    nomorKupon: kupon.nomorKupon,
    beratDaging: 2.5,
    sapiId: sapi?.id,
    namaSapi: sapi?.nama,
    tanggal: i < 20 ? today(-1) : today(),
    status: 'Selesai',
    petugasId: petugasDistribusi?.id,
    namaPetugas: petugasDistribusi?.nama,
    catatan: '',
    createdAt: now(),
    updatedAt: now(),
  };
});

// ============================================================
// Seed: Keuangan RAB
// ============================================================
export const seedKeuangan: TransaksiKeuangan[] = [
  // ── PEMASUKAN ─────────────────────────────────────────────
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Iuran Mudhohi', deskripsi: 'Iuran operasional Mudhohi – Sapi 01 (Pak Hasan)', jumlah: 500000, tanggal: today(-10), noBukti: 'KWT-001', pic: 'Ibu Fatimah Zahra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Iuran Mudhohi', deskripsi: 'Iuran operasional Mudhohi – Sapi 02 (Bu Sari)', jumlah: 500000, tanggal: today(-10), noBukti: 'KWT-002', pic: 'Ibu Fatimah Zahra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Iuran Mudhohi', deskripsi: 'Iuran operasional Mudhohi – Sapi 03 (Pak Rudi)', jumlah: 500000, tanggal: today(-9), noBukti: 'KWT-003', pic: 'Ibu Fatimah Zahra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Iuran Mudhohi', deskripsi: 'Iuran operasional Mudhohi – Sapi 04 (Pak Dedi)', jumlah: 500000, tanggal: today(-9), noBukti: 'KWT-004', pic: 'Ibu Fatimah Zahra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Iuran Mudhohi', deskripsi: 'Iuran operasional Mudhohi – Sapi 05 (Pak Ahmad)', jumlah: 500000, tanggal: today(-8), noBukti: 'KWT-005', pic: 'Ibu Fatimah Zahra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Iuran Mudhohi', deskripsi: 'Iuran operasional Mudhohi – Sapi 06 (Bu Rina)', jumlah: 500000, tanggal: today(-8), noBukti: 'KWT-006', pic: 'Ibu Fatimah Zahra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Iuran Mudhohi', deskripsi: 'Iuran operasional Mudhohi – Sapi 07 (Pak Yusuf)', jumlah: 500000, tanggal: today(-7), noBukti: 'KWT-007', pic: 'Ibu Fatimah Zahra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Iuran Mudhohi', deskripsi: 'Iuran operasional Mudhohi – Sapi 08 (Pak Budi)', jumlah: 500000, tanggal: today(-7), noBukti: 'KWT-008', pic: 'Ibu Fatimah Zahra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Iuran Mudhohi', deskripsi: 'Iuran operasional Mudhohi – Sapi 09 (Bu Dewi)', jumlah: 500000, tanggal: today(-6), noBukti: 'KWT-009', pic: 'Ibu Fatimah Zahra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Iuran Mudhohi', deskripsi: 'Iuran operasional Mudhohi – Sapi 10 (Pak Irwan)', jumlah: 500000, tanggal: today(-6), noBukti: 'KWT-010', pic: 'Ibu Fatimah Zahra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Donasi Warga', deskripsi: 'Donasi sukarela warga RT 001/RW 001', jumlah: 750000, tanggal: today(-5), noBukti: 'KWT-011', pic: 'H. Abdul Karim', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Donasi Warga', deskripsi: 'Donasi sukarela warga RT 002/RW 001', jumlah: 450000, tanggal: today(-4), noBukti: 'KWT-012', pic: 'H. Abdul Karim', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pemasukan', kategori: 'Subsidi Masjid', deskripsi: 'Subsidi kas Pondok Riyadhussholihiin untuk operasional', jumlah: 1500000, tanggal: today(-14), noBukti: 'KWT-013', pic: 'H. Abdul Karim', createdAt: now(), updatedAt: now() },

  // ── PENGELUARAN ───────────────────────────────────────────
  { id: uuidv4(), jenis: 'Pengeluaran', kategori: 'Pakan & Akomodasi Hewan', deskripsi: 'Pakan jerami & konsentrat sapi (3 hari)', jumlah: 1500000, tanggal: today(-5), noBukti: 'BKK-001', pic: 'Pak Surya Darma', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pengeluaran', kategori: 'Pakan & Akomodasi Hewan', deskripsi: 'Sewa kandang & kebersihan area', jumlah: 400000, tanggal: today(-5), noBukti: 'BKK-002', pic: 'Pak Surya Darma', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pengeluaran', kategori: 'Perlengkapan Penyembelihan', deskripsi: 'Pisau jagal, asahan, tali pengikat', jumlah: 350000, tanggal: today(-3), noBukti: 'BKK-003', pic: 'Pak Surya Darma', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pengeluaran', kategori: 'Perlengkapan Penyembelihan', deskripsi: 'Terpal, ember, gayung & peralatan kebersihan', jumlah: 280000, tanggal: today(-3), noBukti: 'BKK-004', pic: 'Pak Doni Saputra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pengeluaran', kategori: 'Upah Jagal', deskripsi: 'Upah 3 orang jagal profesional (10 ekor sapi)', jumlah: 1500000, tanggal: today(-1), noBukti: 'BKK-005', pic: 'H. Abdul Karim', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pengeluaran', kategori: 'Konsumsi Panitia', deskripsi: 'Nasi kotak panitia & relawan (2 sesi × 30 box)', jumlah: 750000, tanggal: today(-1), noBukti: 'BKK-006', pic: 'Ustadz Rizky Fadillah', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pengeluaran', kategori: 'Konsumsi Panitia', deskripsi: 'Minuman & snack rapat koordinasi', jumlah: 185000, tanggal: today(-7), noBukti: 'BKK-007', pic: 'Ustadz Rizky Fadillah', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pengeluaran', kategori: 'Transportasi', deskripsi: 'Biaya angkut hewan dari peternak ke lokasi', jumlah: 400000, tanggal: today(-5), noBukti: 'BKK-008', pic: 'Pak Hendra Wijaya', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pengeluaran', kategori: 'Kemasan & Plastik', deskripsi: 'Plastik klip, kantong putih & styrofoam', jumlah: 620000, tanggal: today(-3), noBukti: 'BKK-009', pic: 'Pak Doni Saputra', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pengeluaran', kategori: 'Dekorasi & Dokumentasi', deskripsi: 'Spanduk, backdrop, foto & video dokumentasi', jumlah: 250000, tanggal: today(-7), noBukti: 'BKK-010', pic: 'Ustadz Rizky Fadillah', createdAt: now(), updatedAt: now() },
  { id: uuidv4(), jenis: 'Pengeluaran', kategori: 'Administrasi & ATK', deskripsi: 'Cetak kupon, form pendataan & ATK', jumlah: 165000, tanggal: today(-10), noBukti: 'BKK-011', pic: 'Ustadz Rizky Fadillah', createdAt: now(), updatedAt: now() },
];
