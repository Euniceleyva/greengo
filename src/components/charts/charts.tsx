"use client";

// Gráficas reutilizables con Recharts.
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AXIS = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };
const GRID_COLOR = "#94D9D9";
const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: "1px solid #94D9D9",
  fontSize: 12,
  boxShadow: "0 4px 14px rgba(19,43,36,0.08)",
};

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export function SimpleBarChart({
  data,
  color = "#9DC52D",
  height = 220,
  unit = "",
}: {
  data: BarDatum[];
  color?: string;
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={44} />
        <Tooltip
          formatter={(v: number) => [`${v.toLocaleString("es-MX")} ${unit}`.trim(), ""]}
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: "rgba(148,217,217,0.25)" }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleLineChart({
  data,
  color = "#94D9D9",
  height = 220,
  unit = "",
}: {
  data: BarDatum[];
  color?: string;
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={44} />
        <Tooltip
          formatter={(v: number) => [`${v.toLocaleString("es-MX")} ${unit}`.trim(), ""]}
          contentStyle={TOOLTIP_STYLE}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
