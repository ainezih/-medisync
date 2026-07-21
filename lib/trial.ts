/**
 * Trial-lock logic (SaaS Faz 2). A clinic's `subscription_status` starts as
 * "trialing" (10-day clock from `clinics.trial_ends_at`, set in 0003/0004).
 * "active" (set by the future PayTR webhook, Faz 3) never locks regardless of
 * trial_ends_at; "canceled" locks immediately.
 */
export type TrialStatus = "trialing" | "active" | "canceled";

export type TrialInfo = {
  status: TrialStatus;
  /** Whole days left on the trial clock; negative once it has expired. */
  daysLeft: number;
};

export function trialInfoFromClinic(clinic: { trial_ends_at: string; subscription_status: TrialStatus }): TrialInfo {
  const daysLeft = Math.ceil((new Date(clinic.trial_ends_at).getTime() - Date.now()) / 86_400_000);
  return { status: clinic.subscription_status, daysLeft };
}

export function isTrialLocked(trial: TrialInfo | null): boolean {
  if (!trial) return false;
  if (trial.status === "canceled") return true;
  return trial.status === "trialing" && trial.daysLeft < 0;
}
