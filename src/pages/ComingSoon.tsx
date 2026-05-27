import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
        <Construction size={28} className="text-emerald-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-700 mb-2">{title}</h2>
      <p className="text-sm text-slate-400 max-w-sm">{description}</p>
      <div className="mt-4 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
        <p className="text-xs text-emerald-600 font-medium">
          Halaman ini akan segera tersedia
        </p>
      </div>
    </div>
  );
}
