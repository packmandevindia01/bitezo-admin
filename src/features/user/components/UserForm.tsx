import { useState, useEffect, useRef } from "react";
import { FormInput, Button, Checkbox } from "../../../components/common";
import { isRequired, isValidEmail } from "../../../utils/validators";
import type { User, UserFormData } from "../types";

interface Props {
  initialData?: User | null;
  onSubmit: (data: UserFormData) => void;
  onDelete?: () => void;
  isEdit?: boolean;
}

const UserForm = ({ initialData, onSubmit, onDelete, isEdit = false }: Props) => {
  const [form, setForm] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    active: true,
    isMaster: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const formContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialData) {
      const activeBool =
        typeof initialData.active === "string"
          ? /^(true|active|1)$/i.test(initialData.active)
          : Boolean(initialData.active);
      setForm((prev) => ({
        ...prev,
        name: initialData.name,
        email: initialData.email,
        active: activeBool,
        isMaster: Boolean(initialData.isMaster),
      }));
    }
  }, [initialData]);

  const handleChange = (key: keyof UserFormData, value: string | boolean) => {
    if (typeof value === "string") {
      setForm((prev) => ({ ...prev, [key]: value.slice(0, 25) }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleClear = () => {
    setForm({ name: "", email: "", password: "", confirmPassword: "", active: true, isMaster: false });
    setErrors({});
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!isRequired(form.name)) {
      newErrors.name = "User name is required";
    } else if (form.name.trim().length > 25) {
      newErrors.name = "User name cannot exceed 25 characters";
    }

    if (!isRequired(form.email)) {
      newErrors.email = "Email is required";
    } else if (form.email.trim().length > 25) {
      newErrors.email = "Email cannot exceed 25 characters";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Invalid email";
    }

    // Password only required on create
    if (!isEdit) {
      if (!isRequired(form.password)) {
        newErrors.password = "Password is required";
      } else if (form.password.length > 25) {
        newErrors.password = "Password cannot exceed 25 characters";
      }

      if (!isRequired(form.confirmPassword)) {
        newErrors.confirmPassword = "Confirm password is required";
      } else if (form.confirmPassword.length > 25) {
        newErrors.confirmPassword = "Confirm password cannot exceed 25 characters";
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;

    const target = e.target as HTMLElement;
    // Don't intercept Enter on buttons or textareas
    if (target.tagName === "BUTTON" || target.tagName === "TEXTAREA") return;

    e.preventDefault();

    const container = formContainerRef.current;
    if (!container) return;

    // Collect all interactive text inputs in DOM order
    const inputs = Array.from(
      container.querySelectorAll<HTMLInputElement>(
        'input:not([disabled]):not([readonly]):not([type="hidden"]):not([type="checkbox"])'
      )
    ).filter((el) => {
      if (el.tabIndex === -1) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    const currentIndex = inputs.indexOf(target as HTMLInputElement);
    if (currentIndex !== -1 && currentIndex + 1 < inputs.length) {
      inputs[currentIndex + 1].focus();
    } else {
      handleSubmit();
    }
  };

  return (
    <div ref={formContainerRef} onKeyDown={handleKeyDown}>
      {/* TITLE */}
      <h2 className="text-center font-bold text-lg mb-6">
        {isEdit ? "EDIT USER" : "USER CREATION"}
      </h2>

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <FormInput
          id="user-name"
          label="User Name"
          required
          autoFocus
          maxLength={25}
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />

        {/* Password fields — only on create */}
        {!isEdit && (
          <>
            <FormInput
              id="user-password"
              label="Password"
              type="password"
              required
              maxLength={25}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
            />

            <FormInput
              id="user-confirm-password"
              label="Confirm Pwd"
              type="password"
              required
              maxLength={25}
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
            />
          </>
        )}

        <FormInput
          id="user-email"
          label="Email"
          required
          type="email"
          maxLength={25}
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />

        {/* Checkboxes */}
        <div className="flex gap-4 mt-1">
          <Checkbox
            label="Is Active"
            checked={form.active}
            onChange={(e) => handleChange("active", e.target.checked)}
          />
          <Checkbox
            label="Is Master"
            checked={form.isMaster}
            onChange={(e) => handleChange("isMaster", e.target.checked)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6 justify-center items-center w-full">
        <Button variant="secondary" onClick={handleClear} tabIndex={-1}>
          Clear
        </Button>
        <Button onClick={handleSubmit}>
          Save
        </Button>
        {onDelete && (
          <Button variant="danger" onClick={onDelete} tabIndex={-1}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserForm;
