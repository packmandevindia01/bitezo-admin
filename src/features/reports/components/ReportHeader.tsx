import { SearchBar } from "../../../components/common";

interface Props {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const ReportHeader = ({
  title,
  searchValue,
  onSearchChange,
}: Props) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">

      <h2 className="text-lg font-semibold text-gray-800">
        {title}
      </h2>

      {onSearchChange && (
        <div className="w-full sm:w-75">
          <SearchBar
            value={searchValue || ""}
            onChange={(value) => onSearchChange(value)}
            placeholder="Search customers..."
          />
        </div>
      )}
    </div>
  );
};

export default ReportHeader;