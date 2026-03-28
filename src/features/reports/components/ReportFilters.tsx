import FilterBar from "../../../components/common/FilterBar";
import type { FilterField } from "../../../components/common/FilterBar";

interface Props {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
}

const ReportFilters = ({ values, onChange, onReset }: Props) => {
  const fields: FilterField[] = [
    {
      key: "custName",
      label: "Customer Name",
      type: "input",
      placeholder: "Enter customer name",
    },
    {
      key: "regId",
      label: "Registration ID",
      type: "input",
      placeholder: "Enter reg ID",
    },
    {
      key: "database",
      label: "Database",
      type: "input",
      placeholder: "Enter DB name",
    },
    {
      key: "country",
      label: "Country",
      type: "select",
      options: [
        { label: "All", value: "All" },
        { label: "India", value: "India" },
        { label: "Bahrain", value: "Bahrain" },
        { label: "UAE", value: "UAE" },
        { label: "Saudi Arabia", value: "Saudi Arabia" },
        { label: "Oman", value: "Oman" },
        { label: "Qatar", value: "Qatar" },
        { label: "Kuwait", value: "Kuwait" },
        { label: "Singapore", value: "Singapore" },
        { label: "Malaysia", value: "Malaysia" },
        { label: "Thailand", value: "Thailand" },
      ],
    },
    {
      key: "conMode",
      label: "Connection Mode",
      type: "select",
      options: [
        { label: "All", value: "All" },
        { label: "Online", value: "online" },
        { label: "Offline", value: "offline" },
      ],
    },
    {
      key: "isDemo",
      label: "Demo",
      type: "select",
      options: [
        { label: "All", value: "All" },
        { label: "Demo", value: "Demo" },
        { label: "Licenced", value: "Licenced" },
      ],
    },
  ];

  return (
    <FilterBar
      fields={fields}
      values={values}
      onChange={onChange}
      onReset={onReset}
    />
  );
};

export default ReportFilters;