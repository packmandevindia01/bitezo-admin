import { useState, useEffect } from "react";
import { FormInput, Button, Checkbox } from "../../../components/common";
import { isRequired, isValidEmail } from "../../../utils/validators";
import type { User, UserFormData } from "../types";

interface Props {
  initialData?: User | null;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEdit?: boolean;
}

const UserForm = ({ initialData, onSubmit, onCancel, onDelete, isEdit = false }: Props) => {
  const [form, setForm] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    active: true,
    isMaster: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        name: initialData.name,
        email: initialData.email,
        active: initialData.active,
        isMaster: initialData.isMaster,
      }));
    }
  }, [initialData]);

  const handleChange = (key: keyof UserFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleClear = () => {
    setForm({ name: "", email: "", password: "", confirmPassword: "", active: true, isMaster: false });
    setErrors({});
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!isRequired(form.name)) newErrors.name = "User name is required";
    if (!isRequired(form.email)) newErrors.email = "Email is required";
    else if (!isValidEmail(form.email)) newErrors.email = "Invalid email";

    // Password only required on create
    if (!isEdit) {
      if (!isRequired(form.password)) newErrors.password = "Password is required";
      if (!isRequired(form.confirmPassword)) newErrors.confirmPassword = "Confirm password is required";
      else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <>
      {/* TITLE */}
      <h2 className="text-center font-bold text-lg mb-6">
        {isEdit ? "EDIT USER" : "USER CREATION"}
      </h2>

      <div className="flex flex-col gap-4 max-w-sm">
        <FormInput
          label="User Name"
          required
          autoFocus
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />

        {/* Password fields — only on create */}
        {!isEdit && (
          <>
            <FormInput
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
            />

            <FormInput
              label="Confirm Pwd"
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
            />
          </>
        )}

        <FormInput
          label="Email"
          required
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
      <div className="flex gap-3 mt-6 justify-center">
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
        <Button onClick={handleSubmit}>
          Save
        </Button>
        {onDelete && (
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        )}
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