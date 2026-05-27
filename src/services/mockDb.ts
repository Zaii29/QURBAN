// ============================================================
// Mock Database Service â€” localStorage-backed CRUD
// Namespace: qurban_<entity>
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type { Sapi, Warga, Panitia, Kupon, Distribusi, Sesi, SesiWarga, ImportWargaRow, TransaksiKeuangan, KeuanganSummary } from '../types';
import {
  seedSapi,
  seedWarga,
  seedPanitia,
  seedKupon,
  seedDistribusi,
  seedKeuangan,
} from '../data/seedData';

// ============================================================
// Storage Keys
// ============================================================
const KEYS = {
  SAPI:        'qurban_sapi',
  WARGA:       'qurban_warga',
  PANITIA:     'qurban_panitia',
  KUPON:       'qurban_kupon',
  DISTRIBUSI:  'qurban_distribusi',
  SESI:        'qurban_sesi',
  KEUANGAN:    'qurban_keuangan',
  INITIALIZED: 'qurban_initialized',
} as const;

// ============================================================
// Generic helpers
// ============================================================
function getStore<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ============================================================
// Initialize — AUTO-FILL DIMATIKAN (input manual)
// ============================================================
export function initializeDb(): void {
  // Tidak ada data dummy yang di-inject secara otomatis.
  // Semua data harus diinput manual atau diimpor oleh pengguna.
  // Fungsi ini sengaja dikosongkan.
}

export function resetDb(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}


// ============================================================
// Sapi CRUD
// ============================================================
export const sapiService = {
  getAll(): Sapi[] {
    return getStore<Sapi>(KEYS.SAPI).sort((a, b) => a.nomorUrut - b.nomorUrut);
  },

  getById(id: string): Sapi | undefined {
    return getStore<Sapi>(KEYS.SAPI).find(s => s.id === id);
  },

  create(data: Omit<Sapi, 'id' | 'createdAt' | 'updatedAt'>): Sapi {
    const newItem: Sapi = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = getStore<Sapi>(KEYS.SAPI);
    setStore(KEYS.SAPI, [...all, newItem]);
    return newItem;
  },

  update(id: string, patch: Partial<Omit<Sapi, 'id' | 'createdAt'>>): Sapi | null {
    const all = getStore<Sapi>(KEYS.SAPI);
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const updated: Sapi = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    setStore(KEYS.SAPI, all);
    return updated;
  },

  delete(id: string): boolean {
    const all = getStore<Sapi>(KEYS.SAPI);
    const filtered = all.filter(s => s.id !== id);
    if (filtered.length === all.length) return false;
    setStore(KEYS.SAPI, filtered);
    return true;
  },
};

// ============================================================
// Warga CRUD
// ============================================================
export const wargaService = {
  getAll(): Warga[] {
    return getStore<Warga>(KEYS.WARGA).sort((a, b) => a.nama.localeCompare(b.nama));
  },

  getById(id: string): Warga | undefined {
    return getStore<Warga>(KEYS.WARGA).find(w => w.id === id);
  },

  create(data: Omit<Warga, 'id' | 'createdAt' | 'updatedAt'>): Warga {
    const newItem: Warga = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = getStore<Warga>(KEYS.WARGA);
    setStore(KEYS.WARGA, [...all, newItem]);
    return newItem;
  },

  update(id: string, patch: Partial<Omit<Warga, 'id' | 'createdAt'>>): Warga | null {
    const all = getStore<Warga>(KEYS.WARGA);
    const idx = all.findIndex(w => w.id === id);
    if (idx === -1) return null;
    const updated: Warga = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    setStore(KEYS.WARGA, all);
    return updated;
  },

  delete(id: string): boolean {
    const all = getStore<Warga>(KEYS.WARGA);
    const filtered = all.filter(w => w.id !== id);
    if (filtered.length === all.length) return false;
    setStore(KEYS.WARGA, filtered);
    return true;
  },
};

// ============================================================
// Panitia CRUD
// ============================================================
export const panitiaService = {
  getAll(): Panitia[] {
    return getStore<Panitia>(KEYS.PANITIA);
  },

  getById(id: string): Panitia | undefined {
    return getStore<Panitia>(KEYS.PANITIA).find(p => p.id === id);
  },

  update(id: string, patch: Partial<Omit<Panitia, 'id' | 'createdAt'>>): Panitia | null {
    const all = getStore<Panitia>(KEYS.PANITIA);
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated: Panitia = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    setStore(KEYS.PANITIA, all);
    return updated;
  },
};

