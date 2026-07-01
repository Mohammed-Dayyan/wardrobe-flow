import { mapThrownError } from "@/lib/errors/map-network-error";
import { notifyActionResult, notifyError } from "@/lib/feedback/toast";
import { isNextNavigationError } from "@/lib/navigation/is-navigation-error";

type ActionResult = { success: boolean; error?: string };

export async function runServerAction<T extends ActionResult>(
  run: () => Promise<T>,
  successMessage: string,
): Promise<T | null> {
  try {
    const result = await run();
    if (!notifyActionResult(result, successMessage)) {
      return null;
    }
    return result;
  } catch (error) {
    if (isNextNavigationError(error)) {
      throw error;
    }
    notifyError(mapThrownError(error));
    return null;
  }
}

export async function runSafeMutation<T>(run: () => Promise<T>): Promise<T | null> {
  try {
    return await run();
  } catch (error) {
    if (isNextNavigationError(error)) {
      throw error;
    }
    notifyError(mapThrownError(error));
    return null;
  }
}
