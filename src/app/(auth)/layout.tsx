import Link from "next/link";
import { School } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            {/* Left Side: Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white">
                <div className="mx-auto w-full max-w-md lg:w-[480px]">
                    <div className="mb-10">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                                <School size={24} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-slate-900">
                                EduFlow<span className="text-indigo-600">SaaS</span>
                            </span>
                        </Link>
                    </div>
                    {children}
                </div>
            </div>

            {/* Right Side: Branding/Image */}
            <div className="relative hidden w-0 flex-1 lg:block bg-slate-900 border-l border-slate-800">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                    <div className="max-w-md space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-indigo-400 text-sm font-bold border border-slate-700">
                            Premium Enterprise Experience
                        </div>
                        <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
                            The future of academic management is here.
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Join over 50,000 educators and parents who trust EduFlow for their daily school operations.
                        </p>

                        {/* Testimonial Mini-Card */}
                        <div className="mt-12 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-left relative">
                            <p className="text-slate-300 italic mb-4">
                                "EduFlow transformed how we manage our 1,200 students. The parent communication features alone saved us hours of manual work."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-700"></div>
                                <div>
                                    <p className="text-sm font-bold">Dr. Sarah Jenkins</p>
                                    <p className="text-xs text-slate-500">Principal, St. Andrews Global</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative dots/patterns */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-600/10 to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
}
