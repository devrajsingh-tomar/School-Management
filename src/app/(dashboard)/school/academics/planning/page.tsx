import { getClasses } from "@/lib/actions/academic.actions";
import { getLessonPlans } from "@/lib/actions/academic-content.actions";
import { auth } from "@/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatePlanForm } from "./create-plan-form";
import { LessonPlanTable } from "./lesson-plan-table";
import { SyllabusTracker } from "./syllabus-tracker";
import { PageHeader } from "@/components/ui/page-header";

export default async function PlanningPage({
    searchParams
}: {
    searchParams: Promise<{ classId?: string, subject?: string }>
}) {
    const classes = await getClasses();
    const plans = await getLessonPlans();

    const params = await searchParams;
    const selectedClassId = params.classId || (classes.length > 0 ? classes[0]._id.toString() : "");
    const selectedSubject = params.subject || "";

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Academic Planning"
                description="Create lesson plans and track syllabus completion"
                showBackButton
                autoBreadcrumb
            />

            <Tabs defaultValue="plans" className="w-full">
                <TabsList className="bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="plans">Lesson Plans</TabsTrigger>
                    <TabsTrigger value="syllabus">Syllabus Tracking</TabsTrigger>
                </TabsList>

                <TabsContent value="plans" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1">
                            <CreatePlanForm classes={classes} />
                        </div>
                        <div className="lg:col-span-3">
                            <LessonPlanTable plans={plans} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="syllabus" className="mt-6">
                    <SyllabusTracker
                        classes={classes}
                        initialClassId={selectedClassId}
                        initialSubject={selectedSubject}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
