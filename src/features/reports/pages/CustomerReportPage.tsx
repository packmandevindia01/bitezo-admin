import { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, Search } from "lucide-react";
import { EmptyState, FilterPanel, Loader, PageIntro, Table } from "../../../components/common";
import {
  CONNECTION_MODE_FILTER_OPTIONS,
  COUNTRY_FILTER_OPTIONS,
  DEMO_STATUS_FILTER_OPTIONS,
} from "../../../constants/formOptions";
import { exportCustomersExcel, exportCustomersPDF } from "../utils/customerReport";
import { getCustomerReport } from "../services/customerRptListApi";
import type { CustomerRptListRow, CustomerRptListParams } from "../services/customerRptListApi";
import { getDealerListName } from "../../dealer/services/dealerApi";
import { getEmployees } from "../../employees/services/employeeApi";
import { getCountryName } from "../../../utils/countryMapper";

const INITIAL_FILTERS: CustomerRptListParams = {
  custName: "",
  regId: "",
  database: "",
  country: "All",
  isDemo: "All",
  conMode: "All",
  dealerId: undefined,
  empId: undefined,
};

interface SelectOption {
  label: string;
  value: string;
}

const inputClass =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#49293e]/20 focus:border-[#49293e]/40 transition placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400";

const labelClass = "block text-xs font-medium text-gray-500 mb-1";

const CustomerReportPage = () => {
  const [data, setData] = useState<CustomerRptListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<CustomerRptListParams>(INITIAL_FILTERS);
  const [dealerOptions, setDealerOptions] = useState<SelectOption[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    const loadDealers = async () => {
      try {
        const dealers = await getDealerListName();
        setDealerOptions(
          dealers.map((dealer) => ({
            label: dealer.dealerName,
            value: String(dealer.dealerId),
          }))
        );
      } catch {
        setDealerOptions([]);
      }
    };

    loadDealers();
  }, []);

  useEffect(() => {
    const selectedDealerId = filters.dealerId;

    if (typeof selectedDealerId !== "number") {
      setEmployeeOptions([]);
      setFilters((prev) =>
        typeof prev.empId === "number" ? { ...prev, empId: undefined } : prev
      );
      return;
    }

    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const employees = await getEmployees({ dealerId: selectedDealerId });
        const nextOptions = employees.map((employee) => ({
          label: employee.name,
          value: String(employee.empId),
        }));

        setEmployeeOptions(nextOptions);
        setFilters((prev) => {
          if (prev.dealerId !== selectedDealerId) return prev;

          const selectedStillExists = nextOptions.some(
            (option) => Number(option.value) === prev.empId
          );

          return selectedStillExists || typeof prev.empId !== "number"
            ? prev
            : { ...prev, empId: undefined };
        });
      } catch {
        setEmployeeOptions([]);
        setFilters((prev) =>
          prev.dealerId === selectedDealerId
            ? { ...prev, empId: undefined }
            : prev
        );
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, [filters.dealerId]);

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
    { header: "Telephone", accessor: "custTel" as const },
    {
      header: "Dealer",
      accessor: "dealerName" as const,
      render: (row: CustomerRptListRow) =>
        row.dealerName || (row.dealerId ? String(row.dealerId) : "-"),
    },
    {
      header: "Employee",
      accessor: "employeeName" as const,
      render: (row: CustomerRptListRow) =>
        row.employeeName || (row.empId ? String(row.empId) : "-"),
    },
    {
      header: "Country",
      accessor: "country" as const,
      render: (row: CustomerRptListRow) => getCountryName(row.country),
    },
    { header: "Reg ID", accessor: "regId" as const },
    { header: "Database", accessor: "database" as const },
    { header: "Mode", accessor: "conMode" as const },
    {
      header: "Version",
      accessor: "version" as const,
      render: (row: CustomerRptListRow) => row.version || row.isDemo || "-",
    },
  ];

  return (
    <div className="space-y-4">
      <PageIntro
        title="Customer Report"
        description="Search and export customer data"
        actions={
          data.length > 0 ? (
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
          ) : undefined
        }
      />

      <FilterPanel onReset={handleReset} resetDisabled={loading}>
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

        <div>
          <label className={labelClass}>Dealer</label>
          <select
            className={inputClass}
            value={typeof filters.dealerId === "number" ? String(filters.dealerId) : ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                dealerId: e.target.value ? Number(e.target.value) : undefined,
                empId: undefined,
              }))
            }
            disabled={loading}
          >
            <option value="">All Dealers</option>
            {dealerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Employee</label>
          <select
            className={inputClass}
            value={typeof filters.empId === "number" ? String(filters.empId) : ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                empId: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            disabled={loading || typeof filters.dealerId !== "number" || loadingEmployees}
          >
            <option value="">
              {typeof filters.dealerId !== "number"
                ? "Select dealer first"
                : loadingEmployees
                  ? "Loading employees..."
                  : "All Employees"}
            </option>
            {employeeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Country</label>
          <select
            className={inputClass}
            value={filters.country}
            onChange={(e) => handleChange("country", e.target.value)}
            disabled={loading}
          >
            {COUNTRY_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value === "All" ? "All Countries" : option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Demo Status</label>
          <select
            className={inputClass}
            value={filters.isDemo}
            onChange={(e) => handleChange("isDemo", e.target.value)}
            disabled={loading}
          >
            {DEMO_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Connection Mode</label>
          <select
            className={inputClass}
            value={filters.conMode}
            onChange={(e) => handleChange("conMode", e.target.value)}
            disabled={loading}
          >
            {CONNECTION_MODE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </FilterPanel>

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
