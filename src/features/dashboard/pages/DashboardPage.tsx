// src/features/dashboard/pages/DashboardPage.tsx
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import StatCard from "../components/StatCard";
import PurchaseChart from "../components/PurchaseChart";
import SalesChart from "../components/SalesChart";
import { useDashboardData } from "../hooks/useDashboardData";

const DashboardPage = () => {
  const { data, loading, error, last6Total, trend, reload } = useDashboardData();

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            className="text-sm text-indigo-600 underline"
            onClick={reload}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Company overview and growth metrics</p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={loading ? "—" : (data?.customers ?? 0)}
          icon={<Users size={20} />}
          color="#6366f1"
          bgColor="#eef2ff"
          subtitle="All registered customers"
          loading={loading}
        />

        <StatCard
          title="Demo Customers"
          value={loading ? "—" : (data?.customers_demo ?? 0)}
          icon={<UserCheck size={20} />}
          color="#f59e0b"
          bgColor="#fffbeb"
          subtitle="On trial or demo plan"
          loading={loading}
        />

        <StatCard
          title="Inactive Customers"
          value={loading ? "—" : (data?.customers_inactive ?? 0)}
          icon={<UserX size={20} />}
          color="#ef4444"
          bgColor="#fef2f2"
          subtitle="Currently inactive"
          loading={loading}
        />

        <StatCard
          title="New (Last 6 Months)"
          value={loading ? "—" : last6Total}
          icon={<TrendingUp size={20} />}
          color="#10b981"
          bgColor="#ecfdf5"
          subtitle="Recent registrations"
          trend={trend}
          loading={loading}
        />
      </div>

      {/* ── CHARTS ── */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <SalesChart
          data={data?.last_6_months ?? []}
          loading={loading}
        />
        <PurchaseChart
          data={data?.last_6_months ?? []}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default DashboardPage;