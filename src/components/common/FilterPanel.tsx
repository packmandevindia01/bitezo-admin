import type { ReactNode } from "react";
import { Filter, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
  resetDisabled?: boolean;
}

const FilterPanel = ({ children, onReset, resetDisabled = false }: Props) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Filter size={15} className="text-[#49293e]" />
          Filters
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={resetDisabled}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#49293e] transition disabled:opacity-40"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
};

export default FilterPanel;
