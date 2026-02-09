import Link from "next/link";
import { BookOpen, Newspaper, FileText, Layout } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const academicModules = [
    {
        title: "Lesson Planning",
        description: "Manage curriculum and weekly lesson plans.",
        href: "/school/academics/planning",
        icon: Layout,
        color: "text-blue-600",
        bgColor: "bg-blue-100"
    },
    {
        title: "Homework & Assignments",
        description: "Distribute and track student assignments.",
        href: "/school/academics/homework",
        icon: FileText,
        color: "text-orange-600",
        bgColor: "bg-orange-100"
    },
    {
        title: "Announcements",
        description: "School-wide academic notices.",
        href: "/school/academics/announcements",
        icon: Newspaper,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100"
    }
];

export default function AcademicsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Academic Management"
                description="Curriculum, planning, and academic communication."
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {academicModules.map((module) => (
                    <Link key={module.href} href={module.href}>
                        <Card className="hover:border-indigo-500 transition-colors cursor-pointer group">
                            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                                <div className={`p-2 rounded-lg ${module.bgColor} ${module.color} mr-3 group-hover:bg-indigo-600 group-hover:text-white transition`}>
                                    <module.icon className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg font-bold">{module.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{module.description}</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
