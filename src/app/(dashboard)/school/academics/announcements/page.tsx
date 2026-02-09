import { getClasses } from "@/lib/actions/academic.actions";
import { createAnnouncement, getAnnouncements } from "@/lib/actions/communication.actions"; // fixed import source
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { auth } from "@/auth";

export default async function AnnouncementsPage() {
    const session = await auth();
    const classes = await getClasses();
    const announcementsRes = await getAnnouncements(session?.user?.schoolId || "");
    const announcements = announcementsRes.success ? announcementsRes.data : [];

    async function postAnnouncement(formData: FormData) {
        "use server";
        const session = await auth();
        if (!session?.user?.schoolId) return;

        await createAnnouncement({
            title: formData.get("title") as string,
            content: formData.get("content") as string,
            audience: formData.get("audience") as any,
            targetClass: formData.get("targetClass") as string,
            type: "Announcement",
            schoolId: session.user.schoolId,
            authorId: session.user.id
        });
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Announcement Board</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="bg-white p-6 rounded-lg shadow h-fit">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                        <Megaphone size={18} /> specific Post Update
                    </h2>
                    <form action={postAnnouncement} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input name="title" required className="w-full border rounded p-2" placeholder="e.g. Sports Day" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Content</label>
                            <textarea name="content" rows={4} required className="w-full border rounded p-2" placeholder="Details..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Audience</label>
                            <select name="audience" className="w-full border rounded p-2 bg-white">
                                <option value="School">Whole School</option>
                                <option value="Class">Specific Class</option>
                                <option value="Staff">Staff Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Target Class (if applicable)</label>
                            <select name="targetClass" className="w-full border rounded p-2 bg-white">
                                <option value="">None</option>
                                {classes.map((c: any) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <button className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
                            Post Announcement
                        </button>
                    </form>
                </div>

                {/* Feed */}
                <div className="lg:col-span-2 space-y-4">
                    {announcements.length === 0 ? (
                        <div className="p-12 bg-white rounded-lg shadow text-center text-gray-500">
                            No announcements yet.
                        </div>
                    ) : (
                        announcements.map((ann: any) => (
                            <div key={ann._id} className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ann.audience === "School" ? "bg-blue-100 text-blue-700" :
                                            ann.audience === "Staff" ? "bg-purple-100 text-purple-700" :
                                                "bg-green-100 text-green-700"
                                            }`}>
                                            {ann.audience} {ann.targetClass ? `(${ann.targetClass?.name})` : ""}
                                        </span>
                                        <span className="text-xs text-gray-400">{format(new Date(ann.createdAt), "dd/MM/yyyy")}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{ann.title}</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{ann.content}</p>
                                <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                                    Posted by {ann.author?.name}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
