import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">Choose the plan that fits your institution's size and needs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <PricingCard
                        name="Starter"
                        price="₹4,999"
                        description="For small coaching centers & primary schools."
                        features={[
                            "Up to 200 Students",
                            "Basic Academics",
                            "Attendance Management",
                            "Email Support",
                            "Parent App"
                        ]}
                    />
                    <PricingCard
                        name="Professional"
                        price="₹9,999"
                        description="For growing schools needing full automation."
                        features={[
                            "Up to 1,000 Students",
                            "Full ERP Suite",
                            "Financial & HMS",
                            "Priority Support",
                            "Custom Domain",
                            "Staff Payroll"
                        ]}
                        highlighted
                    />
                    <PricingCard
                        name="Enterprise"
                        price="Custom"
                        description="For large school groups and universities."
                        features={[
                            "Unlimited Students",
                            "Multi-School Support",
                            "Dedicated Account Manager",
                            "API Access",
                            "Custom Integrations",
                            "SLA Guarantee"
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}

function PricingCard({ name, price, description, features, highlighted }: any) {
    return (
        <div className={`p-8 rounded-3xl border ${highlighted ? 'border-indigo-600 shadow-2xl shadow-indigo-100 ring-2 ring-indigo-600 bg-white' : 'border-slate-200 bg-slate-50'} flex flex-col`}>
            {highlighted && (
                <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest w-fit">
                    Most Popular
                </div>
            )}
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">{price}</span>
                {price !== 'Custom' && <span className="text-slate-500">/mo</span>}
            </div>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">{description}</p>

            <ul className="space-y-4 mb-10 flex-1">
                {features.map((f: string) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
                        <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={12} strokeWidth={3} />
                        </div>
                        {f}
                    </li>
                ))}
            </ul>

            <Button className={`w-full h-12 text-lg font-bold ${highlighted ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-black'}`} asChild>
                <Link href="/register">Get Started</Link>
            </Button>
        </div>
    );
}
