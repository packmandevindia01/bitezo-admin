import { useState, useEffect } from "react";
import { FormInput, Button, Checkbox } from "../../../components/common";
import { isRequired, isValidEmail } from "../../../utils/validators";
import type { User,UserFormData } from "../types";



interface Props {
  initialData?: User | null;
  onSubmit: (user: Omit<User, "id">) => void;
  onCancel?: () => void;
}

const UserForm = ({ initialData, onSubmit, onCancel }: Props) => {
  const [form, setForm] = useState<UserFormData>({
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    branch: "",
    active: false,
    isMaster: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>(
    {}
  );

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        name: initialData.name,
        email: initialData.email,
        branch: initialData.branch,
        active: initialData.active,
        isMaster: initialData.isMaster,
      }));
    }
  }, [initialData]);

  const handleChange = (key: keyof UserFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    // clear error on change
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // ✅ VALIDATION FUNCTION
  const validate = () => {
    const newErrors: typeof errors = {};

    if (!isRequired(form.name)) {
      newErrors.name = "User name is required";
    }

    if (!isRequired(form.password)) {
      newErrors.password = "Password is required";
    }

    if (!isRequired(form.confirmPassword)) {
      newErrors.confirmPassword = "Confirm password is required";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!isRequired(form.email)) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (!isRequired(form.branch)) {
      newErrors.branch = "Branch is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const { confirmPassword, password, ...rest } = form;

    onSubmit(rest); // send only required fields
  };

  return (
    <>
      <div className="flex flex-col gap-4 max-w-lg mx-auto">

        {/* USERNAME */}
        <FormInput
          label="User Name"
          required
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />

        {/* PASSWORD */}
        <FormInput
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
        />

        {/* CONFIRM PASSWORD */}
        <FormInput
          label="Confirm Password"
          type="password"
          required
          value={form.confirmPassword}
          onChange={(e) =>
            handleChange("confirmPassword", e.target.value)
          }
          error={errors.confirmPassword}
        />

        {/* BRANCH */}
        <FormInput
          label="Branch"
          required
          value={form.branch}
          onChange={(e) => handleChange("branch", e.target.value)}
          error={errors.branch}
        />

        {/* EMAIL */}
        <FormInput
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />

        {/* CHECKBOXES */}
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

      {/* ACTIONS */}
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