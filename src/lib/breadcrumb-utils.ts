/**
 * Breadcrumb utilities for auto-generating navigation breadcrumbs from routes
 */

export interface Breadcrumb {
    label: string;
    href: string;
}

/**
 * Route segment to label mapping
 * Maps URL segments to human-readable labels
 */
const ROUTE_LABELS: Record<string, string> = {
    // School Panel
    school: "Dashboard",
    academics: "Academics",
    homework: "Homework",
    planning: "Lesson Planning",
    announcements: "Announcements",
    students: "Students",
    new: "New",
    edit: "Edit",
    hr: "HR",
    staff: "Staff",
    attendance: "Attendance",
    payroll: "Payroll",
    finance: "Finance",
    transactions: "Transactions",
    fees: "Fee Structure",
    admissions: "Admissions",
    enquiries: "Enquiries",
    timetable: "Timetable",
    substitution: "Substitution",
    users: "Users",

    // Teacher Panel
    teacher: "Dashboard",

    // Portal
    portal: "Dashboard",
    profile: "Profile",
    results: "Results",

    // Common
    dashboard: "Dashboard",
};

/**
 * Generate breadcrumbs from a pathname
 * @param pathname - Current route pathname (e.g., "/school/academics/homework")
 * @returns Array of breadcrumb objects
 */
export function generateBreadcrumbs(pathname: string): Breadcrumb[] {
    // Remove trailing slash and split into segments
    const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);

    if (segments.length === 0) {
        return [];
    }

    const breadcrumbs: Breadcrumb[] = [];
    let currentPath = "";

    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;

        // Skip dynamic segments (IDs) - they look like MongoDB ObjectIds or UUIDs
        if (segment.match(/^[a-f0-9]{24}$/i) || segment.match(/^[0-9a-f-]{36}$/i)) {
            return;
        }

        // Get label from mapping or capitalize segment
        const label = ROUTE_LABELS[segment] || capitalizeSegment(segment);

        breadcrumbs.push({
            label,
            href: currentPath,
        });
    });

    return breadcrumbs;
}

/**
 * Capitalize a route segment for display
 * Converts "lesson-planning" to "Lesson Planning"
 */
function capitalizeSegment(segment: string): string {
    return segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Get parent route from current pathname
 * @param pathname - Current route pathname
 * @returns Parent route href or null if at root
 */
export function getParentRoute(pathname: string): string | null {
    const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);

    if (segments.length <= 1) {
        return null;
    }

    // Remove last segment to get parent
    segments.pop();
    return `/${segments.join("/")}`;
}

/**
 * Get parent label from current pathname
 * @param pathname - Current route pathname
 * @returns Parent route label or null if at root
 */
export function getParentLabel(pathname: string): string | null {
    const parentRoute = getParentRoute(pathname);

    if (!parentRoute) {
        return null;
    }

    const breadcrumbs = generateBreadcrumbs(parentRoute);
    return breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : null;
}
