import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
    return (
        <div className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {/* Left: Contact Info */}
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Let's talk.</h1>
                                <p className="text-lg text-slate-500 max-w-sm">
                                    Have questions about EduFlow? Our team is here to help you revolutionize your institution.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <ContactMethod
                                    icon={<Mail className="text-indigo-600" />}
                                    title="Email us"
                                    value="sales@eduflow.saas"
                                />
                                <ContactMethod
                                    icon={<Phone className="text-indigo-600" />}
                                    title="Call us"
                                    value="+91 (914) 094-6121"
                                />
                                <ContactMethod
                                    icon={<MapPin className="text-indigo-600" />}
                                    title="Our Headquarters"
                                    value="309, Chokhani tower, sector 18, Noida, Uttar Pradesh, India"
                                />
                            </div>
                        </div>

                        {/* Right: Form */}
                        <div className="bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm">
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-400">First Name</label>
                                        <Input placeholder="John" className="bg-white border-slate-200 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-400">Last Name</label>
                                        <Input placeholder="Doe" className="bg-white border-slate-200 h-12" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Work Email</label>
                                    <Input placeholder="john@school.com" className="bg-white border-slate-200 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Message</label>
                                    <Textarea placeholder="Tell us about your school..." className="bg-white border-slate-200 min-h-[120px]" />
                                </div>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 text-lg font-bold shadow-xl shadow-indigo-100 italic">
                                    Send Message <Send className="ml-2" size={18} />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContactMethod({ icon, title, value }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-slate-900">{title}</h4>
                <p className="text-slate-500">{value}</p>
            </div>
        </div>
    );
}
