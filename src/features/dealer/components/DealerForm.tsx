import { useEffect, useState, useRef } from "react";
import { FormInput, Button, SelectInput, Checkbox } from "../../../components/common";
import { isRequired, isValidEmail, isValidMobile, sanitizeMobileNumber } from "../../../utils/validators";
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
  const formContainerRef = useRef<HTMLDivElement | null>(null);

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
    if (key === "name") {
      const limited = String(value).slice(0, 20);
      setForm((prev) => ({ ...prev, name: limited }));
    } else if (key === "email") {
      const limited = String(value).slice(0, 25);
      setForm((prev) => ({ ...prev, email: limited }));
    } else if (key === "mobNo") {
      const sanitized = sanitizeMobileNumber(String(value));
      setForm((prev) => ({ ...prev, mobNo: sanitized }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleClear = () => {
    setForm({ ...initialState, createdDate: new Date().toISOString() });
    setErrors({});
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof DealerFormData, string>> = {};

    if (!isRequired(form.name)) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length > 20) {
      newErrors.name = "Name cannot exceed 20 characters";
    }

    if (!isRequired(form.mobNo)) {
      newErrors.mobNo = "Mobile number is required";
    } else if (!isValidMobile(form.mobNo)) {
      newErrors.mobNo = "Invalid mobile number (maximum 15 digits)";
    }

    if (!isRequired(form.email)) {
      newErrors.email = "Email is required";
    } else if (form.email.trim().length > 25) {
      newErrors.email = "Email cannot exceed 25 characters";
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;

    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.tagName === "TEXTAREA") return;

    e.preventDefault();

    const container = formContainerRef.current;
    if (!container) return;

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'input:not([disabled]):not([readonly]):not([type="hidden"]):not([type="checkbox"]), select:not([disabled])'
      )
    ).filter((el) => {
      if (el.tabIndex === -1) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    const currentIndex = focusable.indexOf(target);
    if (currentIndex !== -1 && currentIndex + 1 < focusable.length) {
      focusable[currentIndex + 1].focus();
    } else {
      handleSubmit();
    }
  };

  return (
    <div ref={formContainerRef} onKeyDown={handleKeyDown}>
      <div className="flex flex-col gap-4">
        <FormInput
          id="dealer-name"
          label="Name"
          required
          autoFocus
          maxLength={20}
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          disabled={submitting}
        />

        <SelectInput
          id="dealer-country"
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
          id="dealer-mobno"
          label="Mobile No"
          required
          type="tel"
          inputMode="tel"
          maxLength={16}
          placeholder="e.g. 9876543210 (max 15 digits)"
          value={form.mobNo}
          onChange={(e) => handleChange("mobNo", e.target.value)}
          error={errors.mobNo}
          disabled={submitting}
        />

        <FormInput
          id="dealer-email"
          label="Email"
          required
          type="email"
          maxLength={25}
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
        <Button variant="secondary" onClick={handleClear} disabled={submitting} tabIndex={-1}>
          Clear
        </Button>
        <Button onClick={handleSubmit} disabled={submitting} loading={submitting}>
          {isEdit ? "Save" : "Create"}
        </Button>
      </div>
    </div>
  );
};

export default DealerForm;
