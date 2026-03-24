import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FormInput,
  Button,
  SelectInput,
  Loader, // ✅ using your loader
} from "../../../components/common";

import { createCustomer } from "../services/customerApi";
import type { CustomerFormData } from "../types";
import { useToast } from "../../../context/ToastContext";
import type { CountryCode } from "libphonenumber-js";

import { validateCustomer } from "../utils/customerValidation";
import { formatPhone } from "../utils/formatters";

const initialState: CustomerFormData = {
  custName: "",
  custMob: "",
  custTel: "",
  country: "IN",
  block: "",
  area: "",
  road: "",
  building: "",
  flatNo: "",
  crNo: "",
  email: "",
  taxRegNo: "",
  branchCount: 0,
  regId: "",
  database: "",
  conMode: "",
  fileName: "",
  filePath: "",
  isDemo: true,
  createdDate: new Date().toISOString(),
};

const CustomerForm = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState<CustomerFormData>({ ...initialState });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerFormData, string>>
  >({});

  const [submitting, setSubmitting] = useState(false); // ✅ loading state

  const handleChange = (key: keyof CustomerFormData, value: any) => {
    if (submitting) return; // ✅ prevent changes while loading
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateCustomer(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      await createCustomer({
        ...form,
        custMob: formatPhone(form.custMob, form.country as CountryCode),
        createdDate: new Date().toISOString(),
      });

      showToast("Customer created successfully 🎉", "success");

      setForm({ ...initialState });

      // ✅ navigate back
      navigate("/dashboard/customers");
    }catch (err: any) {
  console.error(err);

  let message = err.message || "Something went wrong";

  // ✅ show toast
  showToast(message + " ❌", "error");

  // ✅ extract field safely
  if (message.includes("Conflict detected on:")) {
    let field = message.split(":")[1]?.trim();

    // 🔥 normalize (IMPORTANT)
    const normalizedField = field?.toLowerCase();

    const fieldMap: Record<string, keyof CustomerFormData> = {
      "customer name": "custName",
      "email": "email",
      "registration id": "regId",
      "mobile no": "custMob",
      "cr no": "crNo",
    };

    const key = fieldMap[normalizedField];

    console.log("🔍 FIELD:", field);
    console.log("🔍 NORMALIZED:", normalizedField);
    console.log("🔍 KEY:", key);

    if (key) {
      setErrors((prev) => ({
        ...prev,
        [key]: `${field} already exists`,
      }));
    }
  }
} finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 🔥 FULL SCREEN LOADER */}
      {submitting && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Customer Name"
          required
          value={form.custName}
          onChange={(e) => handleChange("custName", e.target.value)}
          error={errors.custName}
          disabled={submitting}
        />

        <FormInput
          label="Registration ID"
          required
          value={form.regId}
          onChange={(e) => handleChange("regId", e.target.value)}
          error={errors.regId}
          disabled={submitting}
        />

        <SelectInput
          label="Country"
          required
          value={form.country}
          onChange={(e) =>
            handleChange("country", e.target.value as CountryCode)
          }
          options={[
            { label: "India", value: "IN" },
            { label: "UAE", value: "AE" },
            { label: "Saudi Arabia", value: "SA" },
          ]}
          disabled={submitting}
        />

        <FormInput
          label="Mobile No"
          required
          placeholder={
            form.country === "IN"
              ? "+91 9876543210"
              : form.country === "AE"
                ? "+971 501234567"
                : "+966 512345678"
          }
          value={form.custMob}
          onChange={(e) => handleChange("custMob", e.target.value)}
          error={errors.custMob}
          disabled={submitting}
        />

        <FormInput
          label="Branch Count"
          required
          value={form.branchCount.toString()}
          onChange={(e) =>
            handleChange("branchCount", Number(e.target.value))
          }
          error={errors.branchCount}
          disabled={submitting}
        />

        <FormInput
          label="Block No"
          value={form.block}
          onChange={(e) => handleChange("block", e.target.value)}
          disabled={submitting}
        />

        <FormInput
          label="Area / Street"
          value={form.area}
          onChange={(e) => handleChange("area", e.target.value)}
          disabled={submitting}
        />

        <FormInput
          label="Road No"
          value={form.road}
          onChange={(e) => handleChange("road", e.target.value)}
          disabled={submitting}
        />

        <FormInput
          label="Building No"
          value={form.building}
          onChange={(e) => handleChange("building", e.target.value)}
          disabled={submitting}
        />

        <FormInput
          label="Database"
          required
          value={form.database}
          onChange={(e) => handleChange("database", e.target.value)}
          error={errors.database}
          disabled={submitting}
        />

        <SelectInput
          label="Connection Mode"
          required
          value={form.conMode}
          onChange={(e) => handleChange("conMode", e.target.value)}
          options={[
            { label: "Online", value: "online" },
            { label: "Offline", value: "offline" },
          ]}
          disabled={submitting}
        />

        <FormInput
          label="Telephone"
          required
          value={form.custTel}
          onChange={(e) => handleChange("custTel", e.target.value)}
          error={errors.custTel}
          disabled={submitting}
        />

        <FormInput
          label="CR No"
          required
          value={form.crNo}
          onChange={(e) => handleChange("crNo", e.target.value)}
          error={errors.crNo}
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

        <FormInput
          label="Tax Reg No"
          value={form.taxRegNo}
          onChange={(e) => handleChange("taxRegNo", e.target.value)}
          disabled={submitting}
        />

        <FormInput
          label="Flat No"
          value={form.flatNo}
          onChange={(e) => handleChange("flatNo", e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => setForm(initialState)}
          disabled={submitting}
        >
          Clear
        </Button>

        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </span>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </>
  );
};

export default CustomerForm;