import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import bitezoLogo from "../../../assets/bitezo-logo-hq-original.png";

interface SidebarHeaderProps {
  onClose: () => void;
}

const SidebarHeader = ({ onClose }: SidebarHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile close button */}
      <div className="flex shrink-0 justify-end p-3 md:hidden">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center border-b border-gray-100 px-4 py-4 md:py-5">
        <div
          onClick={() => {
            navigate("/dashboard");
            onClose();
          }}
          className="cursor-pointer flex flex-col items-center group transition-transform duration-200 hover:scale-[1.02]"
        >
          <img
            src={bitezoLogo}
            alt="Bitezo"
            className="h-8 md:h-9 w-auto max-w-[160px] object-contain"
          />
          <span className="mt-1.5 px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-widest uppercase bg-[#49293e]/10 text-[#49293e] border border-[#49293e]/20">
            Admin Panel
          </span>
        </div>
      </div>
    </>
  );
};

export default SidebarHeader;
