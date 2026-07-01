import type { FieldErrors, FieldValues } from "react-hook-form";
import { toast } from "sonner";

export function notifySuccess(message: string): void {
  toast.success(message);
}

export function notifyError(message: string): void {
  toast.error(message);
}

export function notifyActionResult(
  result: { success: boolean; error?: string },
  successMessage: string,
): boolean {
  if (!result.success) {
    notifyError(result.error ?? "Something went wrong");
    return false;
  }

  notifySuccess(successMessage);
  return true;
}

function findFirstErrorMessage(errors: FieldErrors<FieldValues>): string | undefined {
  for (const value of Object.values(errors)) {
    if (!value) {
      continue;
    }

    if (typeof value === "object" && "message" in value && value.message) {
      return String(value.message);
    }

    if (typeof value === "object") {
      const nested = findFirstErrorMessage(value as FieldErrors<FieldValues>);
      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
}

export function notifyFormValidationError(errors: FieldErrors<FieldValues>): void {
  notifyError(findFirstErrorMessage(errors) ?? "Please fix the form errors");
}