// ============================================================
// Kupon CRUD
// ============================================================
export const kuponService = {
  getAll(): Kupon[] {
    return getStore<Kupon>(KEYS.KUPON).sort((a, b) =>
      a.nomorKupon.localeCompare(b.nomorKupon)
    );
  },

  getById(id: string): Kupon | undefined {
    return getStore<Kupon>(KEYS.KUPON).find(k => k.id === id);
  },

  getByWargaId(wargaId: string): Kupon[] {
    return getStore<Kupon>(KEYS.KUPON).filter(k => k.wargaId === wargaId);
  },

  update(id: string, patch: Partial<Omit<Kupon, 'id' | 'createdAt'>>): Kupon | null {
    const all = getStore<Kupon>(KEYS.KUPON);
    const idx = all.findIndex(k => k.id === id);
    if (idx === -1) return null;
    const updated: Kupon = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    setStore(KEYS.KUPON, all);
    return updated;
  },
};

// ============================================================
// Distribusi CRUD
// ============================================================
export const distribusiService = {
  getAll(): Distribusi[] {
    return getStore<Distribusi>(KEYS.DISTRIBUSI).sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );
  },

  getById(id: string): Distribusi | undefined {
    return getStore<Distribusi>(KEYS.DISTRIBUSI).find(d => d.id === id);
  },

  getByWargaId(wargaId: string): Distribusi[] {
    return getStore<Distribusi>(KEYS.DISTRIBUSI).filter(d => d.wargaId === wargaId);
  },

  update(id: string, patch: Partial<Omit<Distribusi, 'id' | 'createdAt'>>): Distribusi | null {
    const all = getStore<Distribusi>(KEYS.DISTRIBUSI);
    const idx = all.findIndex(d => d.id === id);
    if (idx === -1) return null;
    const updated: Distribusi = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    setStore(KEYS.DISTRIBUSI, all);
    return updated;
  },
};

// ============================================================
// Dashboard Aggregation
// ============================================================
export function getDashboardData() {
  const sapi = sapiService.getAll();
  const warga = wargaService.getAll();
  const kupon = kuponService.getAll();
  const distribusi = distribusiService.getAll();

  // Sapi summary
  const sapiSummary = {
    total: sapi.length,
    menunggu:   sapi.filter(s => s.status === 'Menunggu').length,
    disembelih: sapi.filter(s => s.status === 'Disembelih').length,
    dikuliti:   sapi.filter(s => s.status === 'Dikuliti').length,
    dicacah:    sapi.filter(s => s.status === 'Dicacah').length,
    selesai:    sapi.filter(s => s.status === 'Selesai').length,
    totalBeratKg: sapi.reduce((sum, s) => sum + s.berat, 0),
  };

  // Kupon summary
  const kuponSummary = {
    totalTerbit:    kupon.length,
    sudahDiambil:   kupon.filter(k => k.status === 'Sudah Diambil').length,
    belumDiambil:   kupon.filter(k => k.status === 'Belum Diambil').length,
    dibatalkan:     kupon.filter(k => k.status === 'Dibatalkan').length,
  };

  // Distribusi summary
  const targetBeratTotal = kupon.reduce((sum, k) => sum + k.beratHak, 0);
  const totalBeratTerdistribusi = distribusi
    .filter(d => d.status === 'Selesai')
    .reduce((sum, d) => sum + d.beratDaging, 0);
  const sudahTerdistribusi = distribusi.filter(d => d.status === 'Selesai').length;

  const distribusiSummary = {
    totalWarga: warga.length,
    sudahTerdistribusi,
    belumTerdistribusi: kuponSummary.totalTerbit - sudahTerdistribusi,
    totalBeratTerdistribusi,
    targetBeratTotal,
    persenSelesai: targetBeratTotal > 0
      ? Math.round((totalBeratTerdistribusi / targetBeratTotal) * 100)
      : 0,
  };

  // Distribusi per hari (last 3 days)
  const distribusiPerHari = [-2, -1, 0].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const tanggalStr = d.toISOString().split('T')[0];
    const records = distribusi.filter(dist =>
      dist.tanggal.startsWith(tanggalStr) && dist.status === 'Selesai'
    );
    return {
      tanggal: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      jumlahWarga: records.length,
      beratKg: records.reduce((sum, r) => sum + r.beratDaging, 0),
    };
  });

  // Warga per RT/RW
  const rtMap: Record<string, number> = {};
  warga.forEach(w => {
    const key = `RT ${w.rt}/RW ${w.rw}`;
    rtMap[key] = (rtMap[key] || 0) + 1;
  });
  const wargaPerRT = Object.entries(rtMap).map(([key, jumlah]) => {
    const [rt, rw] = key.split('/');
    return { rt: rt.replace('RT ', ''), rw: rw.replace('RW ', ''), jumlah };
  });

  return {
    sapiSummary,
    kuponSummary,
    distribusiSummary,
    distribusiPerHari,
    wargaPerRT,
    panitia: panitiaService.getAll(),
    sapiList: sapi,
  };
}

