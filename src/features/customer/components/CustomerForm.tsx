import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { fetchCustomers } from "../../../store/customerSlice";
import {
  Button,
  FormInput,
  Loader,
  Modal,
  SelectInput,
} from "../../../components/common";
import {
  createCustomer,
  getCustomerById,
  getNextRegId,
  updateCustomer,
} from "../services/customerApi";
import type { CustomerFormData } from "../types";
import { useToast } from "../../../context/ToastContext";
import { validateCustomer } from "../utils/customerValidation";
import { formatPhone } from "../utils/formatters";
import { sendOtpApi, verifyOtpApi } from "../../auth/services/authApi";
import OtpForm from "../../auth/components/OtpForm";
import { getCountryName, mapCountry } from "../../../utils/countryMapper";
import { ensurePhonePrefix, syncPhonePrefix } from "../../../utils/phonePrefix";
import {
  CONNECTION_MODE_OPTIONS,
  COUNTRY_OPTIONS,
  MOBILE_PLACEHOLDERS,
} from "../../../constants/formOptions";
import { isValidEmail } from "../../../utils/validators";
import { getDealerListName } from "../../dealer/services/dealerApi";

interface SelectOption {
  label: string;
  value: string;
}

const initialState: CustomerFormData = {
  custName: "",
  regId: "",
  custMob: "+91 ",
  custTel: "",
  country: "India",
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
  dealerId: 0,
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
  const [dealerOptions, setDealerOptions] = useState<SelectOption[]>([]);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpVerifiedEmail, setOtpVerifiedEmail] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpFormResetKey, setOtpFormResetKey] = useState(0);
  const saveBtnRef = useRef<HTMLButtonElement | null>(null);
  const hasDealerOptions = dealerOptions.length > 0;
  const disableSave = submitting || (!isEdit && !hasDealerOptions);
  const normalizedEmail = form.email.trim().toLowerCase();
  const isEmailVerified =
    !isEdit && Boolean(otpToken) && otpVerifiedEmail === normalizedEmail;

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

    loadDealers();
  }, [showToast]);

  useEffect(() => {
    const init = async () => {
      try {
        if (id) {
          const customer = await getCustomerById(Number(id));
          const resolvedCountry = getCountryName(customer.country);

          setForm({
            ...initialState,
            ...customer,
            country: resolvedCountry,
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
          });
        } else {
          const regId = await getNextRegId();
          setForm((prev) => ({ ...prev, regId }));
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load customer", "error");
      }
    };

    init();
  }, [id, showToast]);

  const resetOtpVerification = () => {
    setOtpError("");
    setOtpToken("");
    setOtpVerifiedEmail("");
    setOtpModalOpen(false);
    setOtpFormResetKey((prev) => prev + 1);
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
      if (nextEmail !== normalizedEmail && (otpToken || otpVerifiedEmail || otpModalOpen)) {
        resetOtpVerification();
      }
    }

    setForm((prev) => {
      if (key === "country") {
        const nextCountry = String(value);
        return {
          ...prev,
          country: nextCountry,
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

  const buildPayload = (): CustomerFormData => ({
    ...form,
    country: getCountryName(form.country),
    custMob: formatPhone(form.custMob?.trim() || "", mapCountry(form.country)),
    email: normalizedEmail,
  });

  const sendCustomerOtp = async (isResend = false) => {
    if (!normalizedEmail) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      showToast("Enter an email address first", "error");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
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
      await sendOtpApi(normalizedEmail);
      setOtpError("");
      setOtpToken("");
      setOtpVerifiedEmail("");
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
    setVerifyingOtp(true);
    setOtpError("");

    try {
      const token = await verifyOtpApi(normalizedEmail, otpValue.trim());

      if (!token) {
        throw new Error("OTP verified, but no OTP token was returned");
      }

      setOtpToken(token);
      setOtpVerifiedEmail(normalizedEmail);
      setOtpModalOpen(false);
      showToast("Email verified successfully", "success");
    } catch (err) {
      const message = resolveErrorMessage(err, "Failed to verify OTP");
      setOtpError(message);
      showToast(message, "error");
    } finally {
      setVerifyingOtp(false);
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
    showToast("Customer created successfully", "success");
    dispatch(fetchCustomers());
    navigate("/dashboard/customers");
  };

  const handleSubmit = async () => {
    const validationErrors = validateCustomer(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Please fill all required fields", "error");
      return;
    }

    if (!isEdit && !isEmailVerified) {
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
        });
        showToast("Customer updated successfully", "success");
        dispatch(fetchCustomers());
        navigate("/dashboard/customers");
      } else {
        await createCustomerRecord(payload, otpToken);
      }
    } catch (err: unknown) {
      console.error(err);

      const message = resolveErrorMessage(err, "Something went wrong");
      showToast(message, "error");
      applyFieldErrorFromMessage(message);
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          value={form.regId || "Loading..."}
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
            disabled={submitting}
          />
          {!isEdit && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={isEmailVerified ? "secondary" : "primary"}
                onClick={() => void sendCustomerOtp()}
                disabled={submitting || !normalizedEmail}
                loading={sendingOtp}
              >
                {isEmailVerified ? "Verify Again" : "Send OTP"}
              </Button>
              <span
                className={`text-sm ${
                  isEmailVerified ? "text-green-700" : "text-amber-700"
                }`}
              >
                {isEmailVerified
                  ? "Email verified"
                  : "Email verification is required before creating the customer"}
              </span>
            </div>
          )}
        </div>

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
          placeholder={MOBILE_PLACEHOLDERS[mapCountry(form.country)] ?? "+91 9876543210"}
          value={form.custMob}
          onChange={(e) => handleChange("custMob", e.target.value)}
          error={errors.custMob}
          disabled={submitting}
        />

        <FormInput
          label="Branch Count"
          required
          value={form.branchCount.toString()}
          onChange={(e) => handleChange("branchCount", Number(e.target.value))}
          error={errors.branchCount}
          disabled={submitting}
        />

        <div className="space-y-2">
          <SelectInput
            label="Dealer"
            required
            value={form.dealerId ? String(form.dealerId) : ""}
            onChange={(e) => handleChange("dealerId", Number(e.target.value))}
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
          options={CONNECTION_MODE_OPTIONS}
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
            if (isEdit) return;

            const regId = await getNextRegId();
            resetOtpVerification();
            setForm({
              ...initialState,
              regId,
              custMob: ensurePhonePrefix(
                initialState.custMob,
                mapCountry(initialState.country)
              ),
            });
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
            Enter the OTP sent to <span className="font-medium">{normalizedEmail}</span>.
          </p>

          <OtpForm
            onSubmit={verifyCustomerEmail}
            onResend={() => sendCustomerOtp(true)}
            loading={verifyingOtp}
            resendLoading={resendingOtp}
            submitLabel="Verify Email"
            helperText="Use the 6-digit OTP from the customer's email inbox."
            errorMessage={otpError}
            resetKey={`${normalizedEmail}-${otpFormResetKey}`}
          />
        </div>
      </Modal>
    </>
  );
};

export default CustomerForm;
