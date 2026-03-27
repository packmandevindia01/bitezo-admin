// src/features/dashboard/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

import StatCard from "../components/StatCard";
import PurchaseChart from "../components/PurchaseChart";
import SalesChart from "../components/SalesChart";
import { fetchDashboardData } from "../services/dashboardApi";
import type { DashboardData } from "../services/dashboardApi";

const DashboardPage = () => { 
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchDashboardData();
        setData(result);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Sum of last_6_months counts = "recent activity" stat
  const last6Total = data?.last_6_months.reduce((acc, m) => acc + m.count, 0) ?? 0;

  // Simple trend: compare last month vs month before
  const computeTrend = (months: DashboardData["last_6_months"]) => {
    if (months.length < 2) return undefined;
    const last = months[months.length - 1].count;
    const prev = months[months.length - 2].count;
    if (prev === 0) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  };

  const trend = data ? computeTrend(data.last_6_months) : undefined;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            className="text-sm text-indigo-600 underline"
            onClick={() => window.location.reload()}
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
          value={loading ? "—" : data!.customers}
          icon={<Users size={20} />}
          color="#6366f1"
          bgColor="#eef2ff"
          subtitle="All registered customers"
          loading={loading}
        />

        <StatCard
          title="Demo Customers"
          value={loading ? "—" : data!.customers_demo}
          icon={<UserCheck size={20} />}
          color="#f59e0b"
          bgColor="#fffbeb"
          subtitle="On trial or demo plan"
          loading={loading}
        />

        <StatCard
          title="Inactive Customers"
          value={loading ? "—" : data!.customers_inactive}
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
          subtitle="Customer acquisitions"
          trend={trend}
          loading={loading}
        />

      </div>

      {/* ── CHARTS ── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <PurchaseChart data={data?.last_12_months ?? []} loading={loading} />
        <SalesChart data={data?.last_12_months ?? []} loading={loading} />
      </div>

    </div>
  );
};

export default DashboardPage;