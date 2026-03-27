// src/features/reports/pages/CustomerReportPage.tsx
import { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, Search, RotateCcw, Filter } from "lucide-react";
import { Table, Loader, EmptyState } from "../../../components/common";
import { exportCustomersExcel, exportCustomersPDF } from "../utils/customerReport";
import { getCustomerReport } from "../services/customerRptListApi";
import type { CustomerRptListRow, CustomerRptListParams } from "../services/customerRptListApi";

const INITIAL_FILTERS: CustomerRptListParams = {
  custName: "",
  regId: "",
  database: "",
  country: "All",
  isDemo: "All",
  conMode: "All",
};

const inputClass =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#49293e]/20 focus:border-[#49293e]/40 transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400";

const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const CustomerReportPage = () => {
  const [data, setData] = useState<CustomerRptListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<CustomerRptListParams>(INITIAL_FILTERS);

  const fetchReport = async (params: CustomerRptListParams) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await getCustomerReport(params);
      setData(res);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch with debounce on filter change
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchReport(filters);
    }, 500);
    return () => clearTimeout(delay);
  }, [filters]);

  const handleChange = (key: keyof CustomerRptListParams, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setData([]);
    setHasSearched(false);
  };

  const columns = [
    { header: "ID", accessor: "custId" as const },
    { header: "Name", accessor: "custName" as const },
    { header: "Mobile", accessor: "custMob" as const },
    { header: "Country", accessor: "country" as const },
    { header: "Reg ID", accessor: "regId" as const },
    { header: "Database", accessor: "database" as const },
    { header: "Mode", accessor: "conMode" as const },
  ];

  return (
    <div className="space-y-4">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Customer Report</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Search and export customer data
          </p>
        </div>

        {/* Export buttons — only show when there's data */}
        {data.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCustomersExcel(data)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200"
            >
              <FileSpreadsheet size={15} />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={() => exportCustomersPDF(data)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
            >
              <FileText size={15} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* FILTER CARD */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {/* Filter header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Filter size={15} className="text-[#49293e]" />
            Filters
          </div>
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#49293e] transition disabled:opacity-40"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>

        {/* Filter grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Customer Name */}
          <div>
            <label className={labelClass}>Customer Name</label>
            <input
              className={inputClass}
              placeholder="Search by name..."
              value={filters.custName}
              onChange={(e) => handleChange("custName", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Reg ID */}
          <div>
            <label className={labelClass}>Registration ID</label>
            <input
              className={inputClass}
              placeholder="Enter reg ID..."
              value={filters.regId}
              onChange={(e) => handleChange("regId", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Database */}
          <div>
            <label className={labelClass}>Database</label>
            <input
              className={inputClass}
              placeholder="Enter database name..."
              value={filters.database}
              onChange={(e) => handleChange("database", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Country */}
          <div>
            <label className={labelClass}>Country</label>
            <select
              className={inputClass}
              value={filters.country}
              onChange={(e) => handleChange("country", e.target.value)}
              disabled={loading}
            >
              <option value="All">All Countries</option>
              <option value="IN">India (IN)</option>
              <option value="AE">UAE (AE)</option>
              <option value="SA">Saudi Arabia (SA)</option>
              <option value="BH">Bahrain (BH)</option>
              <option value="OM">Oman (OM)</option>
              <option value="QA">Qatar (QA)</option>
              <option value="KW">Kuwait (KW)</option>
              <option value="SG">Singapore (SG)</option>
              <option value="MY">Malaysia (MY)</option>
              <option value="TH">Thailand (TH)</option>
            </select>
          </div>

          {/* Demo */}
          <div>
            <label className={labelClass}>Demo Status</label>
            <select
              className={inputClass}
              value={filters.isDemo}
              onChange={(e) => handleChange("isDemo", e.target.value)}
              disabled={loading}
            >
              <option value="All">All</option>
              <option value="Demo">Demo</option>
              <option value="Licenced">Licenced</option>
            </select>
          </div>

          {/* Connection Mode */}
          <div>
            <label className={labelClass}>Connection Mode</label>
            <select
              className={inputClass}
              value={filters.conMode}
              onChange={(e) => handleChange("conMode", e.target.value)}
              disabled={loading}
            >
              <option value="All">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

        </div>
      </div>

      {/* RESULTS */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : !hasSearched ? (
        <EmptyState
          title="No data loaded"
          description="Start typing to search customers"
        />
      ) : data.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try adjusting your filters"
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Results bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Search size={14} />
              <span>
                <span className="font-semibold text-gray-800">{data.length}</span>{" "}
                result{data.length !== 1 ? "s" : ""} found
              </span>
            </div>
          </div>
          <Table data={data} columns={columns} />
        </div>
      )}

    </div>
  );
};

export default CustomerReportPage;