"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { createSupportTicket } from "@/lib/actions/support.actions";
import toast from "react-hot-toast";

export default function NewTicketPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        subject: "",
        category: "technical",
        priority: "medium",
        message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.subject || !formData.message) {
            setError("Please fill in all required fields");
            return;
        }

        startTransition(async () => {
            try {
                const result = await createSupportTicket(formData);

                // Show success toast
                toast.success("Ticket created successfully!");

                // Immediately redirect to support page
                router.push("/school/support");
                router.refresh();
            } catch (err: any) {
                setError(err.message || "Failed to create ticket");
                toast.error("Failed to create ticket");
            }
        });
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader
                title="Create Support Ticket"
                description="Submit a new support request"
                showBackButton
                autoBreadcrumb
            />

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>New Support Ticket</CardTitle>
                    <CardDescription>
                        Describe your issue and our support team will assist you
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Subject */}
                        <div className="space-y-2">
                            <Label htmlFor="subject">
                                Subject <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="subject"
                                placeholder="Brief description of your issue"
                                value={formData.subject}
                                onChange={(e) =>
                                    setFormData({ ...formData, subject: e.target.value })
                                }
                                disabled={isPending}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, category: value })
                                }
                                disabled={isPending}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="technical">Technical Issue</SelectItem>
                                    <SelectItem value="billing">Billing</SelectItem>
                                    <SelectItem value="feature_request">Feature Request</SelectItem>
                                    <SelectItem value="bug">Bug Report</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, priority: value })
                                }
                                disabled={isPending}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <Label htmlFor="message">
                                Message <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="message"
                                placeholder="Provide detailed information about your issue..."
                                value={formData.message}
                                onChange={(e) =>
                                    setFormData({ ...formData, message: e.target.value })
                                }
                                disabled={isPending}
                                rows={6}
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Include any relevant details, error messages, or steps to reproduce the issue
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isPending ? "Creating Ticket..." : "Submit Ticket"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
