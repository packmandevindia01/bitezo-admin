import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Settings,
  X,
  Users,
  Building2,
  UserSquare2,
  BarChart2,
  TrendingUp,
  BoxesIcon,
  BriefcaseBusiness,
  Store
} from "lucide-react";

import SidebarItem from "./SidebarItem";
import SidebarDropdown from "./SidebarDropdown";
import logo from "../../assets/logo.png";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItem = (path: string, label: string, icon: React.ReactNode) => (
    <div
      onClick={() => { navigate(path); onClose(); }}
      className={`
        flex items-center gap-2.5 px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all duration-150
        ${isActive(path)
          ? "bg-[#49293e]/10 text-[#49293e] font-semibold"
          : "text-gray-500 hover:bg-gray-100 hover:text-[#49293e]"
        }
      `}
    >
      <span className={`shrink-0 ${isActive(path) ? "text-[#49293e]" : "text-gray-400"}`}>
        {icon}
      </span>
      {label}
    </div>
  );

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed md:static top-0 left-0 h-full w-64
          bg-white flex flex-col z-50
          border-r border-gray-100
          shadow-[2px_0_20px_rgba(0,0,0,0.06)]
          transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          transition-transform duration-300 ease-in-out
        `}
      >
        {/* CLOSE BUTTON (MOBILE) */}
        <div className="md:hidden flex justify-end px-3 pt-3 pb-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* LOGO + BRAND */}
        <div className="flex flex-col items-center justify-center gap-2 pt-4 pb-4 md:pt-8 md:pb-6 px-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-[#49293e]/20 to-[#49293e]/5 scale-110" />
            <img
              src={logo}
              alt="Bitezo Logo"
              className="relative h-12 w-12 md:h-20 md:w-20 rounded-full object-cover shadow-lg ring-2 ring-[#49293e]/20"
            />
          </div>
          <div className="text-center">
            <span className="font-bold text-lg md:text-xl text-[#49293e] tracking-wide block">
              Bitezo
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium hidden md:block">
              Admin Panel
            </span>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="mx-4 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent mb-2" />

        {/* MENU */}
        <div className="flex flex-col flex-1 overflow-y-auto py-2 px-3 gap-0.5">

          <SidebarItem
            icon={<LayoutDashboard size={17} />}
            label="Dashboard"
            onClick={() => { navigate("/dashboard"); onClose(); }}
            active={isActive("/dashboard")}
          />

          <SidebarDropdown icon={<Package size={17} />} label="Master">
            {navItem("/dashboard/users", "Users", <Users size={15} />)}
            {navItem("/dashboard/customers", "Customers", <Building2 size={15} />)}
            {navItem("/dashboard/employees", "Employees", <BriefcaseBusiness size={15} />)}
            {navItem("/dashboard/dealers", "Dealers", <Store size={15} />)}
          </SidebarDropdown>

          <SidebarDropdown icon={<BarChart3 size={17} />} label="Reports">
            <SidebarDropdown icon={<TrendingUp size={15} />} label="General">
              {navItem("/dashboard/users-reports", "Users", <UserSquare2 size={15} />)}
              {navItem("/dashboard/customers-reports", "Customers", <BarChart2 size={15} />)}
              {navItem("/dashboard/employees", "Employees", <BriefcaseBusiness size={15} />)}
            </SidebarDropdown>
            <div className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-500 hover:text-[#49293e] hover:bg-gray-100 rounded-lg cursor-pointer transition">
              <BoxesIcon size={15} className="text-gray-400 shrink-0" />
              Stock Report
            </div>
          </SidebarDropdown>

          <SidebarItem
            icon={<Settings size={17} />}
            label="Settings"
            onClick={() => { navigate("/dashboard/settings"); onClose(); }}
            active={isActive("/dashboard/settings")}
          />

        </div>

        {/* BOTTOM VERSION TAG */}
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-300 text-center tracking-wider uppercase">
            v1.0.0 · Bitezo Admin
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;