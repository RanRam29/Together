import type { TFunction } from "i18next";

import type { ParentMatchRequest } from "@/lib/api/matches";

export function getParentRequestStatusLabel(
  request: Pick<ParentMatchRequest, "status" | "initiated_by">,
  professionalName: string,
  t: TFunction,
): string {
  if (request.status === "pending" && request.initiated_by === "parent") {
    return t("parent.requestAwaitingProfessional", { name: professionalName });
  }
  if (request.status === "pending" && request.initiated_by === "professional") {
    return t("parent.requestAwaitingYourApproval");
  }
  return t(`enums.requestStatus.${request.status}`);
}
