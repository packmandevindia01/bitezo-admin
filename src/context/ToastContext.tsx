import { createContext, useContext, useState} from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_DURATION = 3000;
const EXIT_DURATION = 400;

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bar: "bg-green-500",
    iconColor: "text-green-500",
    border: "border-green-100",
    label: "Success",
  },
  error: {
    icon: XCircle,
    bar: "bg-red-500",
    iconColor: "text-red-500",
    border: "border-red-100",
    label: "Error",
  },
  info: {
    icon: Info,
    bar: "bg-blue-500",
    iconColor: "text-blue-500",
    border: "border-blue-100",
    label: "Info",
  },
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    // Start exit animation
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
    }, TOAST_DURATION);

    // Remove from DOM
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION + EXIT_DURATION);
  };

  const dismiss = (id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_DURATION);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* TOAST STACK */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 items-end">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              style={{
                animation: toast.exiting
                  ? `toastOut ${EXIT_DURATION}ms ease-in forwards`
                  : `toastIn 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
              }}
              className={`
                relative flex items-start gap-3 w-80
                bg-white border ${config.border}
                rounded-xl shadow-lg shadow-black/8
                px-4 pt-3.5 pb-4 overflow-hidden
              `}
            >
              {/* LEFT COLOR BAR */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bar} rounded-l-xl`} />

              {/* ICON */}
              <Icon size={20} className={`${config.iconColor} shrink-0 mt-0.5`} />

              {/* CONTENT */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {config.label}
                </p>
                <p className="text-sm font-medium text-gray-800 leading-snug wrap-break-word">
                  {toast.message}
                </p>
              </div>

              {/* CLOSE */}
              <button
                onClick={() => dismiss(toast.id)}
                className="text-gray-300 hover:text-gray-500 transition shrink-0 mt-0.5"
              >
                <X size={15} />
              </button>

              {/* PROGRESS BAR */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100">
                <div
                  className={`h-full ${config.bar} opacity-40`}
                  style={{
                    animation: `progress ${TOAST_DURATION}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* KEYFRAMES */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(110%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0)    scale(1);    }
          to   { opacity: 0; transform: translateX(110%) scale(0.95); }
        }
        @keyframes progress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};