import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    Users,
    BookOpen,
    Calendar,
    BarChart3,
    ShieldCheck,
    ArrowRight,
    Star
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32 bg-gradient-to-br from-indigo-50 via-white to-white">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-2">
                            <Star size={14} className="fill-indigo-700" />
                            <span>Voted #1 School Management SaaS</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                            Manage Your School with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Pure Intelligence</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
                            The all-in-one cloud platform for schools to automate academics, finance, HR, and communication. Built for modern educators and parents.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button size="lg" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-lg shadow-xl shadow-indigo-200" asChild>
                                <Link href="/register">Start Free Trial <ArrowRight className="ml-2" size={18} /></Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-indigo-400 transition-all duration-200" asChild>
                                <Link href="/school/login">Login as School</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-indigo-400 transition-all duration-200" asChild>
                                <Link href="/portal/login">Login as Student/Parent</Link>
                            </Button>
                        </div>

                        {/* Social Proof */}
                        <div className="pt-12 flex flex-col items-center">
                            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-6">Trusted by 500+ Institutions</p>
                            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="text-2xl font-bold text-slate-900">ACADEMIA</div>
                                <div className="text-2xl font-bold text-slate-900">GLOBALEDU</div>
                                <div className="text-2xl font-bold text-slate-900">UNITY HIGH</div>
                                <div className="text-2xl font-bold text-slate-900">Pinnacle Group</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 blur-[100px] rounded-full"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-violet-400/10 blur-[100px] rounded-full"></div>
            </section>

            {/* Feature Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Everything you need to run your school</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">One integrated system that replaces a dozen separate tools.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users className="text-indigo-600" />}
                            title="Student Information"
                            description="Comprehensive profiles, attendance tracking, and behavioral analytics in one place."
                        />
                        <FeatureCard
                            icon={<BookOpen className="text-violet-600" />}
                            title="Academic Excellence"
                            description="Manage curriculum, lesson plans, exams, and detailed gradebooks effortlessly."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="text-emerald-600" />}
                            title="Financial Control"
                            description="Automated fee collection, expense tracking, and real-time financial reporting."
                        />
                        <FeatureCard
                            icon={<Calendar className="text-blue-600" />}
                            title="Smart Timetabling"
                            description="Conflict-free scheduling for classes, teachers, and rooms with AI assist."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="text-rose-600" />}
                            title="Role-Based Security"
                            description="Highly secure access for admins, teachers, parents, and students."
                        />
                        <FeatureCard
                            icon={<CheckCircle2 className="text-indigo-600" />}
                            title="Communication Hub"
                            description="Integrated SMS, WhatsApp, and in-app notifications for instant updates."
                        />
                    </div>
                </div>
            </section>

            {/* Portal Highlight */}
            <section className="py-24 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                                Specialized Portals for <br />
                                <span className="text-indigo-600">Students & Parents</span>
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Give your parents and students a premium mobile-first experience. They can track homework, check results, and pay fees with a single tap.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <span className="text-slate-700">Real-time attendance notifications</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <span className="text-slate-700">Digital gradebooks and progress reports</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <span className="text-slate-700">Online fee payment with instant receipts</span>
                                </li>
                            </ul>
                            <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                                <Link href="/portal">Explore Portal</Link>
                            </Button>
                        </div>
                        <div className="flex-1 relative">
                            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 transform rotate-2 overflow-hidden">
                                <img
                                    src="/portal-preview.png"
                                    alt="Portal Dashboard Preview"
                                    className="h-[400px] w-full object-cover rounded-lg"
                                />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-100/50 -z-10 blur-3xl rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <div className="max-w-3xl mx-auto rounded-3xl bg-slate-900 p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to transform your school?</h2>
                            <p className="text-lg text-slate-300">Join hundreds of schools already using EduFlow to power their success.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 text-lg shadow-xl shadow-indigo-600/30" asChild>
                                    <Link href="/register">Get Started Now</Link>
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white bg-white text-slate-900 hover:bg-slate-100 transition-all duration-200 shadow-lg" asChild>
                                    <Link href="/contact">Book a Demo</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full"></div>
                        <div className="absolute top-0 left-0 w-64 h-64 bg-violet-500/20 blur-[100px] rounded-full"></div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 hover:bg-indigo-50/10 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{description}</p>
        </div>
    );
}
