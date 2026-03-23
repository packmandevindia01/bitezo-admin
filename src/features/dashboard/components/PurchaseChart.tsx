import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Oct", purchase: 13000 },
  { month: "Nov", purchase: 13200 },
  { month: "Dec", purchase: 14000 },
  { month: "Jan", purchase: 14500 },
  { month: "Feb", purchase: 10000 },
  { month: "Mar", purchase: 7000 },
];

const PurchaseChart = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold mb-4">
        Purchase Over Last 6 Months
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="purchase" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PurchaseChart;