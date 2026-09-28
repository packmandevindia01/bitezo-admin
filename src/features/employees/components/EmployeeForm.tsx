import { useEffect, useState, useRef } from "react";
import { User, Building2, Save, RotateCcw, Trash2 } from "lucide-react";
import { FormInput, Button, SelectInput, Checkbox } from "../../../components/common";
import { COUNTRY_OPTIONS } from "../../../constants/formOptions";
import { isRequired, isValidEmail, isValidMobile, sanitizeMobileNumber } from "../../../utils/validators";
import { getCountryName } from "../../../utils/countryMapper";
import { getCountryList } from "../../customer/services/customerApi";
import { getDealerListName } from "../../dealer/services/dealerApi";
import DealerSelect from "./DealerSelect";
import type { Employee, EmployeeFormData } from "../types";
import type { SelectOption } from "../../../constants/formOptions";

interface Props {
  initialData?: Employee | null;
  onSubmit: (data: EmployeeFormData) => void;
  dealerOptions?: SelectOption[];
  onDelete?: () => void;
  onClose?: () => void;
  isEdit?: boolean;
}

const initialState: EmployeeFormData = {
  name: "",
  mobNo: "",
  email: "",
  country: "",
  countryId: 0,
  dealerId: 0,
  isActive: true,
};

const createInitialState = (initialData?: Employee | null): EmployeeFormData => ({
  name: initialData?.name ?? initialState.name,
  mobNo: initialData?.mobNo ?? initialState.mobNo,
  email: initialData?.email ?? initialState.email,
  country: initialData?.country ? getCountryName(initialData.country) : initialState.country,
  countryId: initialData?.countryId ?? 0,
  dealerId: initialData?.dealerId ?? initialState.dealerId,
  isActive: initialData?.isActive ?? initialState.isActive,
  createdDate: initialData?.createdDate,
  modifiedDate: initialData?.modifiedDate,
});

