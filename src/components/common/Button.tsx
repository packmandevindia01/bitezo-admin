import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  isAction?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      onClick,
      type = "button",
      disabled = false,
      loading = false,
      fullWidth = false,
      isAction = false,
      icon,
      className = "",
      ...props
    },
    ref
  ) => {
    // 🎨 Variant styles
    const variants = {
      primary: "bg-[#49293e] text-white hover:bg-[#3c2232] border border-[#49293e]",
      secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300",
      danger: "bg-red-500 text-white hover:bg-red-600 border border-red-500",
    };

    // 📏 Responsive sizes
    const sizes = {
      sm: "px-3 py-1 text-xs md:text-sm",
      md: "px-3 md:px-4 py-2 text-sm",
      lg: "px-4 md:px-6 py-2 md:py-3 text-sm md:text-base",
    };

    // Uniform sizing for form action buttons
    const actionClasses = isAction
      ? "min-w-[120px] px-5 py-2.5 text-sm shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
      : "";

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          rounded-lg font-medium transition-all
          inline-flex items-center justify-center gap-2
          ${variants[variant]}
          ${!isAction ? sizes[size] : ""}
          ${actionClasses}
          ${fullWidth ? "w-full" : ""}
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
          focus:outline-none focus:ring-2 focus:ring-[#49293e] focus:ring-offset-1
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children && <span>{children}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
