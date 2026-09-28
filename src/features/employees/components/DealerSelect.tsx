import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";
import type { SelectOption } from "../../../constants/formOptions";

interface Props {
  label?: string;
  required?: boolean;
  value?: number;
  options: SelectOption[];
  onChange: (value: number) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const DealerSelect = ({
  label = "Assigned Dealer",
  required = false,
  value = 0,
  options = [],
  onChange,
  error,
  placeholder = "Select Authorized Dealer",
  disabled = false,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Find currently selected option
  const selectedOption = useMemo(
    () => options.find((opt) => Number(opt.value) === value),
    [options, value]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, searchTerm]);

  const handleSelect = (val: number) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 50);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(0);
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-1 mb-4 w-full relative" ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="text-xs md:text-sm font-medium text-gray-700 flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
          {value > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <div
        ref={triggerRef}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-focusable="true"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) setIsOpen((prev) => !prev);
          } else if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className={`
          w-full min-w-0 px-3 md:px-4 py-2 text-sm rounded-lg border bg-white
          flex items-center justify-between gap-2 transition cursor-pointer select-none
          focus:outline-none focus:ring-2 focus:ring-[#49293e]/30 focus:border-[#49293e]
          ${error ? "border-red-500 ring-1 ring-red-500/20" : "border-gray-200 hover:border-gray-300"}
          ${isOpen ? "ring-2 ring-[#49293e]/30 border-[#49293e] shadow-sm" : ""}
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-75" : ""}
        `}
      >
        <span
          className={`truncate block flex-1 text-left ${
            selectedOption ? "text-gray-900 font-medium" : "text-gray-400"
          }`}
          title={selectedOption?.label}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
          {value > 0 && !disabled && (
            <span
              onClick={handleClear}
              className="hover:text-gray-600 p-0.5 rounded transition"
              title="Clear selection"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-[#49293e]" : ""}`}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <span className="text-xs text-red-500">{error}</span>}

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col animate-[fadeIn_0.1s_ease-out] w-full max-w-full">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/80">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search dealers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    if (filteredOptions.length > 0) {
                      handleSelect(Number(filteredOptions[0].value));
                    }
                  }
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#49293e]/20 focus:border-[#49293e]/40 transition placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-center text-xs text-gray-400">
                No matching dealers found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const optVal = Number(opt.value);
                const isSelected = optVal === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(optVal)}
                    className={`
                      flex items-center justify-between px-3 py-2 text-xs md:text-sm rounded-lg cursor-pointer transition-colors
                      ${
                        isSelected
                          ? "bg-[#49293e]/10 text-[#49293e] font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                    title={opt.label}
                  >
                    <span className="truncate block flex-1 mr-2">{opt.label}</span>
                    {isSelected && <Check size={14} className="text-[#49293e] shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerSelect;
