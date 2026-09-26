import type { CustomerFormData } from "../types";
import {
  isRequired,
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
  }

  if (!isRequired(form.country)) {
    errors.country = "Country is required";
  }

  if (!form.branchCount || !isNumber(form.branchCount.toString()) || form.branchCount < 1) {
    errors.branchCount = "Branch count must be at least 1";
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

  if (!form.dealerId) {
    errors.dealerId = "Dealer is required";
  }

  if (!form.empId) {
    errors.empId = "Employee is required";
  }

  if (form.branchCount > 0) {
    if (!form.branchLists || form.branchLists.length !== form.branchCount) {
      errors.branchCount = `Please configure details for all ${form.branchCount} branches`;
    } else {
      const descriptions = new Set<string>();
      for (let i = 0; i < form.branchLists.length; i++) {
        const branch = form.branchLists[i];
        const desc = (branch?.branchDescription ?? "").trim();
        if (!desc) {
          errors.branchCount = `Branch ${i + 1} description is required`;
          break;
        }
        if (descriptions.has(desc.toLowerCase())) {
          errors.branchCount = `Branch description "${desc}" must be unique across all branches`;
          break;
        }
        descriptions.add(desc.toLowerCase());

        if (branch.terminalCount === undefined || branch.terminalCount < 0 || isNaN(branch.terminalCount)) {
          errors.branchCount = `Branch ${i + 1} terminal count must be a non-negative number`;
          break;
        }
      }
    }
  }

  return errors;
};
