import { useState } from "react";
import { FormInput, Button, SelectInput } from "../../../components/common";
import { createCustomer } from "../services/customerApi";
import type { CustomerFormData } from "../types";
import { isRequired, isValidMobile, isNumber } from "../../../utils/validators";
import { useToast } from "../../../context/ToastContext";

const initialState: CustomerFormData = {
  custName: "",
  custMob: "",
  custMob2: "",
  country: "",
  block: "",
  area: "",
  road: "",
  building: "",
  branchCount: 0,
  regId: "",
  startDate: "",
  isDemo: true,
  database: "",
  conMode:"",
};

const CustomerForm = () => {
  const { showToast } = useToast();

  const [form, setForm] = useState<CustomerFormData>({
    ...initialState,
    startDate: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerFormData, string>>
  >({});

  const handleChange = (key: keyof CustomerFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    // clear error
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // ✅ VALIDATION
  const validate = () => {
    const newErrors: typeof errors = {};

    if (!isRequired(form.custName)) {
      newErrors.custName = "Company name is required";
    }

    if (!isRequired(form.regId)) {
      newErrors.regId = "Customer ID is required";
    }

    if (!isRequired(form.custMob)) {
      newErrors.custMob = "Mobile number is required";
    } else if (!isValidMobile(form.custMob)) {
      newErrors.custMob = "Invalid mobile number";
    }

    if (form.custMob2 && !isValidMobile(form.custMob2)) {
      newErrors.custMob2 = "Invalid mobile number";
    }

    if (!isRequired(form.country)) {
      newErrors.country = "Country is required";
    }

    if (!form.branchCount || !isNumber(form.branchCount.toString())) {
      newErrors.branchCount = "Branch count must be a number";
    }

    if (!isRequired(form.database)) {
      newErrors.database = "Database is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createCustomer(form);

      showToast("Customer created successfully 🎉", "success");

      setForm({
        ...initialState,
        startDate: new Date().toISOString(),
      });

    } catch (err) {
      console.error(err);
      showToast("Failed to create customer ❌", "error");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <FormInput
          label="Cusomer Name"
          required
          value={form.custName}
          onChange={(e) => handleChange("custName", e.target.value)}
          error={errors.custName}
        />

        <FormInput
          label="Registration ID"
          required
          value={form.regId}
          onChange={(e) => handleChange("regId", e.target.value)}
          error={errors.regId}
        />

        <FormInput
          label="Mobile No"
          required
          value={form.custMob}
          onChange={(e) => handleChange("custMob", e.target.value)}
          error={errors.custMob}
        />

        <FormInput
          label="Mobile No 2"
          value={form.custMob2}
          onChange={(e) => handleChange("custMob2", e.target.value)}
          error={errors.custMob2}
        />

        <SelectInput
          label="Country"
          required
          value={form.country}
          onChange={(e) => handleChange("country", e.target.value)}
          options={[
            { label: "India", value: "India" },
            { label: "UAE", value: "UAE" },
            { label: "Saudi", value: "Saudi" },
          ]}
        />

        <FormInput
          label="Branch Count"
          required
          value={form.branchCount.toString()}
          onChange={(e) =>
            handleChange("branchCount", Number(e.target.value))
          }
          error={errors.branchCount}
        />

        <FormInput
          label="Block No"
          value={form.block}
          onChange={(e) => handleChange("block", e.target.value)}
        />

        <FormInput
          label="Area / Street"
          value={form.area}
          onChange={(e) => handleChange("area", e.target.value)}
        />

        <FormInput
          label="Road No"
          value={form.road}
          onChange={(e) => handleChange("road", e.target.value)}
        />

        <FormInput
          label="Building No"
          value={form.building}
          onChange={(e) => handleChange("building", e.target.value)}
        />

        <FormInput
          label="Database"
          required
          value={form.database}
          onChange={(e) => handleChange("database", e.target.value)}
          
        />

        <SelectInput
          label="Connection Mode"
          required
          value={form.conMode}
          onChange={(e) => handleChange("conMode", e.target.value)}
          options={[
            { label: "Online", value: "online" },
            { label: "Offline", value: "ofline" },
           
          ]}
        />

      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => setForm(initialState)}>
          Clear
        </Button>

        <Button onClick={handleSubmit}>
          Save
        </Button>
      </div>
    </>
  );
};

export default CustomerForm;