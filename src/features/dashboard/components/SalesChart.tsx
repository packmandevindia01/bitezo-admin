// src/features/dashboard/components/SalesChart.tsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MonthCount } from "../services/dashboardApi";

interface Props {
  data: MonthCount[];
  loading?: boolean;
}

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
        <p className="text-sm font-semibold text-emerald-600">
          {payload[0].value} customers
        </p>
      </div>
    );
  }
  return null;
};

const SalesChart = ({ data, loading }: Props) => {
  const chartData = data.map((d) => ({
    month: formatMonth(d.month),
    count: d.count,
  }));

  // Cumulative total for the area chart (running total of customers)
  let running = 0;
  const cumulativeData = chartData.map((d) => {
    running += d.count;
    return { month: d.month, total: running };
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Cumulative Customers</h3>
          <p className="text-xs text-gray-400 mt-0.5">Total growth over last 12 months</p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-600 font-medium px-3 py-1 rounded-full">
          12 months
        </span>
      </div>

      {loading ? (
        <div className="h-62.5  bg-gray-50 rounded-xl animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={cumulativeData}>
            <defs>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#emeraldGrad)"
              dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#10b981", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SalesChart;