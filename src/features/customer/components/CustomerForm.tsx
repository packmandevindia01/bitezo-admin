import { useState, useEffect,useRef } from "react";

import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { fetchCustomers } from "../../../store/customerSlice";
import {
  FormInput,
  Button,
  SelectInput,
  Loader, // ✅ using your loader
} from "../../../components/common";

import { createCustomer, updateCustomer, getCustomerById } from "../services/customerApi";
import type { CustomerFormData } from "../types";
import { useToast } from "../../../context/ToastContext";
import type { CountryCode } from "libphonenumber-js";

import { validateCustomer } from "../utils/customerValidation";
import { formatPhone } from "../utils/formatters";
import { getNextRegId } from "../services/customerApi";
import { mapCountry } from "../utils/countryMapper";


const initialState: CustomerFormData = {
  custName: "",
  regId: "",
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
  const dispatch = useDispatch<AppDispatch>();

  const { id } = useParams();
  const isEdit = !!id;


  const [form, setForm] = useState<CustomerFormData>({ ...initialState });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerFormData, string>>
  >({});

  const [submitting, setSubmitting] = useState(false);
  const saveBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (id) {
          // ✅ EDIT MODE
          const customer = await getCustomerById(Number(id));

          setForm({
            ...initialState,
            ...customer,

            country:
              customer.country?.length === 2
                ? (customer.country as CountryCode)
                : mapCountry(customer.country),

            conMode: customer.conMode?.toLowerCase(),
          });
        } else {
          // ✅ CREATE MODE
          const regId = await getNextRegId();

          setForm((prev) => ({
            ...prev,
            regId,
          }));
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load customer ❌", "error");
      }
    };

    init();
  }, [id]);

  const handleChange = (key: keyof CustomerFormData, value: any) => {
    if (submitting) return; // ✅ prevent changes while loading
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

 const handleSubmit = async () => {
  const validationErrors = validateCustomer(form);

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    showToast("Please fill all required fields ❌", "error");
    return;
  }

  setSubmitting(true);

  try {
    if (isEdit) {
      await updateCustomer(Number(id), {
        ...form,
        custId: Number(id),
        custMob: formatPhone(form.custMob?.trim() || "", form.country as CountryCode), // ✅ guarded
      });
      showToast("Customer updated successfully ✏️", "success");
    } else {
      await createCustomer({
        ...form,
        custMob: formatPhone(form.custMob?.trim() || "", form.country as CountryCode), // ✅ guarded
        createdDate: new Date().toISOString(),
      });
      showToast("Customer created successfully 🎉", "success");
    }

    dispatch(fetchCustomers());
    navigate("/dashboard/customers");

  } catch (err: any) {
    console.error(err);

    let message = err.message || "Something went wrong";
    showToast(message + " ❌", "error");

    if (message.includes("Conflict detected on:")) {
      let field = message.split(":")[1]?.trim();
      const normalizedField = field?.toLowerCase();

      let key: keyof CustomerFormData | undefined;

      if (normalizedField.includes("customer")) key = "custName";
      else if (normalizedField.includes("email")) key = "email";
      else if (normalizedField.includes("registration")) key = "regId";
      else if (normalizedField.includes("mobile")) key = "custMob";
      else if (normalizedField.includes("cr")) key = "crNo";
      else if (normalizedField.includes("database")) key = "database";

      if (key) {
        setErrors((prev) => ({ ...prev, [key]: `${field} already exists` }));
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
          autoFocus
          value={form.custName}
          onChange={(e) => handleChange("custName", e.target.value)}
          error={errors.custName}
          disabled={submitting}
          
        />

        {<FormInput
          label="Registration ID"
          value={form.regId || "Loading..."}
          readOnly
          disabled
        />}

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
            { label: "Bahrain", value: "BH" },
            { label: "Oman", value: "OM" },
            { label: "Qatar", value: "QA" },
            { label: "Kuwait", value: "KW" },
            { label: "Singapore", value: "SG" },
            { label: "Malaysia", value: "MY" },
            { label: "Thailand", value: "TH" },
          ]}
          error={errors.country}
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
          error={errors.conMode}
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
          onKeyDown={(e) => {
            // From `Flat No`, move keyboard focus to Save.
            if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
              e.preventDefault();
              saveBtnRef.current?.focus();
            }
          }}
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={async () => {
            if (isEdit) return; // ❌ don't reset edit form

            const regId = await getNextRegId();

            setForm({
              ...initialState,
              regId,
            });
          }}
          disabled={submitting}
        >
          Clear
        </Button>

        <Button ref={saveBtnRef} onClick={handleSubmit} disabled={submitting}>
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