"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
    User,
    LogOut,
    KeyRound,
    UserCircle,
    ChevronDown,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAccountNavProps {
    user: {
        name?: string | null;
        email?: string | null;
        role?: string | null;
    };
}

export function UserAccountNav({ user }: UserAccountNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/portal/login" });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
            >
                <div className="flex items-center gap-3 pr-2">
                    <div className="h-9 w-9 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ring-1 ring-slate-200 group-hover:ring-indigo-200 transition-all">
                        {user.name?.charAt(0)}
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 leading-none mb-1">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight bg-slate-100 px-1.5 rounded py-0.5 inline-block">
                            {user.role}
                        </p>
                    </div>
                    <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Your Account</p>
                        <p className="text-sm font-semibold text-slate-900 truncate mt-1">{user.email}</p>
                    </div>

                    <DropdownLink
                        href="/portal/profile"
                        icon={<UserCircle size={18} />}
                        label="Profile"
                        onClick={() => setIsOpen(false)}
                    />
                    <DropdownLink
                        href="/portal/profile?tab=password"
                        icon={<KeyRound size={18} />}
                        label="Change Password"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="h-[1px] bg-slate-100 my-1 mx-2"></div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

function DropdownLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
        >
            {icon}
            {label}
        </Link>
    );
}
