import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
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

  const fetchSapi = useCallback(async () => {
    const { data: animals, error } = await supabase.from('animals').select('*').order('id', { ascending: true });
    if (error) {
      console.error('Error fetching animals:', error);
      return;
    }
    
    // Map Supabase 'animals' to local 'Sapi' type
    const mapped: Sapi[] = (animals || []).map(a => ({
      id: String(a.id),
      nama: a.customer_name || 'Tanpa Nama',
      nomorUrut: a.id,
      jenisHewan: a.type as any || 'Sapi',
      berat: a.weight || 0,
      asalHewan: 'Supabase',
      status: a.status as any || 'Menunggu',
      namaKelompok: a.group_name || '',
      noWaMudhohi: a.whatsapp || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    setData(mapped);
  }, []);

  useEffect(() => { 
    fetchSapi(); 

    // Subscribe to realtime changes on 'animals' table
    const channel = supabase.channel('animals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animals' }, () => {
        fetchSapi();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSapi]);

  return {
    sapi: data,
    reload: fetchSapi,
    updateStatus: async (id: string, status: Sapi['status']) => {
      await supabase.from('animals').update({ status }).eq('id', Number(id));
    },
    addSapi: async (item: Omit<Sapi, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase.from('animals').insert([{
        type: item.jenisHewan,
        weight: item.berat,
        status: item.status,
        customer_name: item.nama,
        group_name: item.namaKelompok || null,
        whatsapp: item.noWaMudhohi || null
      }]).select().single();
      
      if (error) {
        console.error('Error adding sapi:', error);
        return null;
      }
      return data;
    },
    deleteSapi: async (id: string) => {
      await supabase.from('animals').delete().eq('id', Number(id));
    },
    updateSapi: async (id: string, patch: Partial<Omit<Sapi, 'id' | 'createdAt'>>) => {
      const updateData: any = {};
      if (patch.jenisHewan !== undefined) updateData.type = patch.jenisHewan;
      if (patch.berat !== undefined) updateData.weight = patch.berat;
      if (patch.status !== undefined) updateData.status = patch.status;
      if (patch.nama !== undefined) updateData.customer_name = patch.nama;
      if (patch.namaKelompok !== undefined) updateData.group_name = patch.namaKelompok;
      if (patch.noWaMudhohi !== undefined) updateData.whatsapp = patch.noWaMudhohi;

      await supabase.from('animals').update(updateData).eq('id', Number(id));
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

