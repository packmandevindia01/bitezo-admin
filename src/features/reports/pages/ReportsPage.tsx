import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../../store/store";
import { fetchUsers } from "../../../store/userSlice";
import { fetchCustomers } from "../../../store/customerSlice";

import { Button, FormInput, SelectInput, Table } from "../../../components/common";
import { useToast } from "../../../context/ToastContext";

import {
  exportUsersExcel,
  exportUsersPDF,
} from "../utils/userReport";

import {
  exportCustomersExcel,
  exportCustomersPDF,
} from "../utils/customerReport";
import {
  fetchCustomerRptList,
  type CustomerRptListParams,
  type CustomerRptListRow,
} from "../services/customerRptListApi";

const ReportsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const { list: users } = useSelector((state: RootState) => state.users);
  const { list: customers } = useSelector(
    (state: RootState) => state.customers
  );

  const [custRptParams, setCustRptParams] = useState<CustomerRptListParams>({
    custName: "",
    regId: "",
    country: "",
    isDemo: "",
    database: "",
    conMode: "",
  });
  const [custRptRows, setCustRptRows] = useState<CustomerRptListRow[]>([]);
  const [custRptLoading, setCustRptLoading] = useState(false);
  const [custRptEmptyMessage, setCustRptEmptyMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const customerRptColumns = useMemo(() => {
    const columns = [
      { header: "Customer", accessor: "custName" as const },
      { header: "Dealer", accessor: "dealerName" as const },
      { header: "Employee", accessor: "employeeName" as const },
      { header: "Reg ID", accessor: "regId" as const },
      { header: "Country", accessor: "country" as const },
      { header: "Database", accessor: "database" as const },
      { header: "Con Mode", accessor: "conMode" as const },
      {
        header: "Version",
        accessor: "version" as const,
        render: (row: CustomerRptListRow) => row.version || row.isDemo || "-",
      },
    ];
    return columns;
  }, []);

  const runCustomerReport = async () => {
    setCustRptLoading(true);
    setCustRptEmptyMessage(undefined);

    try {
      const { rows, emptyMessage } = await fetchCustomerRptList(custRptParams);
      setCustRptRows(rows);
      setCustRptEmptyMessage(emptyMessage);
      if (emptyMessage) showToast(emptyMessage, "info");
    } catch (e: any) {
      const msg = e?.message || "Failed to load report";
      setCustRptRows([]);
      showToast(msg, "error");
    } finally {
      setCustRptLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-xl font-bold">Reports</h1>

      {/* USERS */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="font-semibold mb-3">Users Report</h2>

        <div className="flex gap-3">
          <Button onClick={() => exportUsersExcel(users)}>
            Export Excel
          </Button>

          <Button onClick={() => exportUsersPDF(users)}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* CUSTOMERS */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="font-semibold mb-3">Customers Report</h2>

        <div className="flex gap-3">
          <Button onClick={() => exportCustomersExcel(customers)}>
            Export Excel
          </Button>

          <Button onClick={() => exportCustomersPDF(customers)}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* CUSTOMER REPORT LIST (Swagger: /api/admin/customer/rptlist) */}
      <div className="space-y-3">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-semibold">Customer Report List</h2>
              <p className="text-sm text-gray-500">
                Filters match Swagger params for <span className="font-mono">/api/admin/customer/rptlist</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setCustRptParams({
                    custName: "",
                    regId: "",
                    country: "",
                    isDemo: "",
                    database: "",
                    conMode: "",
                  });
                  setCustRptRows([]);
                  setCustRptEmptyMessage(undefined);
                }}
                disabled={custRptLoading}
              >
                Clear
              </Button>
              <Button onClick={runCustomerReport} disabled={custRptLoading}>
                {custRptLoading ? "Loading..." : "Search"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <FormInput
              label="Customer Name"
              value={custRptParams.custName || ""}
              onChange={(e) => setCustRptParams((p) => ({ ...p, custName: e.target.value }))}
              disabled={custRptLoading}
            />
            <FormInput
              label="Reg ID"
              value={custRptParams.regId || ""}
              onChange={(e) => setCustRptParams((p) => ({ ...p, regId: e.target.value }))}
              disabled={custRptLoading}
            />
            <SelectInput
              label="Country"
              value={custRptParams.country || ""}
              onChange={(e) => setCustRptParams((p) => ({ ...p, country: e.target.value }))}
              options={[
                { label: "All", value: "" },
                { label: "India (IN)", value: "IN" },
                { label: "UAE (AE)", value: "AE" },
                { label: "Saudi Arabia (SA)", value: "SA" },
                { label: "Bahrain (BH)", value: "BH" },
                { label: "Oman (OM)", value: "OM" },
                { label: "Qatar (QA)", value: "QA" },
                { label: "Kuwait (KW)", value: "KW" },
                { label: "Singapore (SG)", value: "SG" },
                { label: "Malaysia (MY)", value: "MY" },
                { label: "Thailand (TH)", value: "TH" },
              ]}
              disabled={custRptLoading}
            />
            <SelectInput
              label="Is Demo"
              value={custRptParams.isDemo || ""}
              onChange={(e) => setCustRptParams((p) => ({ ...p, isDemo: e.target.value }))}
              options={[
                { label: "All", value: "" },
                { label: "Yes", value: "true" },
                { label: "No", value: "false" },
              ]}
              disabled={custRptLoading}
            />
            <FormInput
              label="Database"
              value={custRptParams.database || ""}
              onChange={(e) => setCustRptParams((p) => ({ ...p, database: e.target.value }))}
              disabled={custRptLoading}
            />
            <SelectInput
              label="Connection Mode"
              value={custRptParams.conMode || ""}
              onChange={(e) => setCustRptParams((p) => ({ ...p, conMode: e.target.value }))}
              options={[
                { label: "All", value: "" },
                { label: "Online", value: "online" },
                { label: "Offline", value: "offline" },
              ]}
              disabled={custRptLoading}
            />
          </div>
        </div>

        {custRptEmptyMessage && custRptRows.length === 0 && (
          <div className="text-sm text-gray-500 px-1">{custRptEmptyMessage}</div>
        )}

        <Table
          columns={customerRptColumns as any}
          data={custRptRows as any}
          loading={custRptLoading}
        />
      </div>

    </div>
  );
};

export default ReportsPage;
