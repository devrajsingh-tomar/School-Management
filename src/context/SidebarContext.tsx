"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    setIsCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Hydration check and initial state from localStorage
        setIsMounted(true);
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved) {
            setIsCollapsed(saved === "true");
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("sidebar-collapsed", String(isCollapsed));
        }
    }, [isCollapsed, isMounted]);

    const toggleSidebar = () => setIsCollapsed((prev) => !prev);

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setIsCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
