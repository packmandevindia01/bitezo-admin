// src/features/user/components/PasswordChangeForm.tsx
import { useState } from "react";
import { FormInput, Button } from "../../../components/common";
import { isRequired } from "../../../utils/validators";

interface Props {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void;
  onCancel?: () => void;
}

interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordChangeForm = ({ onSubmit, onCancel }: Props) => {
  const [form, setForm] = useState<FormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!isRequired(form.currentPassword))
      newErrors.currentPassword = "Required";

    if (!isRequired(form.newPassword))
      newErrors.newPassword = "Required";
    else if (form.newPassword.length < 6)
      newErrors.newPassword = "Minimum 6 characters";

    if (!isRequired(form.confirmPassword))
      newErrors.confirmPassword = "Required";
    else if (form.newPassword !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        <FormInput
          label="Current Password"
          type="password"
          autoFocus
          value={form.currentPassword}
          onChange={(e) => handleChange("currentPassword", e.target.value)}
          error={errors.currentPassword}
        />

        <FormInput
          label="New Password"
          type="password"
          value={form.newPassword}
          onChange={(e) => handleChange("newPassword", e.target.value)}
          error={errors.newPassword}
        />

        <FormInput
          label="Confirm New Password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
        />
      </div>

      <div className="flex gap-3 justify-center mt-6">
        <Button onClick={handleSubmit}>Update Password</Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </>
  );
};

export default PasswordChangeForm;