// ============================================================
// Sesi CRUD
// ============================================================
export const sesiService = {
  getAll(): Sesi[] {
    return getStore<Sesi>(KEYS.SESI).sort((a, b) => a.nomorSesi - b.nomorSesi);
  },

  getById(id: string): Sesi | undefined {
    return getStore<Sesi>(KEYS.SESI).find(s => s.id === id);
  },

  save(sesiList: Sesi[]): void {
    setStore(KEYS.SESI, sesiList);
  },

  update(id: string, patch: Partial<Omit<Sesi, 'id' | 'createdAt'>>): Sesi | null {
    const all = getStore<Sesi>(KEYS.SESI);
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const updated: Sesi = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    setStore(KEYS.SESI, all);
    return updated;
  },

  /** Update status satu warga dalam sesi */
  updateWargaStatus(
    sesiId: string,
    wargaId: string,
    statusAmbil: SesiWarga['statusAmbil']
  ): Sesi | null {
    const all = getStore<Sesi>(KEYS.SESI);
    const sesiIdx = all.findIndex(s => s.id === sesiId);
    if (sesiIdx === -1) return null;
    const sesi = { ...all[sesiIdx] };
    sesi.daftarWarga = sesi.daftarWarga.map(w =>
      w.wargaId === wargaId
        ? { ...w, statusAmbil }
        : w
    );
    sesi.updatedAt = new Date().toISOString();
    all[sesiIdx] = sesi;
    setStore(KEYS.SESI, all);
    return sesi;
  },

  deleteAll(): void {
    setStore(KEYS.SESI, []);
  },
};

// ============================================================
// Auto-generate Sesi dari daftar warga + kupon
// Aturan: maks 50 orang per sesi, dikelompokkan per RT/RW
// ============================================================
export function generateSesiOtomatis(
  kuotaMaks = 50,
  tanggal?: string
): Sesi[] {
  const wargaList  = wargaService.getAll();
  const kuponList  = kuponService.getAll();
  const tgl        = tanggal ?? new Date().toISOString();
  const now        = new Date().toISOString();

  // Buat map kupon aktif per warga
  const kuponByWarga: Record<string, string> = {};
  kuponList
    .filter(k => k.status !== 'Dibatalkan')
    .forEach(k => { if (!kuponByWarga[k.wargaId]) kuponByWarga[k.wargaId] = k.nomorKupon; });

  // Urutkan warga: RT â†’ RW â†’ Nama
  const sorted = [...wargaList].sort((a, b) => {
    const rtCmp = a.rt.localeCompare(b.rt);
    if (rtCmp !== 0) return rtCmp;
    const rwCmp = a.rw.localeCompare(b.rw);
    if (rwCmp !== 0) return rwCmp;
    return a.nama.localeCompare(b.nama);
  });

  const sesiList: Sesi[] = [];
  let chunk: typeof sorted = [];
  let sesiNo = 1;

  const JAM_MULAI = 7; // 07:00
  const DURASI_JAM = 1;

  const flush = () => {
    if (chunk.length === 0) return;
    const jamMulai  = JAM_MULAI + (sesiNo - 1) * DURASI_JAM;
    const jamSelesai = jamMulai + DURASI_JAM;
    const pad = (n: number) => String(n).padStart(2, '0');

    // Tentukan label dari RT/RW mayoritas di chunk ini
    const rtMost = chunk[0];
    const label = `Sesi ${sesiNo} â€” RT ${rtMost.rt}/RW ${rtMost.rw}`;

    const daftarWarga: SesiWarga[] = chunk.map((w, i) => ({
      wargaId:      w.id,
      namaWarga:    w.nama,
      rt:           w.rt,
      rw:           w.rw,
      nomorKupon:   kuponByWarga[w.id],
      statusAmbil:  'Menunggu',
      nomorAntrean: i + 1,
    }));

    sesiList.push({
      id:           uuidv4(),
      nomorSesi:    sesiNo,
      label,
      kuotaMaks,
      waktuMulai:   `${pad(jamMulai)}:00`,
      waktuSelesai: `${pad(jamSelesai > 23 ? 23 : jamSelesai)}:59`,
      daftarWarga,
      status:       chunk.length >= kuotaMaks ? 'Penuh' : 'Menunggu',
      tanggal:      tgl,
      createdAt:    now,
      updatedAt:    now,
    });
    chunk = [];
    sesiNo++;
  };

  for (const w of sorted) {
    chunk.push(w);
    if (chunk.length >= kuotaMaks) flush();
  }
  flush(); // sisa terakhir

  sesiService.save(sesiList);
  return sesiList;
}

