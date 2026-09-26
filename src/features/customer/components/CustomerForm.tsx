import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Building2, Pencil, Plus, Trash2, Tv, Upload, X } from "lucide-react";
import type { AppDispatch } from "../../../store/store";
import { fetchCustomers } from "../../../store/customerSlice";
import {
  Button,
  FormInput,
  Loader,
  Modal,
  SelectInput,
  StatusBadge,
} from "../../../components/common";
import {
  addCustomerBranch,
  addCustomerTerminal,
  createCustomer,
  deleteCustomerBranch,
  deleteCustomerTerminal,
  getCountryList,
  getCustomerById,
  getCustomerBranchList,
  getCustomerTerminalList,
  getNextRegId,
  updateCustomer,
  updateCustomerBranch,
  type CountryOption,
} from "../services/customerApi";
import type { BranchListItem, CustomerFormData, TerminalItem } from "../types";
import { useToast } from "../../../context/ToastContext";
import { validateCustomer } from "../utils/customerValidation";
import { formatPhone } from "../utils/formatters";
import { sendOtpApi, verifyOtpApi } from "../../auth/services/authApi";
import OtpForm from "../../auth/components/OtpForm";
import { getCountryName, mapCountry } from "../../../utils/countryMapper";
import { ensurePhonePrefix, syncPhonePrefix } from "../../../utils/phonePrefix";
import {
  COUNTRY_OPTIONS,
  MOBILE_PLACEHOLDERS,
} from "../../../constants/formOptions";
import { isValidEmail } from "../../../utils/validators";
import { getDealerListName } from "../../dealer/services/dealerApi";
import { getEmployeeListNameByDealer } from "../../employees/services/employeeApi";

interface SelectOption {
  label: string;
  value: string;
}

interface CustomerFormProps {
  mode?: "dashboard" | "onboarding";
  initialEmail?: string;
  initialOtpToken?: string;
}

const initialState: CustomerFormData = {
  custName: "",
  regId: "",
  custMob: "+91 ",
  custTel: "",
  country: "India",
  countryId: 1,
  block: "",
  area: "",
  road: "",
  building: "",
  flatNo: "",
  crNo: "",
  email: "",
  taxRegNo: "",
  branchCount: 1,
  database: "",
  conMode: "",
  fileName: "",
  filePath: "",
  isDemo: true,
  dealerId: 0,
  empId: 0,
  createdDate: new Date().toISOString(),
  branchLists: [
    {
      branchDescription: "Main Branch",
      terminalCount: 1,
    },
  ],
};

const syncBranchLists = (count: number, currentList: BranchListItem[]): BranchListItem[] => {
  const targetCount = Math.max(1, count);
  const result = [...currentList];
  if (result.length < targetCount) {
    for (let i = result.length; i < targetCount; i++) {
      result.push({
        branchDescription: i === 0 ? "Main Branch" : `Branch ${i + 1}`,
        terminalCount: 1,
      });
    }
  } else if (result.length > targetCount) {
    return result.slice(0, targetCount);
  }
  return result;
};

