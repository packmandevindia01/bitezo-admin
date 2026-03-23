import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  showClose?: boolean;
  footer?: React.ReactNode;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  footer,
}: ModalProps) => {

  // 🔥 ESC + Scroll lock
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  if (isOpen) {
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
  }

  return () => {
    window.removeEventListener("keydown", handleEsc);
    document.body.style.overflow = "auto";
  };
}, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className={`
          relative w-full ${sizes[size]}
          bg-white rounded-xl shadow-lg p-6 z-10
          animate-[fadeIn_0.2s_ease-in-out]
        `}
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          {title && (
            <h2
              id="modal-title"
              className="text-base md:text-lg font-semibold"
            >
              {title}
            </h2>
          )}

          {showClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div className="text-sm md:text-base">
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="mt-6 flex justify-end gap-3">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
};

export default Modal;