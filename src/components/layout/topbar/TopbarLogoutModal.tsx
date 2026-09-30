import { LogOut } from "lucide-react";
import { Modal, Button } from "../../common";

interface TopbarLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onLogout: () => void;
}

const TopbarLogoutModal = ({
  isOpen,
  onClose,
  username,
  onLogout,
}: TopbarLogoutModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Logout"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} tabIndex={-1}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onLogout}>
            Logout
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <LogOut size={22} className="text-red-400" />
        </div>
        <p className="text-center text-sm text-gray-600">
          Are you sure you want to logout,{" "}
          <span className="font-semibold text-gray-800">{username}</span>?
        </p>
      </div>
    </Modal>
  );
};

export default TopbarLogoutModal;
