import { useEffect, useState } from "react";
import { FormInput, Button, SelectInput, Checkbox } from "../../../components/common";
import { COUNTRY_OPTIONS, MOBILE_PLACEHOLDERS } from "../../../constants/formOptions";
import { isRequired, isValidEmail, isValidMobile } from "../../../utils/validators";
import { getCountryName, mapCountry } from "../../../utils/countryMapper";
import type { Dealer, DealerFormData } from "../types";

interface Props {
  initialData?: Dealer | null;
  onSubmit: (data: DealerFormData) => void | Promise<void>;
  isEdit?: boolean;
}

const initialState: DealerFormData = {
  name: "",
  mobNo: "",
  email: "",
  country: "",
  isActive: true,
  createdDate: new Date().toISOString(),
};

const formatCreatedDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Automatically generated on save";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const DealerForm = ({ initialData, onSubmit, isEdit = false }: Props) => {
  const [form, setForm] = useState<DealerFormData>({ ...initialState });
  const [errors, setErrors] = useState<Partial<Record<keyof DealerFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        mobNo: initialData.mobNo,
        email: initialData.email,
        country: getCountryName(initialData.country),
        isActive: initialData.isActive,
        createdDate: initialData.createdDate,
      });
    }
  }, [initialData]);

  const handleChange = (
    key: keyof DealerFormData,
    value: DealerFormData[keyof DealerFormData]
  ) => {
    if (submitting) return;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleClear = () => {
    setForm({ ...initialState, createdDate: new Date().toISOString() });
    setErrors({});
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof DealerFormData, string>> = {};

    if (!isRequired(form.name)) newErrors.name = "Name is required";

    if (!isRequired(form.mobNo)) {
      newErrors.mobNo = "Mobile number is required";
    } else if (form.country && !isValidMobile(form.mobNo, mapCountry(form.country))) {
      newErrors.mobNo = "Invalid mobile number";
    }

    if (!isRequired(form.email)) newErrors.email = "Email is required";
    else if (!isValidEmail(form.email)) newErrors.email = "Invalid email";

    if (!isRequired(form.country)) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!validate()) return;
    try {
      setSubmitting(true);
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/*
        Note: we keep `createdDate` in the payload (swagger requires it).
        It's set automatically on create, and read-only when editing.
      */}
      <div className="flex flex-col gap-4">
        <FormInput
          label="Name"
          required
          autoFocus
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          disabled={submitting}
        />

        <SelectInput
          label="Country"
          required
          value={form.country}
          onChange={(e) => handleChange("country", e.target.value)}
          options={COUNTRY_OPTIONS}
          error={errors.country}
          disabled={submitting}
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
          disabled={submitting}
        />

        <FormInput
          label="Email"
          required
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          disabled={submitting}
        />

        <div className="flex justify-center mt-1">
          <Checkbox
            label="Is Active"
            checked={form.isActive}
            onChange={(e) => handleChange("isActive", e.target.checked)}
            disabled={submitting}
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Created Date</p>
          <p className="mt-1 text-sm text-gray-700">
            {formatCreatedDate(form.createdDate)}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6 justify-center">
        <Button variant="secondary" onClick={handleClear} disabled={submitting}>
          Clear
        </Button>
        <Button onClick={handleSubmit} disabled={submitting} loading={submitting}>
          {isEdit ? "Save" : "Create"}
        </Button>
      </div>
    </>
  );
};

export default DealerForm;

