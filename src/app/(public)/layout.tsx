import Link from "next/link";
import { Button } from "@/components/ui/button";
import { School, Menu, X } from "lucide-react";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                            <School size={18} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            EduFlow<span className="text-indigo-600">SaaS</span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        <Link href="/features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            Features
                        </Link>
                        <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            Pricing
                        </Link>
                        <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            Contact
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild className="hidden md:flex">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 transition-all duration-200">
                            <Link href="/register">Request Demo</Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t bg-slate-50 py-12">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <div className="col-span-2 md:col-span-1">
                            <Link href="/" className="flex items-center gap-2 mb-4">
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white">
                                    <School size={14} />
                                </div>
                                <span className="font-bold">EduFlow</span>
                            </Link>
                            <p className="text-sm text-slate-500 max-w-xs">
                                The all-in-one modern platform for school management and academic excellence.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-slate-900">Product</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><Link href="/features" className="hover:text-indigo-600 transition-colors">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link></li>
                                <li><Link href="#" className="hover:text-indigo-600 transition-colors">API</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-slate-900">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><Link href="#" className="hover:text-indigo-600 transition-colors">About</Link></li>
                                <li><Link href="#" className="hover:text-indigo-600 transition-colors">Blog</Link></li>
                                <li><Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-slate-900">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><Link href="#" className="hover:text-indigo-600 transition-colors">Privacy</Link></li>
                                <li><Link href="#" className="hover:text-indigo-600 transition-colors">Terms</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 border-t pt-8 text-center text-sm text-slate-400">
                        © {new Date().getFullYear()} Lotus Loop Media Solutions. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
