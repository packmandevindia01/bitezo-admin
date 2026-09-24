import { useEffect, useState } from "react";
import { FormInput, Button, SelectInput, Checkbox } from "../../../components/common";
import { MOBILE_PLACEHOLDERS } from "../../../constants/formOptions";
import { isRequired, isValidEmail } from "../../../utils/validators";
import { mapCountry } from "../../../utils/countryMapper";
import { getCountryList } from "../../customer/services/customerApi";
import type { Dealer, DealerFormData } from "../types";
import type { SelectOption } from "../../../constants/formOptions";

interface Props {
  initialData?: Dealer | null;
  onSubmit: (data: DealerFormData) => void | Promise<void>;
  isEdit?: boolean;
}

interface CountryItem {
  countryId: number;
  countryName: string;
}

const initialState: DealerFormData = {
  name: "",
  mobNo: "",
  email: "",
  country: "",
  countryId: 0,
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
  const [countryList, setCountryList] = useState<CountryItem[]>([]);
  const [countryOptions, setCountryOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const list = await getCountryList();
        if (list && list.length > 0) {
          const items: CountryItem[] = list.map((c) => ({
            countryId: c.countryId,
            countryName: c.countryName || "",
          }));
          setCountryList(items);
          setCountryOptions(
            items.map((c) => ({
              label: c.countryName,
              value: String(c.countryId),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load country list", err);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (initialData) {
      let cid = initialData.countryId ?? 0;
      let cname = initialData.country ?? "";

      if (!cid && cname && countryList.length > 0) {
        const found = countryList.find(
          (c) =>
            c.countryName.toLowerCase() === cname.toLowerCase() ||
            c.countryName.toLowerCase().includes(cname.toLowerCase()) ||
            cname.toLowerCase().includes(c.countryName.toLowerCase())
        );
        if (found) {
          cid = found.countryId;
          cname = found.countryName;
        }
      } else if (cid && countryList.length > 0) {
        const found = countryList.find((c) => c.countryId === cid);
        if (found) {
          cname = found.countryName;
        }
      }

      setForm({
        name: initialData.name,
        mobNo: initialData.mobNo,
        email: initialData.email,
        country: cname,
        countryId: cid,
        isActive: initialData.isActive,
        createdDate: initialData.createdDate,
      });
    }
  }, [initialData, countryList]);

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
    }

    if (!isRequired(form.email)) {
      newErrors.email = "Email is required";
    } else if (form.email.includes("@") && !isValidEmail(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (!form.countryId || form.countryId === 0) {
      newErrors.country = "Country is required";
    }

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
          placeholder="Select Country"
          value={form.countryId > 0 ? String(form.countryId) : ""}
          onChange={(e) => {
            const cid = Number(e.target.value) || 0;
            const matched = countryList.find((c) => c.countryId === cid);
            setForm((prev) => ({
              ...prev,
              countryId: cid,
              country: matched ? matched.countryName : "",
            }));
            setErrors((prev) => ({ ...prev, country: "" }));
          }}
          options={countryOptions}
          error={errors.country}
          disabled={submitting}
        />

        <FormInput
          label="Mobile No"
          required
          placeholder={
            form.country
              ? MOBILE_PLACEHOLDERS[mapCountry(form.country)] ?? "+91 9876543210"
              : "Enter mobile number"
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
