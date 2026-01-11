import { ISchool } from "./db/models/School";
import { differenceInDays, isFuture, isPast, addDays } from "date-fns";

export type SubscriptionStatus = "ACTIVE" | "GRACE_PERIOD" | "EXPIRED" | "LIFETIME";

export function checkSubscriptionStatus(school: ISchool): SubscriptionStatus {
    if (!school.subscriptionExpiry) return "LIFETIME"; // Or "TRIAL" depending on logic. Assuming lifetime if no expiry set for now.

    const now = new Date();
    const expiry = new Date(school.subscriptionExpiry);
    const graceEnd = addDays(expiry, school.gracePeriodDays || 7);

    if (isFuture(expiry)) return "ACTIVE";
    if (isPast(expiry) && isFuture(graceEnd)) return "GRACE_PERIOD";

    return "EXPIRED";
}

export function hasFeatureAccess(school: ISchool, featureCode: string): boolean {
    // 1. Check if feature is in school's enabled features list
    // This list should be populated from the Plan when assigned, or overridden manually.
    if (school.features && school.features.includes(featureCode)) return true;

    // 2. Alternatively, if we don't copy features to school but keep them on Plan,
    // we would need to check the linked Plan. 
    // In our School model design, we have `features: string[]` on the School itself 
    // which simplifies this check (assuming we sync it on plan change).

    return false;
}

export function shouldRestrictAccess(school: ISchool): boolean {
    const status = checkSubscriptionStatus(school);
    return status === "EXPIRED";
}
