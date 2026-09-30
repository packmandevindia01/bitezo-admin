import React from "react";

interface Props {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const SidebarItem = ({ icon, label, active, onClick, className = "" }: Props) => {
  return (
    <div
      onClick={onClick}
      className={`
        group flex items-center gap-2.5 px-3 py-2 mx-1 my-0.5 rounded-lg
        text-sm font-medium cursor-pointer transition-all duration-150
        hover:translate-x-0.5 active:scale-[0.98]
        ${
          active
            ? "bg-[#49293e]/10 text-[#49293e] font-semibold"
            : "text-gray-600 hover:bg-[#49293e]/8 hover:text-[#49293e]"
        }
        ${className}
      `}
    >
      <span className={`shrink-0 transition-colors ${active ? "text-[#49293e]" : "text-gray-400 group-hover:text-[#49293e]"}`}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
  );
};

export default SidebarItem;