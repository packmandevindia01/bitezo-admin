import {
  BarChart3,
  TrendingUp,
  UserSquare2,
  BarChart2,
} from "lucide-react";
import SidebarDropdown from "../SidebarDropdown";

interface NavReportGroupProps {
  navigate: (path: string) => void;
  onClose: () => void;
  itemClassName: string;
  isActive: (path: string) => boolean;
}

const NavReportGroup = ({
  navigate,
  onClose,
  itemClassName,
  isActive,
}: NavReportGroupProps) => {
  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <SidebarDropdown icon={<BarChart3 size={17} />} label="Reports">
      <SidebarDropdown label="General" icon={<TrendingUp size={13} />} nested defaultOpen>
        <div
          onClick={() => handleItemClick("/dashboard/users-reports")}
          className={`
            ${itemClassName}
            ${isActive("/dashboard/users-reports") ? "bg-[#49293e]/10 text-[#49293e] font-semibold" : ""}
          `}
        >
          <UserSquare2
            size={13}
            className={`shrink-0 ${isActive("/dashboard/users-reports") ? "text-[#49293e]" : "text-gray-400 group-hover:text-[#49293e]"}`}
          />
          <span>User Reports</span>
        </div>

        <div
          onClick={() => handleItemClick("/dashboard/customers-reports")}
          className={`
            ${itemClassName}
            ${isActive("/dashboard/customers-reports") ? "bg-[#49293e]/10 text-[#49293e] font-semibold" : ""}
          `}
        >
          <BarChart2
            size={13}
            className={`shrink-0 ${isActive("/dashboard/customers-reports") ? "text-[#49293e]" : "text-gray-400 group-hover:text-[#49293e]"}`}
          />
          <span>Customer Reports</span>
        </div>
      </SidebarDropdown>
    </SidebarDropdown>
  );
};

export default NavReportGroup;
