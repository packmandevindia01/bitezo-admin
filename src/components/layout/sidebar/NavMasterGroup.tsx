import {
  Package,
  Users,
  Building2,
  BriefcaseBusiness,
  Store,
} from "lucide-react";
import SidebarDropdown from "../SidebarDropdown";

interface NavMasterGroupProps {
  navigate: (path: string) => void;
  onClose: () => void;
  itemClassName: string;
  isActive: (path: string) => boolean;
}

const NavMasterGroup = ({
  navigate,
  onClose,
  itemClassName,
  isActive,
}: NavMasterGroupProps) => {
  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const navItems = [
    { path: "/dashboard/users", label: "Users", icon: Users },
    { path: "/dashboard/customers", label: "Customers", icon: Building2 },
    { path: "/dashboard/employees", label: "Employees", icon: BriefcaseBusiness },
    { path: "/dashboard/dealers", label: "Dealers", icon: Store },
  ];

  return (
    <SidebarDropdown icon={<Package size={17} />} label="Master" defaultOpen>
      {navItems.map(({ path, label, icon: Icon }) => {
        const active = isActive(path);
        return (
          <div
            key={path}
            onClick={() => handleItemClick(path)}
            className={`
              ${itemClassName}
              ${active ? "bg-[#49293e]/10 text-[#49293e] font-semibold" : ""}
            `}
          >
            <Icon
              size={14}
              className={`shrink-0 ${active ? "text-[#49293e]" : "text-gray-400 group-hover:text-[#49293e]"}`}
            />
            <span>{label}</span>
          </div>
        );
      })}
    </SidebarDropdown>
  );
};

export default NavMasterGroup;