const EmployeeForm = ({
  initialData,
  onSubmit,
  dealerOptions = [],
  onDelete,
  isEdit = false,
}: Props) => {
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState<EmployeeFormData>(() => createInitialState(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});
  const [countryOptions, setCountryOptions] = useState(COUNTRY_OPTIONS);
  const [countryMap, setCountryMap] = useState<Record<string, number>>({});
  const [dealers, setDealers] = useState<SelectOption[]>(dealerOptions);

  // 1. Load Country List & map IDs
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const list = await getCountryList();
        if (list && list.length > 0) {
          const map: Record<string, number> = {};
          const opts = list.map((c) => {
            map[c.countryName.toLowerCase()] = c.countryId;
            return {
              label: c.countryName,
              value: c.countryName,
            };
          });
          setCountryMap(map);
          setCountryOptions(opts);

          // Auto-resolve countryId for current form if needed
          setForm((prev) => {
            if (prev.country && (!prev.countryId || prev.countryId === 0)) {
              const cid = map[prev.country.toLowerCase()] ?? 0;
              return { ...prev, countryId: cid };
            }
            return prev;
          });
        }
      } catch {
        // keep default
      }
    };
    loadCountries();
  }, []);

  // 2. Load Dealer List & ensure options exist
  useEffect(() => {
    if (dealerOptions && dealerOptions.length > 0) {
      setDealers(dealerOptions);
    } else {
      getDealerListName()
        .then((list) => {
          if (list && list.length > 0) {
            setDealers(
              list.map((d) => ({
                label: d.dealerName,
                value: String(d.dealerId),
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [dealerOptions]);

  // 3. Sync initialData on edit mode & resolve missing countryId / dealerId
  useEffect(() => {
    if (initialData) {
      const cname = initialData.country ? getCountryName(initialData.country) : "";
      let cid = initialData.countryId ?? 0;
      if (!cid && cname && Object.keys(countryMap).length > 0) {
        cid = countryMap[cname.toLowerCase()] ?? 0;
      }

      let did = initialData.dealerId ?? 0;
      const dname = (initialData.dealer || "").trim();

      // If dealerId is missing or 0, auto-match by dealer name from options
      if ((!did || did === 0) && dname && dealers.length > 0) {
        const matched = dealers.find(
          (opt) => opt.label.trim().toLowerCase() === dname.toLowerCase()
        );
        if (matched) {
          did = Number(matched.value) || 0;
        }
      }

      setForm({
        name: initialData.name ?? "",
        mobNo: initialData.mobNo ?? "",
        email: initialData.email ?? "",
        country: cname,
        countryId: cid,
        dealerId: did,
        isActive: initialData.isActive ?? true,
        createdDate: initialData.createdDate,
        modifiedDate: initialData.modifiedDate,
      });
      setErrors({});
    }
  }, [initialData, countryMap, dealers]);

  // 4. Auto-resolve dealerId if dealers finish loading after initialData
  useEffect(() => {
    if (dealers.length > 0 && initialData?.dealer) {
      const targetName = initialData.dealer.trim().toLowerCase();
      setForm((prev) => {
        if (!prev.dealerId || prev.dealerId === 0) {
          const match = dealers.find(
            (opt) => opt.label.trim().toLowerCase() === targetName
          );
          if (match) {
            return { ...prev, dealerId: Number(match.value) || 0 };
          }
        }
        return prev;
      });
    }
  }, [dealers, initialData]);

  // 5. Enter Key Navigation across fields
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.getAttribute("type") === "submit") return;

      e.preventDefault();
      const container = formContainerRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), [role="combobox"]:not([disabled]):not([tabindex="-1"]), [data-focusable="true"]:not([disabled])'
        )
      ).filter((el) => {
        if (el.tabIndex === -1) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      const idx = focusable.indexOf(target);
      if (idx >= 0 && idx < focusable.length - 1) {
        focusable[idx + 1].focus();
      } else {
        handleSubmit();
      }
    }
  };

  const handleChange = (
    key: keyof EmployeeFormData,
    value: EmployeeFormData[keyof EmployeeFormData]
  ) => {
    if (key === "country") {
      const countryName = String(value);
      const cid = countryMap[countryName.toLowerCase()] ?? 0;
      setForm((prev) => ({
        ...prev,
        country: countryName,
        countryId: cid,
      }));
    } else if (key === "name") {
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
    setForm({ ...initialState });
    setErrors({});
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

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
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (!isRequired(form.country)) newErrors.country = "Country is required";
    if (!form.dealerId || form.dealerId === 0) newErrors.dealerId = "Dealer is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const finalForm = { ...form };
    if ((!finalForm.countryId || finalForm.countryId === 0) && finalForm.country) {
      finalForm.countryId = countryMap[finalForm.country.toLowerCase()] ?? 0;
    }
    onSubmit(finalForm);
  };

  return (
    <div ref={formContainerRef} onKeyDown={handleKeyDown} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Personal Details */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-[#49293e]/10 text-[#49293e] flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Personal & Contact Info</h3>
              <p className="text-xs text-gray-500">Employee identity and primary contact credentials</p>
            </div>
          </div>

          <FormInput
            label="Full Name"
            required
            autoFocus
            maxLength={20}
            placeholder="e.g. John Doe (max 20)"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
          />

          <SelectInput
            label="Country"
            required
            value={form.country}
            onChange={(e) => handleChange("country", e.target.value)}
            options={countryOptions}
            error={errors.country}
          />

          <FormInput
            label="Mobile Number"
            required
            type="tel"
            inputMode="tel"
            maxLength={16}
            placeholder="e.g. 9876543210 (max 15 digits)"
            value={form.mobNo}
            onChange={(e) => handleChange("mobNo", e.target.value)}
            error={errors.mobNo}
          />

          <FormInput
            label="Email Address"
            required
            type="email"
            maxLength={25}
            placeholder="e.g. user@domain.com (max 25)"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
          />
        </div>

        {/* RIGHT COLUMN: Dealership & Access Settings */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-[#49293e]/10 text-[#49293e] flex items-center justify-center">
                <Building2 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Dealership & Permissions</h3>
                <p className="text-xs text-gray-500">Assign the employee to their operating dealership</p>
              </div>
            </div>

            <DealerSelect
              label="Assigned Dealer"
              required
              placeholder="Select Authorized Dealer"
              value={form.dealerId}
              onChange={(val) => handleChange("dealerId", val)}
              options={dealers}
              error={errors.dealerId}
            />

            {/* Account Status Card */}
            <div className="rounded-xl border border-gray-200 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Employment Status</h4>
                  <p className="text-xs text-gray-500">Enable or suspend employee access to terminal operations</p>
                </div>
                <Checkbox
                  label="Is Active"
                  checked={form.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                />
              </div>
            </div>

            {/* Audit Metadata (Edit Mode) */}
            {isEdit && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-3 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-medium text-gray-700">
                    {form.createdDate ? new Date(form.createdDate).toLocaleDateString() : "-"}
                  </span>
                </div>
                {form.modifiedDate && (
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span className="font-medium text-gray-700">
                      {new Date(form.modifiedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STICKY / BOTTOM ACTION BAR */}
      <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="text-xs text-gray-400">
          <span className="text-red-500 font-bold">*</span> Indicates required fields
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleClear}
            tabIndex={-1}
            className="flex items-center gap-1.5"
          >
            <RotateCcw size={15} />
            Clear
          </Button>

          {isEdit && onDelete && (
            <Button
              variant="danger"
              onClick={onDelete}
              className="flex items-center gap-1.5"
            >
              <Trash2 size={15} />
              Delete
            </Button>
          )}

          <Button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 bg-[#49293e] hover:bg-[#3c2232] text-white shadow-md transition-all"
          >
            <Save size={15} />
            {isEdit ? "Save Changes" : "Create Employee"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
