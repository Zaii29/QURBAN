import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { DistribusiPerHari } from '../../types';

// ============================================================
// Distribusi Per Hari — Bar Chart (Recharts)
// ============================================================

interface DistribusiChartProps {
  data: DistribusiPerHari[];
}

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

function CustomBarTooltip({ active, payload, label }: CustomBarTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            {p.dataKey === 'beratKg'
              ? `${p.value} kg daging`
              : `${p.value} warga`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DistribusiChart({ data }: DistribusiChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        Belum ada data distribusi
      </div>
    );
  }

  const maxBerat = Math.max(...data.map(d => d.beratKg));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
        barSize={28}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="tanggal"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}kg`}
          domain={[0, Math.ceil(maxBerat * 1.2)]}
        />
        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="beratKg" radius={[6, 6, 0, 0]}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === data.length - 1 ? '#059669' : '#a7f3d0'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
