import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchDashboardData } from "../services/dashboardApi";
import type { DashboardData } from "../services/dashboardApi";

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchDashboardData();
      setData(result);
    } catch (err: unknown) {
      const maybeErr = err as { response?: { data?: { message?: string } } };
      setError(
        maybeErr?.response?.data?.message ?? "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sum of last_6_months counts = "recent activity" stat
  const last6Total = useMemo(() => {
    return data?.last_6_months?.reduce((acc, m) => acc + m.count, 0) ?? 0;
  }, [data]);

  // Simple trend: compare last month vs month before
  const trend = useMemo(() => {
    const months = data?.last_6_months;
    if (!months || months.length < 2) return undefined;
    const last = months[months.length - 1].count;
    const prev = months[months.length - 2].count;
    if (prev === 0) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  }, [data]);

  return {
    data,
    loading,
    error,
    last6Total,
    trend,
    reload: loadData,
  };
};
