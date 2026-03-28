import { useState, useEffect } from "react";
import { FormInput, Button, SelectInput, Checkbox } from "../../../components/common";
import { isRequired, isValidEmail, isValidMobile } from "../../../utils/validators";
import { mapCountry } from "../../../utils/countryMapper";
import type { Employee, EmployeeFormData } from "../types";

interface Props {
  initialData?: Employee | null;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEdit?: boolean;
}

const initialState: EmployeeFormData = {
  name: "",
  mobNo: "",
  email: "",
  country: "",
  isActive: true,
};

const mobilePlaceholders: Record<string, string> = {
  IN: "+91 9876543210",
  AE: "+971 501234567",
  SA: "+966 512345678",
  BH: "+973 36001234",
  OM: "+968 92001234",
  QA: "+974 33001234",
  KW: "+965 51001234",
  SG: "+65 91234567",
  MY: "+60 121234567",
  TH: "+66 812345678",
};

const EmployeeForm = ({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  isEdit = false,
}: Props) => {
  const [form, setForm] = useState<EmployeeFormData>({ ...initialState });
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        mobNo: initialData.mobNo,
        email: initialData.email,
        country: initialData.country,
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  const handleChange = (key: keyof EmployeeFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleClear = () => {
    setForm({ ...initialState });
    setErrors({});
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!isRequired(form.name)) newErrors.name = "Name is required";

    if (!isRequired(form.mobNo)) {
      newErrors.mobNo = "Mobile number is required";
    } else if (
      form.country &&
      !isValidMobile(form.mobNo, mapCountry(form.country))
    ) {
      newErrors.mobNo = "Invalid mobile number";
    }

    if (!isRequired(form.email)) newErrors.email = "Email is required";
    else if (!isValidEmail(form.email)) newErrors.email = "Invalid email";

    if (!isRequired(form.country)) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <>
      <div className="flex flex-col gap-4">

        <FormInput
          label="Name"
          required
          autoFocus
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />

        <SelectInput
          label="Country"
          required
          value={form.country}
          onChange={(e) => handleChange("country", e.target.value)}
          options={[
            { label: "India", value: "India" },
            { label: "UAE", value: "UAE" },
            { label: "Saudi Arabia", value: "Saudi Arabia" },
            { label: "Bahrain", value: "Bahrain" },
            { label: "Oman", value: "Oman" },
            { label: "Qatar", value: "Qatar" },
            { label: "Kuwait", value: "Kuwait" },
            { label: "Singapore", value: "Singapore" },
            { label: "Malaysia", value: "Malaysia" },
            { label: "Thailand", value: "Thailand" },
          ]}
          error={errors.country}
        />

        <FormInput
          label="Mobile No"
          required
          placeholder={
            form.country
              ? mobilePlaceholders[mapCountry(form.country)] ?? "+91 9876543210"
              : "Select country first"
          }
          value={form.mobNo}
          onChange={(e) => handleChange("mobNo", e.target.value)}
          error={errors.mobNo}
        />

        <FormInput
          label="Email"
          required
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />

        {/* Checkbox */}
        <div className="flex justify-center mt-1">
          <Checkbox
            label="Is Active"
            checked={form.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
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

export default EmployeeForm;