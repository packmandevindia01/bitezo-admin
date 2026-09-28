// src/features/user/components/PasswordChangeForm.tsx
import { useState, useEffect, useRef } from "react";
import { FormInput, Button } from "../../../components/common";
import { isRequired } from "../../../utils/validators";

interface Props {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void | Promise<void>;
  onCancel?: () => void;
  serverError?: string | null;
  loading?: boolean;
  onClearServerError?: () => void;
}

interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordChangeForm = ({
  onSubmit,
  onCancel,
  serverError,
  loading = false,
  onClearServerError,
}: Props) => {
  const [form, setForm] = useState<FormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Reset form when unmounted or mounted
  useEffect(() => {
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
  }, []);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value.slice(0, 25) }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    if (serverError && onClearServerError) {
      onClearServerError();
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!isRequired(form.currentPassword))
      newErrors.currentPassword = "Required";
    else if (form.currentPassword.length > 25)
      newErrors.currentPassword = "Cannot exceed 25 characters";

    if (!isRequired(form.newPassword))
      newErrors.newPassword = "Required";
    else if (form.newPassword.length > 25)
      newErrors.newPassword = "Cannot exceed 25 characters";

    if (!isRequired(form.confirmPassword))
      newErrors.confirmPassword = "Required";
    else if (form.confirmPassword.length > 25)
      newErrors.confirmPassword = "Cannot exceed 25 characters";
    else if (form.newPassword !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;

    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.tagName === "TEXTAREA") return;

    e.preventDefault();

    const container = formContainerRef.current;
    if (!container) return;

    const inputs = Array.from(
      container.querySelectorAll<HTMLInputElement>(
        'input:not([disabled]):not([readonly]):not([type="hidden"])'
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
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        <FormInput
          id="change-current-password"
          label="Current Password"
          type="password"
          required
          autoFocus
          maxLength={25}
          value={form.currentPassword}
          onChange={(e) => handleChange("currentPassword", e.target.value)}
          error={errors.currentPassword || serverError || undefined}
        />

        <FormInput
          id="change-new-password"
          label="New Password"
          type="password"
          required
          maxLength={25}
          value={form.newPassword}
          onChange={(e) => handleChange("newPassword", e.target.value)}
          error={errors.newPassword}
        />

        <FormInput
          id="change-confirm-password"
          label="Confirm New Password"
          type="password"
          required
          maxLength={25}
          value={form.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
        />
      </div>

      <div className="flex gap-3 justify-center mt-6">
        <Button onClick={handleSubmit} loading={loading} disabled={loading}>
          Update Password
        </Button>
        {onCancel && (
          <Button
            variant="secondary"
            onClick={onCancel}
            tabIndex={-1}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default PasswordChangeForm;