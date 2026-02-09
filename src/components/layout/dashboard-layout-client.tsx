"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function DashboardLayoutClient({
    children,
    userRole,
    featureFlags
}: {
    children: React.ReactNode,
    userRole?: string,
    featureFlags?: any[]
}) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="h-screen w-full flex bg-gray-50 overflow-hidden">
            {/* Sidebar Wrapper - handles width transition */}
            <div
                className={cn(
                    "flex-shrink-0 h-full border-r border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out z-20 overflow-hidden",
                    isCollapsed ? "w-[72px]" : "w-64"
                )}
            >
                {/* 
                  Sidebar Component itself. 
                  IMPORTANT: The Sidebar component *internal* container must be h-full and handle its own overflow.
                  Looking at sidebar.tsx, it has "flex flex-col h-full ... overflow-y-auto". 
                  So we just wrap it here.
                */}
                <Sidebar userRole={userRole} featureFlags={featureFlags} />
            </div>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                <Topbar />

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}
