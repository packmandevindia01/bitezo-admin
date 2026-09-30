import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const NESTED_ACCENT = {
  bg: "bg-[#49293e]/8",
  text: "text-[#49293e]",
  border: "border-[#49293e]/25",
  dot: "bg-[#49293e]",
};

interface Props {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  nested?: boolean;
  defaultOpen?: boolean;
}

const hasValidChildren = (children: React.ReactNode): boolean => {
  if (!children) return false;

  const childArray = React.Children.toArray(children).filter(Boolean);
  if (childArray.length === 0) return false;

  return childArray.some((child) => {
    if (!React.isValidElement(child)) return false;

    if (child.type === SidebarDropdown) {
      const props = child.props as Props;
      return hasValidChildren(props.children);
    }

    return true;
  });
};

const SidebarDropdown = ({
  icon,
  label,
  children,
  nested = false,
  defaultOpen = false,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const accent = NESTED_ACCENT;

  if (!hasValidChildren(children)) {
    return null;
  }

  // ── Top-level group header (Master / Reports)
  if (!nested) {
    return (
      <div className="mb-0.5">
        <div
          onClick={() => setOpen((c) => !c)}
          className={`
            group flex cursor-pointer items-center justify-between px-3 py-2 mx-1 my-0.5 rounded-lg
            transition-all duration-150 select-none
            hover:bg-[#49293e]/8
            ${open ? "text-[#49293e] font-semibold" : "text-gray-600"}
          `}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={`
                shrink-0 transition-colors duration-150
                ${open ? "text-[#49293e]" : "text-gray-400 group-hover:text-[#49293e]"}
              `}
            >
              {icon}
            </span>
            <span
              className={`
                min-w-0 break-words font-medium text-sm
                ${open ? "text-[#49293e] font-semibold" : "text-gray-600 group-hover:text-[#49293e]"}
              `}
            >
              {label}
            </span>
          </div>

          <ChevronDown
            size={14}
            className={`shrink-0 transition-transform duration-300 ${
              open ? "rotate-180 text-[#49293e]" : "text-gray-400 group-hover:text-[#49293e]"
            }`}
          />
        </div>

        {/* Animated expand */}
        <div
          className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 flex flex-col ml-3 md:ml-4">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // ── Nested sub-heading (General)
  return (
    <div className="mb-1">
      <div
        onClick={() => setOpen((c) => !c)}
        className={`
          group flex cursor-pointer items-center justify-between
          mx-1 my-0.5 px-2.5 py-1.5 rounded-md
          transition-all duration-150 select-none
          ${accent.bg} border ${accent.border}
          hover:brightness-95
        `}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 opacity-70 ${accent.dot}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${accent.text}`}>
            {label}
          </span>
        </div>

        <ChevronDown
          size={11}
          className={`shrink-0 transition-transform duration-300 opacity-60 ${accent.text} ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div
          className={`
            min-h-0 flex flex-col text-gray-600 text-sm
            ml-2 pl-2 border-l-2 ${accent.border} my-0.5
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidebarDropdown;