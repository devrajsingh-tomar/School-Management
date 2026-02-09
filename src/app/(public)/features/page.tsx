import {
    Users,
    BookOpen,
    Calendar,
    IndianRupee,
    MessageCircle,
    Shield,
    BarChart3,
    Globe,
    Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FeaturesPage() {
    return (
        <div className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-20 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Advanced Academic Modules</h1>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto">
                        Explore the powerful tools designed to simplify school administration and enhance student learning outcomes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
                    <FeatureDetail
                        icon={<Users className="text-indigo-600" />}
                        title="Student Lifecycle Management"
                        description="From enquiry to graduation, track every milestone including admissions, documents, and alumni relations."
                    />
                    <FeatureDetail
                        icon={<BookOpen className="text-violet-600" />}
                        title="Comprehensive Academics"
                        description="Manage curriculum, scheme of work, lesson planning, and interactive assignments for every grade level."
                    />
                    <FeatureDetail
                        icon={<Calendar className="text-blue-600" />}
                        title="AI Timetable Engine"
                        description="Generate conflict-free schedules for complex multi-room and multi-staff scenarios automatically."
                    />
                    <FeatureDetail
                        icon={<IndianRupee className="text-emerald-600" />}
                        title="Automated Fee Collection"
                        description="Generate invoices, send reminders, and accept online payments with automatic ledger updates."
                    />
                    <FeatureDetail
                        icon={<BarChart3 className="text-rose-600" />}
                        title="Integrated Exam System"
                        description="Create custom exam formats, marksheets, and generate detailed student performance reports."
                    />
                    <FeatureDetail
                        icon={<MessageCircle className="text-sky-600" />}
                        title="Multi-Channel Communication"
                        description="Keep parents informed with integrated SMS, Email, and Push notifications for all school updates."
                    />
                    <FeatureDetail
                        icon={<Shield className="text-amber-600" />}
                        title="Advanced HR & Payroll"
                        description="Manage staff records, leaves, biometrics attendance, and automated salary generation."
                    />
                    <FeatureDetail
                        icon={<Globe className="text-indigo-600" />}
                        title="Multi-School Support"
                        description="Supervising a school group? Manage multiple campuses from a single centralized dashboard."
                    />
                    <FeatureDetail
                        icon={<Zap className="text-yellow-500" />}
                        title="Real-time Analytics"
                        description="Get instant insights into student performance, teacher efficiency, and school financial health."
                    />
                </div>

                <div className="mt-20 p-12 bg-indigo-50 rounded-3xl text-center">
                    <h2 className="text-3xl font-bold mb-4">Want to see these in action?</h2>
                    <p className="text-slate-600 mb-8 max-w-xl mx-auto font-medium">Schedule a 1-on-1 personalized walkthrough with our product experts.</p>
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-14 px-10 text-lg shadow-xl shadow-indigo-200" asChild>
                        <Link href="/register">Book Personalized Demo</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function FeatureDetail({ icon, title, description }: any) {
    return (
        <div className="space-y-4 group">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm border border-slate-100">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
        </div>
    );
}
