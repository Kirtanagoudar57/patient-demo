import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import type { CountItem } from "../../services/dashboardService";

// Single-series charts use one color; text always uses slate ink, never the series color.
const SERIES_COLOR = "#2a78d6";
const GRID_COLOR = "#e2e8f0"; // slate-200
const AXIS_TEXT = "#64748b"; // slate-500
const SURFACE = "#ffffff";

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value ?? 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-slate-900">{label}</p>
      <p className="text-slate-600">
        <span className="tabular-nums">{value}</span> {value === 1 ? "patient" : "patients"}
      </p>
    </div>
  );
}

// Screen readers get the same numbers as a table.
function DataTable({ caption, data, labelHeader }: { caption: string; data: CountItem[]; labelHeader: string }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{labelHeader}</th>
          <th scope="col">Patients</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.label}>
            <td>{d.label}</td>
            <td>{d.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const axisProps = {
  tick: { fill: AXIS_TEXT, fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

export function AgeDistributionChart({ data }: { data: CountItem[] }) {
  return (
    <>
      <div className="h-64" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" {...axisProps} dy={6} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: GRID_COLOR, strokeWidth: 1 }} />
            <Line
              type="linear"
              dataKey="count"
              stroke={SERIES_COLOR}
              strokeWidth={2}
              dot={{ r: 4, fill: SERIES_COLOR, stroke: SURFACE, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: SERIES_COLOR, stroke: SURFACE, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <DataTable caption="Patients by age group" data={data} labelHeader="Age group" />
    </>
  );
}

export function ConditionsChart({ data }: { data: CountItem[] }) {
  return (
    <>
      <div className="h-64" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }} barCategoryGap={8}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} {...axisProps} />
            <YAxis
              type="category"
              dataKey="label"
              width={110}
              {...axisProps}
              tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f1f5f9" }} />
            <Bar dataKey="count" fill={SERIES_COLOR} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable caption="Most common conditions" data={data} labelHeader="Condition" />
    </>
  );
}
