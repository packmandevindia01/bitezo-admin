import { Menu,  LogOut } from "lucide-react";
import { Button, Modal } from "../common";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "../../context/ToastContext";


interface TopbarProps {
  toggleSidebar: () => void;
}

const Topbar = ({ toggleSidebar }: TopbarProps) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userId");

    showToast("Logged out successfully 👋", "success");

    navigate("/", { replace: true });
  };

  return (
    <>
      <div className="w-full flex justify-between items-center bg-white px-4 md:px-6 h-20 border-b border-gray-200 shadow-sm">

        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Menu size={20} />
          </button>

          <h2 className="hidden sm:block font-semibold text-sm md:text-base text-gray-800">
            Dashboard
          </h2>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

         {/*  <Button size="sm" className="flex items-center gap-1 sm:gap-2">
            <Plus size={14} />
            <span className="hidden sm:inline">Add</span>
          </Button> */}

          {/* <Button variant="secondary" size="sm" className="flex items-center gap-1 sm:gap-2">
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </Button> */}

          {/* 🔥 Logout */}
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1 sm:gap-2"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </Button>

        </div>
      </div>

      {/* 🔥 LOGOUT CONFIRM MODAL */}
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
          Are you sure you want to logout?
        </Modal>
      )}
    </>
  );
};

export default Topbar;