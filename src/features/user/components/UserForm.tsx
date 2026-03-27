// src/features/user/components/UserForm.tsx
import { useState, useEffect } from "react";
import { FormInput, Button, Checkbox } from "../../../components/common";
import { isRequired, isValidEmail } from "../../../utils/validators";
import type { User, UserFormData } from "../types";

interface Props {
  initialData?: User | null;
  onSubmit: (user: Omit<UserFormData, "confirmPassword" | "password">) => void;
  onCancel?: () => void;
}

type EditFormData = Omit<UserFormData, "password" | "confirmPassword">;

const UserForm = ({ initialData, onSubmit, onCancel }: Props) => {
  const [form, setForm] = useState<EditFormData>({
    name: "",
    email: "",
    active: true,
    isMaster: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EditFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        email: initialData.email,
        active: initialData.active,
        isMaster: initialData.isMaster,
      });
    }
  }, [initialData]);

  const handleChange = (key: keyof EditFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!isRequired(form.name)) newErrors.name = "Required";
    if (!isRequired(form.email)) newErrors.email = "Required";
    else if (!isValidEmail(form.email)) newErrors.email = "Invalid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <>
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        <FormInput
          label="User Name"
          autoFocus
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />

        <FormInput
          label="Email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />

        <div className="flex gap-6 justify-center">
          <Checkbox
            label="Active"
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

      <div className="flex gap-3 justify-center mt-6">
        <Button onClick={handleSubmit}>Save</Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </>
  );
};

export default UserForm;