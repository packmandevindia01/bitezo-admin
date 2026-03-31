import { useState } from "react";
import { FormInput, Button, SelectInput, Checkbox } from "../../../components/common";
import { COUNTRY_OPTIONS, MOBILE_PLACEHOLDERS } from "../../../constants/formOptions";
import { isRequired, isValidEmail, isValidMobile } from "../../../utils/validators";
import { mapCountry } from "../../../utils/countryMapper";
import type { Employee, EmployeeFormData } from "../types";
import type { SelectOption } from "../../../constants/formOptions";

interface Props {
  initialData?: Employee | null;
  onSubmit: (data: EmployeeFormData) => void;
  dealerOptions: SelectOption[];
  onDelete?: () => void;
  isEdit?: boolean;
}

const initialState: EmployeeFormData = {
  name: "",
  mobNo: "",
  email: "",
  country: "",
  dealerId: 0,
  isActive: true,
};

const createInitialState = (initialData?: Employee | null): EmployeeFormData => ({
  name: initialData?.name ?? initialState.name,
  mobNo: initialData?.mobNo ?? initialState.mobNo,
  email: initialData?.email ?? initialState.email,
  country: initialData?.country ?? initialState.country,
  dealerId: initialData?.dealerId ?? initialState.dealerId,
  isActive: initialData?.isActive ?? initialState.isActive,
});

const EmployeeForm = ({
  initialData,
  onSubmit,
  dealerOptions,
  onDelete,
  isEdit = false,
}: Props) => {
  const [form, setForm] = useState<EmployeeFormData>(() => createInitialState(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  const handleChange = (
    key: keyof EmployeeFormData,
    value: EmployeeFormData[keyof EmployeeFormData]
  ) => {
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
    if (!form.dealerId) newErrors.dealerId = "Dealer is required";

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
          label="Dealer"
          required
          value={form.dealerId ? String(form.dealerId) : ""}
          onChange={(e) => handleChange("dealerId", Number(e.target.value))}
          options={dealerOptions}
          error={errors.dealerId}
          placeholder="Select dealer"
        />

        <SelectInput
          label="Country"
          required
          value={form.country}
          onChange={(e) => handleChange("country", e.target.value)}
          options={COUNTRY_OPTIONS}
          error={errors.country}
        />

        <FormInput
          label="Mobile No"
          required
          placeholder={
            form.country
              ? MOBILE_PLACEHOLDERS[mapCountry(form.country)] ?? "+91 9876543210"
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
        <Button onClick={handleSubmit}>{isEdit ? "Save" : "Create"}</Button>
        {onDelete && (
          <Button variant="danger" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </>
  );
};

export default EmployeeForm;
