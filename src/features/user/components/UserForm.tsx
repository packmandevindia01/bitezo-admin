import { useState, useEffect } from "react";
import { FormInput, Button, Checkbox } from "../../../components/common";
import { isRequired, isValidEmail } from "../../../utils/validators";
import type { User, UserFormData } from "../types";

interface Props {
  initialData?: User | null;
  onSubmit: (user: Omit<UserFormData, "confirmPassword">) => void;
  onCancel?: () => void;
}

const UserForm = ({ initialData, onSubmit, onCancel }: Props) => {
  
  const [form, setForm] = useState<UserFormData>({
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    active: true,
    isMaster: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});

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

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!isRequired(form.name)) newErrors.name = "Required";
    if (!isRequired(form.password)) newErrors.password = "Required";
    if (!isRequired(form.confirmPassword))
      newErrors.confirmPassword = "Required";

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!isRequired(form.email)) newErrors.email = "Required";
    if (!initialData && !isRequired(form.password)) {
      newErrors.password = "Required";
    }

    if (!initialData && !isRequired(form.confirmPassword)) {
      newErrors.confirmPassword = "Required";
    }

    if (
      !initialData &&
      form.password !== form.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    else if (!isValidEmail(form.email)) newErrors.email = "Invalid email";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
  console.log("🟢 BUTTON CLICKED"); // 👈 ADD THIS

  if (!validate()) {
    console.log("❌ VALIDATION FAILED");
    return;
  }

  console.log("✅ VALIDATION PASSED");

  const { confirmPassword, ...payload } = form;

  console.log("📤 SENDING TO PARENT", payload);

  onSubmit(payload);
};

  return (
    <>
      <div className="flex flex-col gap-4 max-w-lg mx-auto">
        <FormInput
          label="User Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />

        <FormInput
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
        />

        <FormInput
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) =>
            handleChange("confirmPassword", e.target.value)
          }
          error={errors.confirmPassword}
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