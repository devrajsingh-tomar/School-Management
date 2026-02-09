"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { createDocumentRecord, deleteDocument } from "@/lib/actions/document.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Plus, FileText, ExternalLink } from "lucide-react";

export default function DocumentManager({
    studentId,
    documents,
}: {
    studentId: string;
    documents: any[];
}) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Basic form state
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [type, setType] = useState("Other");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !url) return;

        setLoading(true);
        try {
            await createDocumentRecord({ studentId, name, url, type });
            setName("");
            setUrl("");
            setShowForm(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to add document");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this document?")) return;
        try {
            await deleteDocument(id);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to delete document");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Documents</h3>
                <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Document
                </Button>
            </div>

            {showForm && (
                <div className="border p-4 rounded-md bg-gray-50">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Document Name (e.g. Birth Cert)"
                                required
                            />
                            <Input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="URL (Link to file)"
                                required
                            />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="Certificate">Certificate</option>
                                <option value="ID Proof">ID Proof</option>
                                <option value="Report Card">Report Card</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Save
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-2">
                {documents.length === 0 ? (
                    <p className="text-sm text-gray-500">No documents uploaded.</p>
                ) : (
                    documents.map((doc) => (
                        <div key={doc._id} className="flex justify-between items-center border p-3 rounded-md">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="font-medium hover:underline cursor-pointer">
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name}</a>
                                    </p>
                                    <p className="text-xs text-gray-500">{doc.type} • {format(new Date(doc.createdAt), "dd/MM/yyyy")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </a>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(doc._id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
