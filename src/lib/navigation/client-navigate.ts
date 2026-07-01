import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function navigateAfterMutation(router: AppRouterInstance, href: string) {
  router.replace(href);
}
