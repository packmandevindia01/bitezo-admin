// src/features/dashboard/components/PurchaseChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useState } from "react";
import type { MonthCount } from "../services/dashboardApi";

interface Props {
  data: MonthCount[];
  loading?: boolean;
}

type Range = 6 | 12;

// Format "2026-01" → "Jan '26"
const formatMonth = (raw: string) => {
  const [year, month] = raw.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-indigo-600">
          {payload[0].value} new customers
        </p>
      </div>
    );
  }
  return null;
};

const RangeToggle = ({
  value,
  onChange,
  activeColor,
}: {
  value: Range;
  onChange: (r: Range) => void;
  activeColor: string;
}) => (
  <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
    {([6, 12] as Range[]).map((r) => (
      <button
        key={r}
        onClick={() => onChange(r)}
        className={`text-xs font-medium px-3 py-1 rounded-md transition-all duration-150 ${
          value === r
            ? `bg-white shadow-sm ${activeColor}`
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        {r}M
      </button>
    ))}
  </div>
);

const PurchaseChart = ({ data, loading }: Props) => {
  const [range, setRange] = useState<Range>(12);

  const sliced = data.slice(-range);

  const chartData = sliced.map((d) => ({
    month: formatMonth(d.month),
    count: d.count,
  }));

  const maxVal = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Customer Acquisition</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            New customers · last {range} months
          </p>
        </div>
        <RangeToggle value={range} onChange={setRange} activeColor="text-indigo-600" />
      </div>

      {loading ? (
        <div className="h-62.5 flex items-end gap-2 px-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-100 rounded-t-lg animate-pulse"
              style={{ height: `${Math.random() * 60 + 30}%` }}
            />
          ))}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9", radius: 4 }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.count === maxVal ? "#6366f1" : "#c7d2fe"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PurchaseChart;