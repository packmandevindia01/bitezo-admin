import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Settings } from "lucide-react";
import SidebarItem from "./SidebarItem";
import SidebarHeader from "./sidebar/SidebarHeader";
import NavMasterGroup from "./sidebar/NavMasterGroup";
import NavReportGroup from "./sidebar/NavReportGroup";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const itemClassName =
  "group flex items-center gap-2 px-3 py-1.5 mx-1 my-0.5 rounded-lg text-sm text-gray-600 cursor-pointer transition-all duration-150 hover:bg-[#49293e]/8 hover:text-[#49293e] hover:translate-x-0.5 active:scale-[0.98]";

const Sidebar = ({ onClose }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-dvh w-[280px] max-w-[85vw] flex-col border-r border-gray-100 bg-white shadow-[2px_0_20px_rgba(0,0,0,0.06)] md:h-screen md:w-64 md:max-w-none">
      <SidebarHeader onClose={onClose} />

      {/* MENU */}
      <div className="min-h-0 flex flex-1 flex-col overflow-y-auto overscroll-contain py-2 px-2 text-sm gap-0.5">
        <SidebarItem
          icon={<LayoutDashboard size={17} />}
          label="Dashboard"
          onClick={() => {
            navigate("/dashboard");
            onClose();
          }}
          active={isActive("/dashboard")}
        />

        <NavMasterGroup
          navigate={navigate}
          onClose={onClose}
          itemClassName={itemClassName}
          isActive={isActive}
        />

        <NavReportGroup
          navigate={navigate}
          onClose={onClose}
          itemClassName={itemClassName}
          isActive={isActive}
        />

        <SidebarItem
          icon={<Settings size={17} />}
          label="Settings"
          onClick={() => {
            navigate("/dashboard/settings");
            onClose();
          }}
          active={isActive("/dashboard/settings")}
        />
      </div>

      {/* BOTTOM VERSION TAG */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center tracking-wider uppercase font-medium">
          v1.0.0 · Bitezo Admin
        </p>
      </div>
    </div>
  );
};

export default Sidebar;