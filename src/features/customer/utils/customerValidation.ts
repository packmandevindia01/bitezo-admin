import type { CustomerFormData } from "../types";
import {
  isRequired,
  isValidMobile,
  isNumber,
  isValidEmail,
} from "../../../utils/validators";

export const validateCustomer = (form: CustomerFormData) => {
  const errors: Partial<Record<keyof CustomerFormData, string>> = {};

  if (!isRequired(form.custName)) {
    errors.custName = "Company name is required";
  }

  if (!isRequired(form.custMob)) {
    errors.custMob = "Mobile number is required";
  } else if (form.custMob.trim() !== "-" && !isValidMobile(form.custMob, form.country)) {
    // ✅ skip validation if placeholder "-", validate otherwise
    errors.custMob = "Invalid mobile number";
  }

  if (!isRequired(form.country)) {
    errors.country = "Country is required";
  }

  if (!form.branchCount || !isNumber(form.branchCount.toString())) {
    errors.branchCount = "Branch count must be a number";
  }

  if (!isRequired(form.database)) {
    errors.database = "Database is required";
  }

  if (!isRequired(form.custTel)) {
    errors.custTel = "Telephone is required";
  }

  if (!isRequired(form.crNo)) {
    errors.crNo = "CR No is required";
  }

  if (!isRequired(form.email)) {
    errors.email = "Email is required";
  } else if (!isValidEmail(form.email)) {
    errors.email = "Invalid email";
  }

  if (!isRequired(form.conMode)) {
    errors.conMode = "Connection mode is required";
  }

  return errors;
};