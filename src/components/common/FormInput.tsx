import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  inputClassName?: string;
  wrapperClassName?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  labelIcon?: React.ReactNode;
  hideLabel?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      type = "text",
      name,
      id,
      placeholder,
      required,
      value,
      onChange,
      onBlur,
      onKeyDown,
      onFocus,
      error,
      disabled,
      readOnly,
      autoComplete,
      autoFocus,
      className = "",
      inputClassName = "",
      wrapperClassName = "",
      icon,
      rightIcon,
      labelIcon,
      hideLabel = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || name || label?.replace(/\s+/g, "-").toLowerCase();
    const isPasswordField = type === "password";
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPasswordField && showPassword ? "text" : type;

    return (
      <div className={`flex flex-col gap-1 mb-4 w-full ${wrapperClassName}`}>
        {/* LABEL */}
        {label && !hideLabel && (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-gray-700"
          >
            {labelIcon && <span>{labelIcon}</span>}
            <span>{label}</span>
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* INPUT WRAPPER */}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={inputType}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            placeholder={placeholder || (required ? "Enter value" : "")}
            className={`
              w-full px-3 md:px-4 py-2
              text-sm md:text-base
              rounded-md border outline-none transition
              ${icon ? "pl-9" : ""}
              ${isPasswordField || rightIcon ? "pr-12" : ""}
              ${error ? "border-red-500 bg-red-50" : "border-gray-300"}
              ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
              ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}
              focus:border-[#49293e]
              ${inputClassName}
              ${className}
            `}
            {...props}
          />

          {rightIcon && !isPasswordField && (
            <div className="absolute right-3 flex items-center text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}

          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-1 my-1 flex items-center justify-center rounded-md px-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              disabled={disabled}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {/* ERROR */}
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
