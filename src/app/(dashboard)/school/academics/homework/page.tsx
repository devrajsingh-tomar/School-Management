import { getClasses } from "@/lib/actions/academic.actions";
import { createHomework, getHomework } from "@/lib/actions/academic-content.actions";
import Link from "next/link";
import { Plus, Calendar, Clock, BookOpen, Trash2, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";

import { auth } from "@/auth";

export default async function HomeworkPage() {
    const session = await auth();
    const classes = await getClasses();
    const homeworkList = await getHomework();

    async function postHomework(formData: FormData) {
        "use server";
        await createHomework(formData);
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Homework & Assignments"
                description="Assign and manage homework for your classes"
                showBackButton
                autoBreadcrumb
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="bg-white p-6 rounded-lg shadow h-fit">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                        <Plus size={18} /> Assign Homework
                    </h2>
                    <form action={postHomework} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class</label>
                            <select name="classId" required className="w-full border rounded p-2 bg-white">
                                {classes.map((c: any) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                            <input name="subject" placeholder="e.g. Mathematics" required className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input name="title" placeholder="Assignment Topic" required className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" rows={3} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input name="dueDate" type="date" required className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Attachment Link</label>
                            <input name="link" placeholder="Google Drive / Doc URL" className="w-full border rounded p-2" />
                        </div>
                        <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                            Post Assignment
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {homeworkList.length === 0 ? (
                        <div className="p-12 bg-white rounded-lg shadow text-center text-gray-500">
                            No assignments active.
                        </div>
                    ) : (
                        homeworkList.map((hw: any) => (
                            <div key={hw._id} className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                            {hw.class?.name} • {hw.subject}
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-800 mt-2">{hw.title}</h3>
                                        <p className="text-gray-600 text-sm mt-1">{hw.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                                            <Calendar size={12} /> Due: {format(new Date(hw.dueDate), "dd/MM/yyyy")}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">by {hw.teacher?.name}</div>
                                    </div>
                                </div>

                                {hw.attachments && hw.attachments.length > 0 && (
                                    <div className="mt-4 pt-3 border-t flex gap-2">
                                        {hw.attachments.map((link: string, i: number) => (
                                            <a key={i} href={link} target="_blank" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                                <LinkIcon size={14} /> View Attachment
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
