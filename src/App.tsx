import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import WargaPage from './pages/Warga';
import DistribusiPage from './pages/Distribusi';
import SapiPage from './pages/Sapi';
import KuponPage from './pages/Kupon';
import KeuanganPage from './pages/Keuangan';
import { initializeDb } from './services/mockDb';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  useEffect(() => {
    initializeDb();
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />

            {/* ✅ Halaman Data Sapi — Status + WA Blast */}
            <Route path="/sapi" element={<SapiPage />} />

            {/* ✅ Halaman Data Warga — Import Excel */}
            <Route path="/warga" element={<WargaPage />} />

            {/* ✅ Halaman Kupon Digital — QR Code */}
            <Route path="/kupon" element={<KuponPage />} />

            {/* ✅ Halaman Distribusi Daging — Sesi Antrian */}
            <Route path="/distribusi" element={<DistribusiPage />} />

            {/* ✅ Halaman Laporan Keuangan RAB */}
            <Route path="/panitia" element={<KeuanganPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
