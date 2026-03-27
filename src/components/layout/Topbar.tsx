// src/components/layout/Topbar.tsx
import { Menu, LogOut,  ChevronRight } from "lucide-react";
import { Modal, Button } from "../common";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useToast } from "../../context/ToastContext";

interface TopbarProps {
  toggleSidebar: () => void;
}

// Derive a readable page title from the current path
const getPageTitle = (pathname: string): string => {
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/users": "Users",
    "/dashboard/customers": "Customers",
    "/dashboard/users-reports": "User Reports",
    "/dashboard/customers-reports": "Customer Reports",
    "/dashboard/settings": "Settings",
  };
  return map[pathname] ?? "Dashboard";
};

const Topbar = ({ toggleSidebar }: TopbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const username = localStorage.getItem("userName") ?? "Admin";
  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = () => {
    localStorage.clear();
    showToast("Logged out successfully 👋", "success");
    navigate("/", { replace: true });
  };

  // Avatar initials
  const initials = username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div className="w-full flex justify-between items-center bg-white px-4 md:px-6 h-16 border-b border-gray-100 shadow-sm">

        {/* LEFT — hamburger + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-500"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-400 hidden sm:block">Bitezo</span>
            <ChevronRight size={13} className="text-gray-300 hidden sm:block" />
            <span className="font-semibold text-gray-700">{pageTitle}</span>
          </div>
        </div>

        {/* RIGHT — user chip + logout */}
        <div className="flex items-center gap-3">

          {/* User chip */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-1 pr-3 py-1">
            {/* Avatar */}
            <div className="h-7 w-7 rounded-full bg-[#49293e] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">{initials}</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {username}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            title="Logout"
            className="
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
              text-red-500 bg-red-50 border border-red-100
              hover:bg-red-500 hover:text-white hover:border-red-500
              transition-all duration-200
            "
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>
      </div>

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutModal && (
        <Modal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          title="Confirm Logout"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </>
          }
        >
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
              <LogOut size={22} className="text-red-400" />
            </div>
            <p className="text-gray-600 text-sm text-center">
              Are you sure you want to logout,{" "}
              <span className="font-semibold text-gray-800">{username}</span>?
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Topbar;