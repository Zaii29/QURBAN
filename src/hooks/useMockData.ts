import { useState, useEffect, useCallback } from 'react';
import {
  sapiService,
  wargaService,
  panitiaService,
  kuponService,
  distribusiService,
  sesiService,
  generateSesiOtomatis,
  importWargaFromRows,
  getDashboardData,
} from '../services/mockDb';
import type { Sapi, Warga, Panitia, Kupon, Distribusi, Sesi, SesiWarga, ImportWargaRow } from '../types';

// ============================================================
// useSapi Hook
// ============================================================
export function useSapi() {
  const [data, setData] = useState<Sapi[]>([]);

  const reload = useCallback(() => setData(sapiService.getAll()), []);

  useEffect(() => { reload(); }, [reload]);

  return {
    sapi: data,
    reload,
    updateStatus: (id: string, status: Sapi['status']) => {
      sapiService.update(id, { status });
      reload();
    },
    addSapi: (item: Omit<Sapi, 'id' | 'createdAt' | 'updatedAt'>) => {
      const created = sapiService.create(item);
      reload();
      return created;
    },
    deleteSapi: (id: string) => {
      sapiService.delete(id);
      reload();
    },
    updateSapi: (id: string, patch: Partial<Omit<Sapi, 'id' | 'createdAt'>>) => {
      sapiService.update(id, patch);
      reload();
    },
  };
}

// ============================================================
// useWarga Hook (enhanced: delete + import)
// ============================================================
export function useWarga() {
  const [data, setData] = useState<Warga[]>([]);

  const reload = useCallback(() => setData(wargaService.getAll()), []);

  useEffect(() => { reload(); }, [reload]);

  return {
    warga: data,
    reload,
    deleteWarga: (id: string) => {
      wargaService.delete(id);
      reload();
    },
    importExcel: (rows: ImportWargaRow[]) => {
      const result = importWargaFromRows(rows);
      reload();
      return result;
    },
  };
}

// ============================================================
// usePanitia Hook
// ============================================================
export function usePanitia() {
  const [data, setData] = useState<Panitia[]>([]);

  const reload = useCallback(() => setData(panitiaService.getAll()), []);

  useEffect(() => { reload(); }, [reload]);

  return { panitia: data, reload };
}

// ============================================================
// useKupon Hook
// ============================================================
export function useKupon() {
  const [data, setData] = useState<Kupon[]>([]);

  const reload = useCallback(() => setData(kuponService.getAll()), []);

  useEffect(() => { reload(); }, [reload]);

  return {
    kupon: data,
    reload,
    ambilKupon: (id: string) => {
      kuponService.update(id, {
        status: 'Sudah Diambil',
        tanggalDiambil: new Date().toISOString(),
      });
      reload();
    },
    batalKupon: (id: string) => {
      kuponService.update(id, { status: 'Dibatalkan' });
      reload();
    },
  };
}

// ============================================================
// useDistribusi Hook
// ============================================================
export function useDistribusi() {
  const [data, setData] = useState<Distribusi[]>([]);

  const reload = useCallback(() => setData(distribusiService.getAll()), []);

  useEffect(() => { reload(); }, [reload]);

  return { distribusi: data, reload };
}

// ============================================================
// useDashboard Hook â€” aggregated data untuk Dashboard
// ============================================================
export function useDashboard() {
  const [dashboardData, setDashboardData] = useState(() => getDashboardData());
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setDashboardData(getDashboardData());
      setIsLoading(false);
    }, 300);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { ...dashboardData, isLoading, reload };
}

// ============================================================
// useSesi Hook â€” antrian sesi distribusi
// ============================================================
export function useSesi() {
  const [data, setData] = useState<Sesi[]>([]);

  const reload = useCallback(() => setData(sesiService.getAll()), []);

  useEffect(() => { reload(); }, [reload]);

  return {
    sesiList: data,
    reload,
    hasSesi: data.length > 0,

    generateSesi: (kuotaMaks?: number, tanggal?: string) => {
      const result = generateSesiOtomatis(kuotaMaks, tanggal);
      setData(result);
      return result;
    },

    resetSesi: () => {
      sesiService.deleteAll();
      setData([]);
    },

    updateStatus: (sesiId: string, status: Sesi['status']) => {
      sesiService.update(sesiId, { status });
      reload();
    },

    updateWargaStatus: (sesiId: string, wargaId: string, statusAmbil: SesiWarga['statusAmbil']) => {
      sesiService.updateWargaStatus(sesiId, wargaId, statusAmbil);
      reload();
    },
  };
}

// ============================================================
// useKeuangan Hook
// ============================================================
import { keuanganService, getKeuanganSummary } from '../services/mockDb';
import type { TransaksiKeuangan, KeuanganSummary } from '../types';

export function useKeuangan() {
  const [data, setData] = useState<TransaksiKeuangan[]>([]);
  const [summary, setSummary] = useState<KeuanganSummary>(() => getKeuanganSummary());

  const reload = useCallback(() => {
    setData(keuanganService.getAll());
    setSummary(getKeuanganSummary());
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return {
    transaksi: data,
    summary,
    reload,
    addTransaksi: (item: Omit<TransaksiKeuangan, 'id' | 'createdAt' | 'updatedAt'>) => {
      keuanganService.create(item);
      reload();
    },
    deleteTransaksi: (id: string) => {
      keuanganService.delete(id);
      reload();
    },
    updateTransaksi: (id: string, patch: Partial<Omit<TransaksiKeuangan, 'id' | 'createdAt'>>) => {
      keuanganService.update(id, patch);
      reload();
    },
  };
}

