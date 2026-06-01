import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X, MessageCircle } from 'lucide-react';

// ============================================================
// Types
// ============================================================
export type ToastType = 'wa-blast' | 'success' | 'error' | 'info';

export interface WaBlastPayload {
  recipientName: string;
  recipientPhone?: string;
  message: string;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message?: string;
  waBlast?: WaBlastPayload;
  duration?: number; // ms
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (item: Omit<ToastItem, 'id'>) => string;
  addWaBlast: (payload: WaBlastPayload, delay?: number) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ============================================================
// Context
// ============================================================
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ============================================================
// Individual Toast renderers
// ============================================================

/** WhatsApp Blast Toast */
function WaToast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const { waBlast } = item;
  if (!waBlast) return null;

  return (
    <motion.div
      layout
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      exit={{ x: 380, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
    >
      {/* WA Header */}
      <div className="bg-[#25D366] px-4 py-2.5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <MessageCircle size={15} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white text-xs font-bold leading-tight">WhatsApp Blast</p>
          <p className="text-white/70 text-[10px]">Panitia Qurban Masjid An-Nuur</p>
        </div>
        <button
          onClick={onDismiss}
          className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
        >
          <X size={10} className="text-white" />
        </button>
      </div>

      {/* Chat bubble */}
      <div className="p-3 bg-[#ECE5DD]">
        <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm max-w-[90%]">
          <p className="text-[11px] font-semibold text-[#25D366] mb-1">
            Panitia Qurban
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{waBlast.message}</p>
          <div className="flex items-center justify-end gap-1 mt-1.5">
            <p className="text-[10px] text-slate-400">
              {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <CheckCircle2 size={10} className="text-[#53BDEB]" />
            <CheckCircle2 size={10} className="text-[#53BDEB] -ml-1.5" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-[9px] font-bold">
          {waBlast.recipientName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-700 truncate">Ke: {waBlast.recipientName}</p>
          {waBlast.recipientPhone && (
            <p className="text-[10px] text-slate-400">{waBlast.recipientPhone}</p>
          )}
        </div>
        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">
          Terkirim ✓
        </span>
      </div>

      {/* Auto-dismiss progress bar */}
      <motion.div
        className="h-0.5 bg-[#25D366]"
        initial={{ scaleX: 1, originX: 0 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (item.duration ?? 5000) / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

/** Generic success/error/info Toast */
function GenericToast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const colorMap = {
    success: 'bg-emerald-500',
    error:   'bg-red-500',
    info:    'bg-blue-500',
    'wa-blast': 'bg-[#25D366]',
  };
  return (
    <motion.div
      layout
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 380, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="w-72 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
    >
      <div className={`h-1 ${colorMap[item.type]}`} />
      <div className="flex gap-3 p-4">
        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {item.title && <p className="text-sm font-semibold text-slate-800">{item.title}</p>}
          {item.message && <p className="text-xs text-slate-500 mt-0.5">{item.message}</p>}
        </div>
        <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================
// Toast Container
// ============================================================
function ToastContainer({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(item => (
          <div key={item.id} className="pointer-events-auto">
            {item.type === 'wa-blast' ? (
              <WaToast item={item} onDismiss={() => dismiss(item.id)} />
            ) : (
              <GenericToast item={item} onDismiss={() => dismiss(item.id)} />
            )}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Provider
// ============================================================
let _counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const dismissAll = useCallback(() => {
    timers.current.forEach(t => clearTimeout(t));
    timers.current.clear();
    setToasts([]);
  }, []);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>): string => {
    const id = `toast-${++_counter}-${Date.now()}`;
    const duration = item.duration ?? 5000;
    setToasts(prev => {
      // Max 5 toasts visible at once
      const next = [...prev, { ...item, id }];
      return next.slice(-5);
    });
    const timer = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, timer);
    return id;
  }, [dismiss]);

  /** Fire multiple WA blasts with staggered delays */
  const addWaBlast = useCallback((payload: WaBlastPayload, delay = 0) => {
    setTimeout(() => {
      addToast({ type: 'wa-blast', waBlast: payload, duration: 6000 });
    }, delay);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, addWaBlast, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}