const CustomerForm = ({
  mode = "dashboard",
  initialEmail = "",
  initialOtpToken = "",
}: CustomerFormProps) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams();
  const isEdit = !!id;
  const isOnboarding = mode === "onboarding";

  const [form, setForm] = useState<CustomerFormData>({ ...initialState });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerFormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [dealerOptions, setDealerOptions] = useState<SelectOption[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([]);
  const [countryList, setCountryList] = useState<CountryOption[]>([]);
  const [countrySelectOptions, setCountrySelectOptions] = useState<SelectOption[]>(COUNTRY_OPTIONS);
  
  // Branch configuration modal state
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchListError, setBranchListError] = useState("");

  // Terminal list modal state
  const [terminalModalState, setTerminalModalState] = useState<{
    open: boolean;
    branchId: number;
    branchName: string;
    loading: boolean;
    adding: boolean;
    terminals: TerminalItem[];
  }>({ open: false, branchId: 0, branchName: "", loading: false, adding: false, terminals: [] });

  // Delete terminal confirmation modal state
  const [deleteTerminalState, setDeleteTerminalState] = useState<{
    open: boolean;
    terminalId: number;
    terminalName: string;
    branchId: number;
    deleting: boolean;
  }>({ open: false, terminalId: 0, terminalName: "", branchId: 0, deleting: false });

  // Add additional branch modal state (Edit mode)
  const [addBranchModalOpen, setAddBranchModalOpen] = useState(false);
  const [newBranchData, setNewBranchData] = useState({ description: "", terminalCount: 1 });
  const [addingBranch, setAddingBranch] = useState(false);
  const [addBranchError, setAddBranchError] = useState("");

  // Edit branch description modal state (Edit mode)
  const [editBranchModalOpen, setEditBranchModalOpen] = useState(false);
  const [editingBranchData, setEditingBranchData] = useState<{ branchId: number; description: string }>({ branchId: 0, description: "" });
  const [updatingBranch, setUpdatingBranch] = useState(false);
  const [editBranchError, setEditBranchError] = useState("");

  // Delete branch confirmation modal state (Edit mode)
  const [deleteBranchState, setDeleteBranchState] = useState<{
    open: boolean;
    branchId: number;
    description: string;
    deleting: boolean;
  }>({ open: false, branchId: 0, description: "", deleting: false });

  // OTP verification state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpVerifiedEmail, setOtpVerifiedEmail] = useState("");
  const [otpPendingEmail, setOtpPendingEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpFormResetKey, setOtpFormResetKey] = useState(0);
  const saveBtnRef = useRef<HTMLButtonElement | null>(null);

  // ── Universal Enter-key navigation across all form controls ───────────────
  const formContainerRef = useRef<HTMLDivElement | null>(null);

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;

    const target = e.target as HTMLElement;

    // Do not interfere if user is on a button, textarea, or within an open modal
    if (
      target.tagName === "BUTTON" ||
      target.tagName === "TEXTAREA" ||
      target.closest('[role="dialog"]')
    ) {
      return;
    }

    e.preventDefault();

    const container = formContainerRef.current;
    if (!container) return;

    // Collect all interactive, visible inputs and select dropdowns in DOM order
    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'input:not([disabled]):not([readonly]):not([type="hidden"]), select:not([disabled]):not([readonly])'
      )
    ).filter((el) => el.offsetParent !== null);

    const currentIndex = elements.indexOf(target);
    if (currentIndex !== -1 && currentIndex + 1 < elements.length) {
      elements[currentIndex + 1].focus();
    } else {
      saveBtnRef.current?.focus();
    }
  };

  const hasDealerOptions = dealerOptions.length > 0;
  const disableSave = submitting || (!isEdit && !hasDealerOptions);
  const normalizedEmail = form.email.trim().toLowerCase();
  const normalizedOriginalEmail = originalEmail.trim().toLowerCase();
  const normalizedInitialEmail = initialEmail.trim().toLowerCase();
  const hasEmailChanged = isEdit && normalizedEmail !== normalizedOriginalEmail;
  const hasOnboardingVerification =
    isOnboarding &&
    Boolean(initialOtpToken) &&
    Boolean(normalizedInitialEmail) &&
    normalizedEmail === normalizedInitialEmail;
  const requiresEmailVerification = isOnboarding
    ? !hasOnboardingVerification
    : !isEdit || hasEmailChanged;
  const isEmailVerified = isOnboarding
    ? hasOnboardingVerification ||
      (Boolean(otpToken) && otpVerifiedEmail === normalizedEmail)
    : !requiresEmailVerification ||
      (Boolean(otpToken) && otpVerifiedEmail === normalizedEmail);

  // ESC key and body scroll lock for branch modal
  useEffect(() => {
    if (!branchModalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBranchModalOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [branchModalOpen]);

  // Load dealers & country list
  useEffect(() => {
    const loadDealers = async () => {
      try {
        const dealers = await getDealerListName();
        setDealerOptions(
          dealers.map((dealer) => ({
            label: dealer.dealerName,
            value: String(dealer.dealerId),
          }))
        );
      } catch (err) {
        console.error(err);
        showToast("Failed to load dealers", "error");
        setDealerOptions([]);
      }
    };

    const loadCountries = async () => {
      try {
        const countries = await getCountryList();
        if (countries && countries.length > 0) {
          setCountryList(countries);
          setCountrySelectOptions(
            countries.map((c) => ({
              label: c.countryName,
              value: c.countryName,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load country list", err);
      }
    };

    loadDealers();
    loadCountries();
  }, []);

  useEffect(() => {
    if (!isOnboarding) return;

    if (normalizedInitialEmail) {
      setForm((prev) => ({
        ...prev,
        email: normalizedInitialEmail,
      }));
      setOtpVerifiedEmail(normalizedInitialEmail);
      setOtpPendingEmail(normalizedInitialEmail);
    }

    if (initialOtpToken) {
      setOtpToken(initialOtpToken);
    }
  }, [initialOtpToken, isOnboarding, normalizedInitialEmail]);

  const loadEmployeeList = async (dealerId: number) => {
    if (!dealerId) {
      setEmployeeOptions([]);
      return;
    }
    try {
      const employees = await getEmployeeListNameByDealer(dealerId);
      setEmployeeOptions(
        employees.map((emp) => ({
          label: emp.name,
          value: String(emp.empId),
        }))
      );
    } catch (err) {
      console.error("Failed to load employee list", err);
      setEmployeeOptions([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (id) {
          const [customer, branches] = await Promise.all([
            getCustomerById(Number(id)),
            getCustomerBranchList(Number(id)).catch(() => []),
          ]);
          if (customer.dealerId) {
            loadEmployeeList(customer.dealerId);
          }
          const resolvedCountry = getCountryName(customer.country);
          const matchedCountryId =
            customer.countryId ??
            countryList.find(
              (c) => c.countryName.toLowerCase() === resolvedCountry.toLowerCase()
            )?.countryId ??
            initialState.countryId;

          const loadedBranches =
            branches && branches.length > 0
              ? branches
              : customer.branchLists && customer.branchLists.length > 0
                ? customer.branchLists
                : syncBranchLists(customer.branchCount || 1, []);

          setForm({
            ...initialState,
            ...customer,
            country: resolvedCountry,
            countryId: matchedCountryId,
            custMob: ensurePhonePrefix(
              customer.custMob ?? "",
              mapCountry(resolvedCountry)
            ),
            conMode: customer.conMode?.toLowerCase() ?? "",
            createdDate: customer.createdDate ?? initialState.createdDate,
            isDemo:
              typeof customer.isDemo === "string"
                ? customer.isDemo.toLowerCase() === "demo" ||
                  customer.isDemo.toLowerCase() === "true"
                : Boolean(customer.isDemo),
            branchCount: loadedBranches.length,
            branchLists: loadedBranches,
          });
          setOriginalEmail((customer.email ?? "").trim().toLowerCase());
        } else {
          const rawRegId = await getNextRegId();
          const regId = typeof rawRegId === "string" ? rawRegId : (rawRegId as any)?.regId ?? (rawRegId as any)?.data ?? String(rawRegId ?? "");
          setForm((prev) => ({ ...prev, regId }));
          setOriginalEmail("");
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load customer", "error");
      }
    };

    init();
  }, [id, countryList]);

  const resetOtpVerification = () => {
    setOtpError("");
    setOtpToken("");
    setOtpVerifiedEmail("");
    setOtpPendingEmail("");
    setOtpModalOpen(false);
    setOtpFormResetKey((prev) => prev + 1);
  };

  const openOtpVerification = (message?: string) => {
    if (!normalizedEmail) return;
    setOtpError(message ?? "");
    setOtpModalOpen(true);
    setOtpFormResetKey((prev) => prev + 1);
  };

  const isVerificationIssue = (message: string) => {
    const normalizedMessage = message.toLowerCase();
    return (
      (normalizedMessage.includes("email") &&
        normalizedMessage.includes("verif")) ||
      normalizedMessage.includes("otp") ||
      normalizedMessage.includes("otp-token") ||
      normalizedMessage.includes("otp token")
    );
  };

  const resolveErrorMessage = (err: unknown, fallback: string) => {
    if (isAxiosError(err)) {
      const data = err.response?.data;

      if (typeof data === "string" && data.trim()) {
        return data.trim();
      }

      if (data && typeof data === "object") {
        if ("message" in data && typeof data.message === "string" && data.message.trim()) {
          return data.message.trim();
        }

        if ("title" in data && typeof data.title === "string" && data.title.trim()) {
          return data.title.trim();
        }

        if ("errors" in data && data.errors && typeof data.errors === "object") {
          const firstFieldError = Object.values(data.errors as Record<string, unknown>)
            .flatMap((value) => (Array.isArray(value) ? value : [value]))
            .find((value): value is string => typeof value === "string" && value.trim().length > 0);

          if (firstFieldError) {
            return firstFieldError.trim();
          }
        }
      }
    }

    return err instanceof Error && err.message ? err.message : fallback;
  };

  const applyFieldErrorFromMessage = (message: string) => {
    const normalizedMessage = message.toLowerCase();
    let key: keyof CustomerFormData | undefined;
    let fieldLabel = "";

    if (message.includes("Conflict detected on:")) {
      fieldLabel = message.split(":")[1]?.trim() ?? "";
      const normalizedField = fieldLabel.toLowerCase();

      if (normalizedField.includes("customer")) key = "custName";
      else if (normalizedField.includes("email")) key = "email";
      else if (normalizedField.includes("registration")) key = "regId";
      else if (normalizedField.includes("mobile")) key = "custMob";
      else if (normalizedField.includes("cr")) key = "crNo";
      else if (normalizedField.includes("database")) key = "database";

      if (key) {
        const fieldKey: keyof CustomerFormData = key;
        setErrors((prev) => ({ ...prev, [fieldKey]: `${fieldLabel} already exists` }));
      }

      return;
    }

    if (normalizedMessage.includes("email")) {
      key = "email";
      fieldLabel = "Email";
    } else if (normalizedMessage.includes("registration") || normalizedMessage.includes("reg id")) {
      key = "regId";
      fieldLabel = "Registration ID";
    } else if (normalizedMessage.includes("mobile")) {
      key = "custMob";
      fieldLabel = "Mobile number";
    } else if (normalizedMessage.includes("customer")) {
      key = "custName";
      fieldLabel = "Customer name";
    } else if (normalizedMessage.includes("cr")) {
      key = "crNo";
      fieldLabel = "CR number";
    } else if (normalizedMessage.includes("database")) {
      key = "database";
      fieldLabel = "Database";
    }

    if (!key) return;
    const fieldKey: keyof CustomerFormData = key;

    const alreadyExists =
      normalizedMessage.includes("already exists") ||
      normalizedMessage.includes("duplicate") ||
      normalizedMessage.includes("exists");

    setErrors((prev) => ({
      ...prev,
      [fieldKey]: alreadyExists ? `${fieldLabel} already exists` : message,
    }));
  };

  const handleChange = (
    key: keyof CustomerFormData,
    value: CustomerFormData[keyof CustomerFormData]
  ) => {
    if (submitting) return;

    if (key === "email") {
      const nextEmail = String(value).trim().toLowerCase();
      if (
        nextEmail !== normalizedEmail &&
        (otpToken || otpVerifiedEmail || otpPendingEmail || otpModalOpen)
      ) {
        resetOtpVerification();
      }
    }

    setForm((prev) => {
      if (key === "country") {
        const nextCountry = String(value);
        const matched = countryList.find(
          (c) => c.countryName.toLowerCase() === nextCountry.toLowerCase()
        );
        return {
          ...prev,
          country: nextCountry,
          countryId: matched ? matched.countryId : prev.countryId,
          custMob: syncPhonePrefix(
            prev.custMob,
            mapCountry(prev.country),
            mapCountry(nextCountry)
          ),
        };
      }

      if (key === "custMob") {
        return {
          ...prev,
          custMob: ensurePhonePrefix(String(value), mapCountry(prev.country)),
        };
      }

      if (key === "branchCount") {
        const cnt = Math.max(1, Number(value) || 1);
        const updatedLists = syncBranchLists(cnt, prev.branchLists || []);
        return {
          ...prev,
          branchCount: cnt,
          branchLists: updatedLists,
        };
      }

      return {
        ...prev,
        [key]: value,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const buildPayload = (): CustomerFormData => {
    const matchedCountry = countryList.find(
      (c) => c.countryName.toLowerCase() === form.country.toLowerCase()
    );
    const resolvedCountryId = form.countryId || matchedCountry?.countryId || 1;

    return {
      ...form,
      country: getCountryName(form.country),
      countryId: Number(resolvedCountryId),
      custMob: formatPhone(form.custMob?.trim() || "", mapCountry(form.country)),
      email: normalizedEmail,
      branchCount: form.branchLists.length,
      branchLists: form.branchLists.map((b, idx) => ({
        branchDescription: b.branchDescription.trim() || `Branch ${idx + 1}`,
        terminalCount: Number(b.terminalCount || 0),
      })),
    };
  };

  const sendCustomerOtp = async (isResend = false) => {
    const targetEmail = normalizedEmail;

    if (!targetEmail) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      showToast("Enter an email address first", "error");
      return;
    }

    if (!isValidEmail(targetEmail)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email" }));
      showToast("Enter a valid email address first", "error");
      return;
    }

    if (isResend) {
      setResendingOtp(true);
    } else {
      setSendingOtp(true);
    }

    try {
      await sendOtpApi(targetEmail);
      setOtpError("");
      setOtpToken("");
      setOtpVerifiedEmail("");
      setOtpPendingEmail(targetEmail);
      setOtpModalOpen(true);
      setOtpFormResetKey((prev) => prev + 1);
      showToast(
        isResend ? "OTP resent successfully" : "OTP sent to email successfully",
        "success"
      );
    } catch (err) {
      showToast(
        resolveErrorMessage(err, "Failed to send OTP"),
        "error"
      );
    } finally {
      if (isResend) {
        setResendingOtp(false);
      } else {
        setSendingOtp(false);
      }
    }
  };

  const verifyCustomerEmail = async (otpValue: string) => {
    const targetEmail = otpPendingEmail || normalizedEmail;

    if (!targetEmail) {
      setOtpError("Email is required");
      return;
    }

    setVerifyingOtp(true);
    setOtpError("");

    try {
      const token = await verifyOtpApi(targetEmail, otpValue.trim());

      if (!token) {
        throw new Error("OTP verified, but no OTP token was returned");
      }

      // Set token and close modal first
      setOtpToken(token);
      setOtpVerifiedEmail(targetEmail);
      setOtpPendingEmail(targetEmail);
      setOtpModalOpen(false);
      showToast("Email verified successfully", "success");

      // ── Auto-proceed to save immediately after OTP verification ──
      // Build a fresh payload using current form state and submit directly.
      // This avoids the user needing to click Save a second time.
      const matchedCountry = countryList.find(
        (c) => c.countryName.toLowerCase() === form.country.toLowerCase()
      );
      const resolvedCountryId = form.countryId || matchedCountry?.countryId || 1;
      const autoPayload: CustomerFormData = {
        ...form,
        countryId: Number(resolvedCountryId),
        email: targetEmail,
        branchCount: form.branchLists.length,
        branchLists: form.branchLists.map((b, idx) => ({
          branchDescription: b.branchDescription.trim() || `Branch ${idx + 1}`,
          terminalCount: Number(b.terminalCount || 0),
        })),
      };

      setSubmitting(true);
      try {
        if (isEdit) {
          await updateCustomer(
            Number(id),
            { ...autoPayload, custId: Number(id) },
            token
          );
          showToast("Customer updated successfully", "success");
          dispatch(fetchCustomers());
          navigate("/dashboard/customers");
        } else {
          await createCustomerRecord(autoPayload, token);
        }
      } catch (saveErr: unknown) {
        if (isAxiosError(saveErr)) {
          console.error("Auto-save after OTP failed", {
            status: saveErr.response?.status,
            data: saveErr.response?.data,
          });
        }
        const msg = resolveErrorMessage(saveErr, "Save failed after email verification");
        showToast(msg, "error");
        applyFieldErrorFromMessage(msg);
      } finally {
        setSubmitting(false);
      }

    } catch (err) {
      const message = resolveErrorMessage(err, "Failed to verify OTP");
      setOtpError(message);
      showToast(message, "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleAddAdditionalBranch = async () => {
    const desc = newBranchData.description.trim();
    if (!desc) {
      setAddBranchError("Branch description is required");
      return;
    }
    if (form.branchLists.some((b) => b.branchDescription.toLowerCase() === desc.toLowerCase())) {
      setAddBranchError(`Branch description "${desc}" already exists for this customer.`);
      return;
    }

    setAddingBranch(true);
    setAddBranchError("");
    try {
      await addCustomerBranch({
        customerId: Number(id),
        description: desc,
        terminalCount: Number(newBranchData.terminalCount),
      });
      showToast("Branch added successfully", "success");
      setAddBranchModalOpen(false);
      setNewBranchData({ description: "", terminalCount: 1 });

      const updatedBranches = await getCustomerBranchList(Number(id));
      setForm((prev) => ({
        ...prev,
        branchCount: updatedBranches.length,
        branchLists: updatedBranches,
      }));
    } catch (err) {
      console.error(err);
      const msg = resolveErrorMessage(err, "Failed to add branch");
      setAddBranchError(msg);
      showToast(msg, "error");
    } finally {
      setAddingBranch(false);
    }
  };

  const handleUpdateBranch = async () => {
    const desc = editingBranchData.description.trim();
    if (!desc) {
      setEditBranchError("Branch description is required");
      return;
    }
    if (form.branchLists.some((b) => b.branchId !== editingBranchData.branchId && b.branchDescription.toLowerCase() === desc.toLowerCase())) {
      setEditBranchError(`Branch description "${desc}" already exists for this customer.`);
      return;
    }

    setUpdatingBranch(true);
    setEditBranchError("");
    try {
      await updateCustomerBranch({
        branchId: editingBranchData.branchId,
        description: desc,
      });
      showToast("Branch description updated successfully", "success");
      setEditBranchModalOpen(false);
      setEditingBranchData({ branchId: 0, description: "" });

      const updatedBranches = await getCustomerBranchList(Number(id));
      setForm((prev) => ({
        ...prev,
        branchCount: updatedBranches.length,
        branchLists: updatedBranches,
      }));
    } catch (err) {
      console.error(err);
      const msg = resolveErrorMessage(err, "Failed to update branch");
      setEditBranchError(msg);
      showToast(msg, "error");
    } finally {
      setUpdatingBranch(false);
    }
  };

  const handleConfirmDeleteBranch = async () => {
    if (!deleteBranchState.branchId) return;

    setDeleteBranchState((prev) => ({ ...prev, deleting: true }));
    try {
      await deleteCustomerBranch({
        branchId: deleteBranchState.branchId,
        customerId: Number(id),
      });
      showToast("Branch deleted successfully", "success");
      setDeleteBranchState({ open: false, branchId: 0, description: "", deleting: false });

      const updatedBranches = await getCustomerBranchList(Number(id));
      setForm((prev) => ({
        ...prev,
        branchCount: updatedBranches.length,
        branchLists: updatedBranches,
      }));
    } catch (err) {
      console.error(err);
      const msg = resolveErrorMessage(err, "Failed to delete branch");
      showToast(msg, "error");
      setDeleteBranchState((prev) => ({ ...prev, deleting: false }));
    }
  };

  const handleAddTerminal = async () => {
    if (!terminalModalState.branchId) return;

    setTerminalModalState((prev) => ({ ...prev, adding: true }));
    try {
      await addCustomerTerminal({
        branchId: terminalModalState.branchId,
        customerId: Number(id),
      });
      showToast("Terminal added successfully", "success");

      const updatedTerminals = await getCustomerTerminalList(terminalModalState.branchId);
      setTerminalModalState((prev) => ({
        ...prev,
        adding: false,
        terminals: updatedTerminals,
      }));

      const updatedBranches = await getCustomerBranchList(Number(id));
      setForm((prev) => ({
        ...prev,
        branchCount: updatedBranches.length,
        branchLists: updatedBranches,
      }));
    } catch (err) {
      console.error(err);
      const msg = resolveErrorMessage(err, "Failed to add terminal");
      showToast(msg, "error");
      setTerminalModalState((prev) => ({ ...prev, adding: false }));
    }
  };

  const handleConfirmDeleteTerminal = async () => {
    if (!deleteTerminalState.terminalId || !deleteTerminalState.branchId) return;

    setDeleteTerminalState((prev) => ({ ...prev, deleting: true }));
    try {
      await deleteCustomerTerminal({
        terminalId: deleteTerminalState.terminalId,
        branchId: deleteTerminalState.branchId,
      });
      showToast("Terminal deleted successfully", "success");
      setDeleteTerminalState({ open: false, terminalId: 0, terminalName: "", branchId: 0, deleting: false });

      if (terminalModalState.open && terminalModalState.branchId === deleteTerminalState.branchId) {
        const updatedTerminals = await getCustomerTerminalList(deleteTerminalState.branchId);
        setTerminalModalState((prev) => ({ ...prev, terminals: updatedTerminals }));
      }

      const updatedBranches = await getCustomerBranchList(Number(id));
      setForm((prev) => ({
        ...prev,
        branchCount: updatedBranches.length,
        branchLists: updatedBranches,
      }));
    } catch (err) {
      console.error(err);
      const msg = resolveErrorMessage(err, "Failed to delete terminal");
      showToast(msg, "error");
      setDeleteTerminalState((prev) => ({ ...prev, deleting: false }));
    }
  };

  const createCustomerRecord = async (
    payload: CustomerFormData,
    verifiedOtpToken: string
  ) => {
    await createCustomer({
      ...payload,
      createdDate: new Date().toISOString(),
    }, verifiedOtpToken);
    showToast(
      isOnboarding ? "Company created successfully" : "Customer created successfully",
      "success"
    );

    if (isOnboarding) {
      navigate("/", {
        replace: true,
        state: {
          onboardingComplete: true,
          onboardingEmail: payload.email,
        },
      });
      return;
    }

    dispatch(fetchCustomers());
    navigate("/dashboard/customers");
  };

  const handleSubmit = async () => {
    const validationErrors = validateCustomer(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Please fill all required fields properly", "error");
      if (validationErrors.branchCount) {
        setBranchListError(validationErrors.branchCount);
        setBranchModalOpen(true);
      }
      return;
    }

    if (!isEdit && !isEmailVerified) {
      setErrors((prev) => ({
        ...prev,
        email: "Verify the email address before saving",
      }));
      await sendCustomerOtp();
      return;
    }

    if (isEdit && hasEmailChanged && !isEmailVerified) {
      setErrors((prev) => ({
        ...prev,
        email: "Verify the new email address before updating",
      }));
      await sendCustomerOtp();
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPayload();

      if (isEdit) {
        await updateCustomer(Number(id), {
          ...payload,
          custId: Number(id),
        }, hasEmailChanged ? otpToken : undefined);
        showToast("Customer updated successfully", "success");
        dispatch(fetchCustomers());
        navigate("/dashboard/customers");
      } else {
        await createCustomerRecord(payload, otpToken);
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        console.error("Customer operation failed", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
      } else {
        console.error(err);
      }

      const message = resolveErrorMessage(err, "Something went wrong");
      showToast(message, "error");
      applyFieldErrorFromMessage(message);
      if (isVerificationIssue(message)) {
        setErrors((prev) => ({
          ...prev,
          email: hasEmailChanged
            ? "Verify the new email address before updating"
            : message,
        }));
        openOtpVerification(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Loader />
        </div>
      )}

      <div ref={formContainerRef} onKeyDown={handleFormKeyDown} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-2">
        <FormInput
          label="Customer Name"
          required
          autoFocus
          value={form.custName}
          onChange={(e) => handleChange("custName", e.target.value)}
          error={errors.custName}
          disabled={submitting}
        />

        <FormInput
          label="Registration ID"
          value={
            typeof form.regId === "string"
              ? form.regId || "Loading..."
              : (form.regId as any)?.regId ?? (form.regId as any)?.data ?? "Loading..."
          }
          readOnly
          disabled
        />

        <div>
          <FormInput
            label="Email"
            required
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
            disabled={submitting || isOnboarding}
            readOnly={isOnboarding}
          />
          {/* Status indicator only — OTP is triggered automatically when Save is clicked */}
          {requiresEmailVerification && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`text-sm ${
                  isEmailVerified ? "text-green-700" : "text-amber-700"
                }`}
              >
                {isEmailVerified
                  ? "✓ Email verified"
                  : "Email verification required — click Save to verify"}
              </span>
            </div>
          )}
        </div>

        <SelectInput
          label="Country"
          required
          value={form.country}
          onChange={(e) => handleChange("country", e.target.value)}
          options={countrySelectOptions}
          error={errors.country}
          disabled={submitting}
        />

        <FormInput
          label="Mobile No"
          required
          placeholder={MOBILE_PLACEHOLDERS[mapCountry(form.country)] ?? "+91 9876543210"}
          value={form.custMob}
          onChange={(e) => handleChange("custMob", e.target.value)}
          error={errors.custMob}
          disabled={submitting}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Branch Count <span className="text-red-500 ml-1">*</span>
            </label>
            <button
              type="button"
              className="text-xs text-[#49293e] font-semibold hover:underline flex items-center gap-1 bg-[#49293e]/10 px-2 py-0.5 rounded"
              onClick={() => {
                setBranchListError("");
                setBranchModalOpen(true);
              }}
            >
              <Building2 size={13} />
              {isEdit ? "View Branches" : "Setup Branches"} ({form.branchLists?.length || form.branchCount || 1})
            </button>
          </div>
          <FormInput
            label=""
            required
            type="number"
            min="1"
            className="text-right"
            value={form.branchCount.toString()}
            onChange={(e) => {
              if (isEdit) return;
              const cnt = Math.max(1, parseInt(e.target.value, 10) || 1);
              handleChange("branchCount", cnt);
              setBranchListError("");
              setBranchModalOpen(true);
            }}
            error={errors.branchCount}
            disabled={submitting || isEdit}
            readOnly={isEdit}
          />
        </div>

        <div className="space-y-2">
          <SelectInput
            label="Dealer"
            required
            value={form.dealerId ? String(form.dealerId) : ""}
            onChange={(e) => {
              const selectedDealerId = Number(e.target.value);
              handleChange("dealerId", selectedDealerId);
              handleChange("empId", 0);
              loadEmployeeList(selectedDealerId);
            }}
            options={dealerOptions}
            error={errors.dealerId}
            disabled={submitting}
            placeholder="Select dealer"
          />
          {!hasDealerOptions && !isEdit && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No dealers available. Create a dealer first.
            </div>
          )}
        </div>

        <div className="space-y-2">
          <SelectInput
            label="Employee"
            required
            value={form.empId ? String(form.empId) : ""}
            onChange={(e) => handleChange("empId", Number(e.target.value))}
            options={employeeOptions}
            error={errors.empId}
            disabled={submitting || !form.dealerId}
            placeholder={form.dealerId ? "Select employee" : "Select dealer first"}
          />
          {form.dealerId > 0 && employeeOptions.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No employees found for this dealer.
            </div>
          )}
        </div>

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

        <FormInput
          label="File Name"
          value={form.fileName ?? ""}
          onChange={(e) => handleChange("fileName", e.target.value)}
          disabled={submitting}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs md:text-sm font-medium text-gray-700">
              File Path
            </label>
            <label className="text-xs text-[#49293e] font-semibold hover:underline flex items-center gap-1 cursor-pointer bg-[#49293e]/10 px-2 py-0.5 rounded">
              <input
                type="file"
                className="sr-only"
                disabled={submitting}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  handleChange("fileName", file.name);
                  handleChange("filePath", file.name);
                }}
              />
              <Upload size={12} /> Browse
            </label>
          </div>
          <FormInput
            label=""
            value={form.filePath ?? ""}
            onChange={(e) => handleChange("filePath", e.target.value)}
            disabled={submitting}
            placeholder="e.g. C:\uploads\logo.png or browse"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="secondary"
          tabIndex={-1}
          onClick={async () => {
            if (isEdit) return;

            const rawRegId = await getNextRegId();
            const regId = typeof rawRegId === "string" ? rawRegId : (rawRegId as any)?.regId ?? (rawRegId as any)?.data ?? String(rawRegId ?? "");
            if (!isOnboarding) {
              resetOtpVerification();
            }
            setForm({
              ...initialState,
              regId,
              email: isOnboarding ? normalizedInitialEmail : initialState.email,
              custMob: ensurePhonePrefix(
                initialState.custMob,
                mapCountry(initialState.country)
              ),
            });
            setOriginalEmail("");
            setBranchListError("");
            if (isOnboarding) {
              setOtpToken(initialOtpToken);
              setOtpVerifiedEmail(normalizedInitialEmail);
              setOtpPendingEmail(normalizedInitialEmail);
            }
          }}
          disabled={submitting}
        >
          Clear
        </Button>

        <Button ref={saveBtnRef} onClick={handleSubmit} disabled={disableSave}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </span>
          ) : !isEdit && !hasDealerOptions ? (
            "Create dealer first"
          ) : (
            "Save"
          )}
        </Button>
      </div>

      {/* ── Branch Configuration Modal (Large & Fully Responsive) ─────────── */}
      {branchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setBranchModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-[fadeIn_0.2s_ease-in-out]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#49293e]/10 text-[#49293e] shadow-sm">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {isEdit ? "View Branch List & Terminals" : "Configure Branch List & Terminals"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {isEdit ? (
                      <>Branch list configured for this customer ({form.branchCount} total)</>
                    ) : (
                      <>Configure details for <span className="font-semibold text-gray-900">{form.branchCount}</span> {form.branchCount === 1 ? 'branch' : 'branches'}. Each description must be unique.</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                {isEdit ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setAddBranchError("");
                      setNewBranchData({
                        description: `Branch ${form.branchLists.length + 1}`,
                        terminalCount: 1,
                      });
                      setAddBranchModalOpen(true);
                    }}
                  >
                    <Plus size={15} className="mr-1 inline" /> Add Branch
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      const nextCount = form.branchLists.length + 1;
                      const updated = [
                        ...form.branchLists,
                        { branchDescription: `Branch ${nextCount}`, terminalCount: 1 }
                      ];
                      setForm((prev) => ({
                        ...prev,
                        branchCount: nextCount,
                        branchLists: updated,
                      }));
                      setBranchListError("");
                    }}
                  >
                    <Plus size={15} className="mr-1 inline" /> Add Branch
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => setBranchModalOpen(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  title="Close (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {branchListError && (
              <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-600 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-200 text-red-700 text-xs">!</span>
                <span>{branchListError}</span>
              </div>
            )}

            {/* Branch Cards List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 max-h-[58vh]">
              {form.branchLists.map((branch, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-white p-4 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#49293e]/10 text-xs font-bold text-[#49293e] shadow-inner">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="flex-1">
                    <FormInput
                      label={`Branch ${idx + 1} Description`}
                      required
                      placeholder="e.g. Main Branch, Downtown Branch"
                      value={branch.branchDescription}
                      disabled={isEdit || submitting}
                      readOnly={isEdit}
                      onChange={(e) => {
                        if (isEdit) return;
                        const newDesc = e.target.value;
                        const updated = [...form.branchLists];
                        updated[idx] = { ...updated[idx], branchDescription: newDesc };
                        setForm((prev) => ({ ...prev, branchLists: updated }));
                        setBranchListError("");
                      }}
                    />
                  </div>

                  <div className="w-full sm:w-44">
                    <FormInput
                      label="Terminals"
                      required
                      type="number"
                      min="0"
                      className="text-right"
                      value={branch.terminalCount.toString()}
                      disabled={isEdit || submitting}
                      readOnly={isEdit}
                      onChange={(e) => {
                        if (isEdit) return;
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        const updated = [...form.branchLists];
                        updated[idx] = { ...updated[idx], terminalCount: val };
                        setForm((prev) => ({ ...prev, branchLists: updated }));
                        setBranchListError("");
                      }}
                    />
                  </div>

                  {/* Edit Actions */}
                  {isEdit && branch.branchId && (
                    <div className="flex items-center gap-2 pt-2 sm:pt-4 self-end sm:self-center">
                      <button
                        type="button"
                        title="Edit Branch Description"
                        className="p-2 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white transition-all duration-200 hover:scale-110"
                        onClick={() => {
                          setEditBranchError("");
                          setEditingBranchData({ branchId: branch.branchId!, description: branch.branchDescription });
                          setEditBranchModalOpen(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      {form.branchLists.length > 1 && (
                        <button
                          type="button"
                          title="Delete Branch"
                          className="p-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110"
                          onClick={() => {
                            setDeleteBranchState({
                              open: true,
                              branchId: branch.branchId!,
                              description: branch.branchDescription,
                              deleting: false,
                            });
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          setTerminalModalState({ open: true, branchId: branch.branchId!, branchName: branch.branchDescription, loading: true, adding: false, terminals: [] });
                          try {
                            const list = await getCustomerTerminalList(branch.branchId!);
                            setTerminalModalState({ open: true, branchId: branch.branchId!, branchName: branch.branchDescription, loading: false, adding: false, terminals: list });
                          } catch (err) {
                            console.error(err);
                            showToast("Failed to load terminals for branch", "error");
                            setTerminalModalState({ open: false, branchId: 0, branchName: "", loading: false, adding: false, terminals: [] });
                          }
                        }}
                      >
                        <Tv size={14} className="mr-1 inline" /> Terminals ({branch.terminalCount})
                      </Button>
                    </div>
                  )}

                  {/* Remove button in Create mode */}
                  {!isEdit && form.branchLists.length > 1 && (
                    <div className="pt-2 sm:pt-4 self-end sm:self-center">
                      <button
                        type="button"
                        title="Remove branch"
                        className="p-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-105"
                        onClick={() => {
                          const updated = form.branchLists.filter((_, i) => i !== idx);
                          setForm((prev) => ({
                            ...prev,
                            branchCount: updated.length,
                            branchLists: updated,
                          }));
                          setBranchListError("");
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                <span className="font-semibold text-gray-800">
                  Total Branches: <span className="text-[#49293e]">{form.branchLists.length}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="font-semibold text-gray-800">
                  Total Terminals: <span className="text-[#49293e]">{form.branchLists.reduce((sum, b) => sum + (Number(b.terminalCount) || 0), 0)}</span>
                </span>
              </div>

              <Button
                onClick={() => {
                  if (isEdit) {
                    setBranchModalOpen(false);
                    return;
                  }
                  const descs = new Set<string>();
                  for (let i = 0; i < form.branchLists.length; i++) {
                    const d = (form.branchLists[i]?.branchDescription ?? "").trim();
                    if (!d) {
                      setBranchListError(`Branch #${i + 1} description is required.`);
                      return;
                    }
                    if (descs.has(d.toLowerCase())) {
                      setBranchListError(`Duplicate branch description "${d}". Descriptions must be unique.`);
                      return;
                    }
                    descs.add(d.toLowerCase());
                  }
                  setBranchListError("");
                  setBranchModalOpen(false);
                }}
              >
                {isEdit ? "Close" : "Done"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      <Modal
        isOpen={otpModalOpen}
        onClose={() => {
          if (verifyingOtp || sendingOtp || resendingOtp) return;
          setOtpModalOpen(false);
        }}
        title="Verify Customer Email"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the OTP sent to <span className="font-medium">{otpPendingEmail || normalizedEmail}</span>.
          </p>

          <OtpForm
            onSubmit={verifyCustomerEmail}
            onResend={() => sendCustomerOtp(true)}
            loading={verifyingOtp}
            resendLoading={resendingOtp}
            submitLabel="Verify Email"
            helperText="Use the 6-digit OTP from the customer's email inbox."
            errorMessage={otpError}
            resetKey={`${otpPendingEmail || normalizedEmail}-${otpFormResetKey}`}
          />
        </div>
      </Modal>

      {/* Terminal List Modal */}
      <Modal
        isOpen={terminalModalState.open}
        onClose={() => setTerminalModalState((prev) => ({ ...prev, open: false }))}
        title={`Terminals — ${terminalModalState.branchName}`}
        size="md"
      >
        <div className="space-y-3">
          {isEdit && terminalModalState.branchId > 0 && (
            <div className="flex items-center justify-between border-b pb-3">
              <p className="text-sm text-gray-600">
                Registered Terminals: <span className="font-semibold text-gray-900">{terminalModalState.terminals.length}</span>
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={handleAddTerminal}
                loading={terminalModalState.adding}
                disabled={terminalModalState.adding || terminalModalState.loading}
              >
                <Plus size={14} className="mr-1 inline" /> Add Terminal
              </Button>
            </div>
          )}

          {terminalModalState.loading ? (
            <div className="py-8 flex justify-center">
              <Loader />
            </div>
          ) : !terminalModalState.terminals.length ? (
            <div className="py-6 text-center text-sm text-gray-500">
              No terminals registered for this branch.
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {terminalModalState.terminals.map((term) => (
                <div key={term.terminalId} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/60">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#49293e]/10 text-[#49293e]">
                      <Tv size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{term.terminalName}</p>
                      {term.activeDate && term.activeDate !== "0001-01-01T00:00:00" && (
                        <p className="text-xs text-gray-500">Active: {new Date(term.activeDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={term.status} />
                    {isEdit && (
                      <button
                        type="button"
                        title="Delete Terminal"
                        className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110 ml-1"
                        onClick={() => {
                          setDeleteTerminalState({
                            open: true,
                            terminalId: term.terminalId,
                            terminalName: term.terminalName,
                            branchId: terminalModalState.branchId,
                            deleting: false,
                          });
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
      {/* Add Additional Branch Modal (Edit Mode) */}
      <Modal
        isOpen={addBranchModalOpen}
        onClose={() => {
          if (addingBranch) return;
          setAddBranchModalOpen(false);
        }}
        title="Add Additional Branch"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Add a new branch for <span className="font-semibold text-gray-900">{form.custName || "this customer"}</span>.
          </p>

          {addBranchError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
              {addBranchError}
            </div>
          )}

          <FormInput
            label="Branch Description"
            required
            autoFocus
            placeholder="e.g. Downtown Branch"
            value={newBranchData.description}
            onChange={(e) => setNewBranchData((prev) => ({ ...prev, description: e.target.value }))}
            disabled={addingBranch}
          />

          <FormInput
            label="Terminal Count"
            required
            type="number"
            min="0"
            className="text-right"
            value={newBranchData.terminalCount.toString()}
            onChange={(e) => setNewBranchData((prev) => ({ ...prev, terminalCount: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
            disabled={addingBranch}
          />

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              variant="secondary"
              onClick={() => setAddBranchModalOpen(false)}
              disabled={addingBranch}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAdditionalBranch}
              loading={addingBranch}
              disabled={addingBranch}
            >
              Save Branch
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Branch Description Modal (Edit Mode) */}
      <Modal
        isOpen={editBranchModalOpen}
        onClose={() => {
          if (updatingBranch) return;
          setEditBranchModalOpen(false);
        }}
        title="Edit Branch Description"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Update branch description for <span className="font-semibold text-gray-900">{form.custName || "this customer"}</span>.
          </p>

          {editBranchError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
              {editBranchError}
            </div>
          )}

          <FormInput
            label="Branch Description"
            required
            autoFocus
            placeholder="e.g. Main Branch"
            value={editingBranchData.description}
            onChange={(e) => setEditingBranchData((prev) => ({ ...prev, description: e.target.value }))}
            disabled={updatingBranch}
          />

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              variant="secondary"
              onClick={() => setEditBranchModalOpen(false)}
              disabled={updatingBranch}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBranch}
              loading={updatingBranch}
              disabled={updatingBranch}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Branch Confirmation Modal (Edit Mode) */}
      <Modal
        isOpen={deleteBranchState.open}
        onClose={() => {
          if (deleteBranchState.deleting) return;
          setDeleteBranchState({ open: false, branchId: 0, description: "", deleting: false });
        }}
        title="Delete Branch"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete branch <span className="font-semibold text-gray-900">"{deleteBranchState.description}"</span>? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              variant="secondary"
              onClick={() => setDeleteBranchState({ open: false, branchId: 0, description: "", deleting: false })}
              disabled={deleteBranchState.deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDeleteBranch}
              loading={deleteBranchState.deleting}
              disabled={deleteBranchState.deleting}
            >
              Delete Branch
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Terminal Confirmation Modal */}
      <Modal
        isOpen={deleteTerminalState.open}
        onClose={() => {
          if (deleteTerminalState.deleting) return;
          setDeleteTerminalState({ open: false, terminalId: 0, terminalName: "", branchId: 0, deleting: false });
        }}
        title="Delete Terminal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete terminal <span className="font-semibold text-gray-900">"{deleteTerminalState.terminalName}"</span>? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              variant="secondary"
              onClick={() => setDeleteTerminalState({ open: false, terminalId: 0, terminalName: "", branchId: 0, deleting: false })}
              disabled={deleteTerminalState.deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDeleteTerminal}
              loading={deleteTerminalState.deleting}
              disabled={deleteTerminalState.deleting}
            >
              Delete Terminal
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CustomerForm;
