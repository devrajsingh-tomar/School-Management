"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, PanelLeftClose, PanelLeft, ExternalLink } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/actions/auth.actions";
import { useSidebar } from "@/context/SidebarContext";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { useEffect, useState } from "react";
import { getSchoolWebsiteUrl } from "@/lib/actions/school.actions";

export function Topbar() {
    const { toggleSidebar, isCollapsed } = useSidebar();
    const { data: session } = useSession();
    const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchWebsiteUrl() {
            if (!session?.user) {
                setIsLoading(false);
                return;
            }

            // Super Admin sees SaaS marketing site
            if (session.user.role === "SUPER_ADMIN") {
                setWebsiteUrl(process.env.NEXT_PUBLIC_SAAS_SITE_URL || "/");
                setIsLoading(false);
                return;
            }

            // School users see their school website
            if (session.user.schoolId) {
                try {
                    const url = await getSchoolWebsiteUrl();
                    setWebsiteUrl(url);
                } catch (error) {
                    console.error("Failed to fetch website URL:", error);
                    setWebsiteUrl(null);
                }
            }
            setIsLoading(false);
        }

        fetchWebsiteUrl();
    }, [session]);

    return (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full">
            <div className="flex h-16 items-center px-4 gap-4">
                <MobileSidebar />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="hidden md:flex text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                </Button>

                <div className="ml-auto flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-8 w-[200px] md:w-[300px]"
                        />
                    </div>

                    {/* View Website Button - Role-aware */}
                    {!isLoading && websiteUrl && (
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="hidden lg:flex gap-2"
                        >
                            <a
                                href={websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Website
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </Button>
                    )}

                    {/* Show tooltip if school user but no website configured */}
                    {!isLoading && !websiteUrl && session?.user?.role !== "SUPER_ADMIN" && session?.user?.schoolId && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled
                                        className="hidden lg:flex"
                                    >
                                        View Website
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>School website not configured</p>
                                    {session?.user?.role === "SCHOOL_ADMIN" && (
                                        <p className="text-xs mt-1">Go to Settings to add URL</p>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    <UserNav />
                </div>
            </div>
        </div>
    );
}

function UserNav() {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const user = session?.user;

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Render a placeholder with same dimensions to prevent layout shift
        return (
            <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800">
                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                        <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2" align="end">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2 py-1">
                        <p className="text-sm font-semibold leading-none">{user?.name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                            {user?.email || "No email provided"}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/school/profile">
                    <DropdownMenuItem className="cursor-pointer">
                        Profile
                    </DropdownMenuItem>
                </Link>
                <Link href="/school/settings">
                    <DropdownMenuItem className="cursor-pointer">
                        Settings
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20"
                    onSelect={async () => {
                        await logout();
                    }}
                >
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