// ============================================================
// Import Warga dari baris Excel yang sudah diparsing
// ============================================================
export function importWargaFromRows(rows: ImportWargaRow[]): {
  berhasil: number;
  gagal: number;
  pesanGagal: string[];
} {
  let berhasil = 0;
  const pesanGagal: string[] = [];
  const now = new Date().toISOString();

  rows.forEach((row, i) => {
    const baris = i + 2; // baris Excel (header = 1)
    const nama = String(row['Nama'] ?? '').trim();
    const noHp = String(row['No HP'] ?? '').trim();
    const rtRaw = String(row['RT'] ?? '').trim().padStart(3, '0');
    const rwRaw = String(row['RW'] ?? '').trim().padStart(3, '0');
    const alamat = String(row['Alamat'] ?? `RT ${rtRaw}/RW ${rwRaw}`).trim();
    const jumlahKupon = parseInt(String(row['Jumlah Kupon'] ?? '1')) || 1;

    if (!nama) {
      pesanGagal.push(`Baris ${baris}: Kolom "Nama" kosong â€” dilewati.`);
      return;
    }
    if (!rtRaw || rtRaw === '000') {
      pesanGagal.push(`Baris ${baris} (${nama}): Kolom "RT" tidak valid â€” dilewati.`);
      return;
    }

    const newWarga: Warga = {
      id:           uuidv4(),
      nama,
      noKtp:        undefined,
      alamat,
      rt:           rtRaw,
      rw:           rwRaw || '001',
      noTelepon:    noHp || undefined,
      jumlahKupon:  Math.min(Math.max(jumlahKupon, 1), 5),
      createdAt:    now,
      updatedAt:    now,
    };

    wargaService.create(newWarga as Omit<Warga, 'id' | 'createdAt' | 'updatedAt'>);
    berhasil++;
  });

  return { berhasil, gagal: pesanGagal.length, pesanGagal };
}

// ============================================================
// Keuangan CRUD + Summary
// ============================================================
export const keuanganService = {
  getAll(): TransaksiKeuangan[] {
    return getStore<TransaksiKeuangan>(KEYS.KEUANGAN)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  },

  create(item: Omit<TransaksiKeuangan, 'id' | 'createdAt' | 'updatedAt'>): TransaksiKeuangan {
    const now = new Date().toISOString();
    const newItem: TransaksiKeuangan = { ...item, id: uuidv4(), createdAt: now, updatedAt: now };
    const all = getStore<TransaksiKeuangan>(KEYS.KEUANGAN);
    setStore(KEYS.KEUANGAN, [...all, newItem]);
    return newItem;
  },

  update(id: string, patch: Partial<Omit<TransaksiKeuangan, 'id' | 'createdAt'>>): TransaksiKeuangan | null {
    const all = getStore<TransaksiKeuangan>(KEYS.KEUANGAN);
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return null;
    const updated = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    setStore(KEYS.KEUANGAN, all);
    return updated;
  },

  delete(id: string): void {
    const all = getStore<TransaksiKeuangan>(KEYS.KEUANGAN).filter(t => t.id !== id);
    setStore(KEYS.KEUANGAN, all);
  },
};

export function getKeuanganSummary(): KeuanganSummary {
  const all = keuanganService.getAll();
  const pemasukan  = all.filter(t => t.jenis === 'Pemasukan');
  const pengeluaran = all.filter(t => t.jenis === 'Pengeluaran');
  const totalPemasukan   = pemasukan.reduce((s, t) => s + t.jumlah, 0);
  const totalPengeluaran = pengeluaran.reduce((s, t) => s + t.jumlah, 0);
  return {
    totalPemasukan,
    totalPengeluaran,
    saldo: totalPemasukan - totalPengeluaran,
    jumlahPemasukan:  pemasukan.length,
    jumlahPengeluaran: pengeluaran.length,
  };
}


