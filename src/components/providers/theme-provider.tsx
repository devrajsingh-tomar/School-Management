"use client";

import * as React from "react";

type Theme = "light" | "dark";
type Color = "blue" | "green" | "red" | "indigo" | "orange";

interface ThemeContextType {
    theme: Theme;
    color: Color;
    setTheme: (theme: Theme) => void;
    setColor: (color: Color) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = React.useState<Theme>("light");
    const [color, setColor] = React.useState<Color>("blue");
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        const savedTheme = localStorage.getItem("ui-theme") as Theme;
        const savedColor = localStorage.getItem("ui-color") as Color;
        if (savedTheme) setTheme(savedTheme);
        if (savedColor) setColor(savedColor);
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem("ui-theme", theme);
    }, [theme, mounted]);

    React.useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;
        // Remove previous color classes
        root.classList.forEach(cls => {
            if (cls.startsWith("theme-")) root.classList.remove(cls);
        });
        root.classList.add(`theme-${color}`);
        localStorage.setItem("ui-color", color);
    }, [color, mounted]);

    return (
        <ThemeContext.Provider value={{ theme, color, setTheme, setColor }}>
            {!mounted ? (
                <div style={{ visibility: "hidden" }}>{children}</div>
            ) : (
                children
            )}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = React.useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
