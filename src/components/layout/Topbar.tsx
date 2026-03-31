// src/components/layout/Topbar.tsx
import { Menu, LogOut, ChevronRight, User, ChevronDown } from "lucide-react";
import { Modal, Button } from "../common";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useDispatch, useSelector } from "react-redux";
import { clearCredentials } from "../../store/authSlice";
import type { RootState, AppDispatch } from "../../store/store";

interface TopbarProps {
  toggleSidebar: () => void;
}

const getPageTitle = (pathname: string): string => {
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/users": "Users",
    "/dashboard/customers": "Customers",
    "/dashboard/dealers": "Dealers",
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
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);
  const username = user?.userName ?? "Admin";

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageTitle = getPageTitle(location.pathname);

  const initials = username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
    showToast("Logged out successfully 👋", "success");
    navigate("/", { replace: true });
  };

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
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-400 hidden sm:block">Bitezo</span>
            <ChevronRight size={13} className="text-gray-300 hidden sm:block" />
            <span className="font-semibold text-gray-700">{pageTitle}</span>
          </div>
        </div>

        {/* RIGHT — profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-1 pr-3 py-1 hover:bg-gray-100 transition"
          >
            {/* Avatar */}
            <div className="h-7 w-7 rounded-full bg-[#49293e] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">{initials}</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {username}
            </span>
            <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">

              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="h-9 w-9 rounded-full bg-[#49293e] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{initials}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-800 truncate">{username}</span>
                  <span className="text-xs text-gray-400">Administrator</span>
                </div>
              </div>

              {/* Profile option */}
              <button
                onClick={() => { setShowDropdown(false); navigate("/dashboard/settings"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                <User size={15} className="text-gray-400" />
                Profile
              </button>

              {/* Logout option */}
              <button
                onClick={() => { setShowDropdown(false); setShowLogoutModal(true); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition border-t border-gray-100"
              >
                <LogOut size={15} />
                Logout
              </button>

            </div>
          )}
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