import { useEffect, useState } from "react";
import ReportFilters from "../components/ReportFilters";

import {
  Table,
  Button,
  Loader,
  EmptyState,
} from "../../../components/common";

import {
  exportCustomersExcel,
  exportCustomersPDF,
} from "../utils/customerReport";

import { getCustomerReport } from "../services/customerRptListApi";

const CustomerReportPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    custName: "",
    regId: "",
    database: "",
    country: "All",
    isDemo: "All",
    conMode: "All",
  });

  const [hasSearched, setHasSearched] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await getCustomerReport(filters);
      setData(res);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 AUTO FILTER
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchReport();
    }, 500);

    return () => clearTimeout(delay);
  }, [filters]);

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      custName: "",
      regId: "",
      database: "",
      country: "All",
      isDemo: "All",
      conMode: "All",
    });
    setData([]);
    setHasSearched(false);
  };

  return (
    <div className="p-6 space-y-4">

      {/* 🔥 TITLE */}
      <h2 className="text-lg font-semibold text-gray-800">
        Customer Report
      </h2>

      {/* 🔥 FILTERS */}
      <ReportFilters
        values={filters}
        onChange={handleChange}
        onReset={handleReset}
      />

      {/* 🔥 LOADER */}
      {loading && <Loader />}

      {/* 🔥 TABLE */}
      {!loading && !hasSearched ? (
        <EmptyState
          title="No data loaded"
          description="Start typing to search"
        />
      ) : !loading && data.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try different filters"
          actionLabel="Reset Filters"
          onAction={handleReset}
        />
      ) : !loading && (
        <>
          <Table
            data={data}
            columns={[
              { header: "ID", accessor: "custId" },
              { header: "Name", accessor: "custName" },
              { header: "Mobile", accessor: "custMob" },
              { header: "Country", accessor: "country" },
              { header: "Reg ID", accessor: "regId" },
              { header: "Database", accessor: "database" },
              { header: "Mode", accessor: "conMode" },
            ]}
          />

          {/* 🔥 DOWNLOAD BUTTONS */}
          <div className="flex justify-end gap-3 mt-4">
            <Button
              disabled={!data.length}
              onClick={() => exportCustomersExcel(data)}
            >
              Download Excel
            </Button>

            <Button
              disabled={!data.length}
              onClick={() => exportCustomersPDF(data)}
            >
              Download PDF
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerReportPage;