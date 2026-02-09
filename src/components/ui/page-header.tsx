"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { generateBreadcrumbs, getParentRoute, getParentLabel } from "@/lib/breadcrumb-utils";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;

    // Navigation props
    showBackButton?: boolean;
    backHref?: string;
    backLabel?: string;
    breadcrumbs?: BreadcrumbItem[];
    autoBreadcrumb?: boolean; // Auto-generate from current route
    className?: string;
}

export function PageHeader({
    title,
    description,
    children,
    showBackButton = false,
    backHref,
    backLabel,
    breadcrumbs,
    autoBreadcrumb = false,
    className
}: PageHeaderProps) {
    const pathname = usePathname();

    // Auto-generate breadcrumbs if enabled
    const displayBreadcrumbs = autoBreadcrumb
        ? generateBreadcrumbs(pathname)
        : breadcrumbs;

    // Auto-generate back button if enabled but no explicit href provided
    const displayBackHref = backHref || (showBackButton ? getParentRoute(pathname) : null);
    const displayBackLabel = backLabel || (showBackButton ? getParentLabel(pathname) : null);

    return (
        <div className={cn("space-y-4 pb-6", className)}>
            {/* Breadcrumb and Back Button Row */}
            {(displayBreadcrumbs || displayBackHref) && (
                <div className="flex items-center gap-4">
                    {/* Back Button */}
                    {displayBackHref && (
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
                        >
                            <Link href={displayBackHref}>
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {displayBackLabel ? `Back to ${displayBackLabel}` : "Back"}
                                </span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                        </Button>
                    )}

                    {/* Breadcrumb - Hidden on mobile if back button exists */}
                    {displayBreadcrumbs && displayBreadcrumbs.length > 0 && (
                        <Breadcrumb
                            items={displayBreadcrumbs}
                            className={cn(
                                displayBackHref && "hidden md:flex"
                            )}
                        />
                    )}
                </div>
            )}

            {/* Title and Actions Row */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                    {description && (
                        <p className="text-muted-foreground mt-1">
                            {description}
                        </p>
                    )}
                </div>
                {children && (
                    <div className="flex items-center space-x-2">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
