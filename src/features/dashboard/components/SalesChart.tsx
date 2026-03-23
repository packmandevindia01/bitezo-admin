import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Oct", sales: 12000 },
  { month: "Nov", sales: 12500 },
  { month: "Dec", sales: 13500 },
  { month: "Jan", sales: 14000 },
  { month: "Feb", sales: 10000 },
  { month: "Mar", sales: 7000 },
];

const SalesChart = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold mb-4">
        Sales Over Last 6 Months
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sales" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;