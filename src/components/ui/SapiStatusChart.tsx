import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { SapiSummary } from '../../types';

// ============================================================
// Sapi Status Donut Chart (Recharts)
// ============================================================

const COLORS: Record<string, string> = {
  Menunggu:   '#94a3b8',
  Disembelih: '#ef4444',
  Dikuliti:   '#f97316',
  Dicacah:    '#eab308',
  Selesai:    '#22c55e',
};

interface SapiStatusChartProps {
  summary: SapiSummary;
}

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
  value: number;
}

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: CustomLabelProps) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: { color: string };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: item.payload.color }}
        />
        <span className="font-medium text-slate-700">{item.name}</span>
      </div>
      <p className="text-slate-500 mt-0.5">{item.value} ekor</p>
    </div>
  );
}

export function SapiStatusChart({ summary }: SapiStatusChartProps) {
  const chartData = [
    { name: 'Menunggu',   value: summary.menunggu,   color: COLORS['Menunggu'] },
    { name: 'Disembelih', value: summary.disembelih, color: COLORS['Disembelih'] },
    { name: 'Dikuliti',   value: summary.dikuliti,   color: COLORS['Dikuliti'] },
    { name: 'Dicacah',    value: summary.dicacah,    color: COLORS['Dicacah'] },
    { name: 'Selesai',    value: summary.selesai,    color: COLORS['Selesai'] },
  ].filter(d => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Belum ada data sapi
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel as unknown as boolean}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center -mt-6">
          <p className="text-2xl font-bold text-slate-800">{summary.total}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
      </div>
    </div>
  );
}
