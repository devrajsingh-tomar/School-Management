"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { createSupportTicket } from "@/lib/actions/support.actions";
import toast from "react-hot-toast";
import Link from "next/link";

export default function NewPortalTicketPage() {
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
                await createSupportTicket(formData);
                toast.success("Ticket created successfully!");
                router.push("/portal/support");
                router.refresh();
            } catch (err: any) {
                setError(err.message || "Failed to create ticket");
                toast.error("Failed to create ticket");
            }
        });
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/portal/support">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>New Support Ticket</CardTitle>
                    <CardDescription>
                        Need help? Submit a ticket and we'll get back to you.
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
                                placeholder="Brief summary of issue"
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
                                    <SelectItem value="academic">Academic Query</SelectItem>
                                    <SelectItem value="fees">Fees & Billing</SelectItem>
                                    <SelectItem value="transport">Transport</SelectItem>
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
                                placeholder="Describe your issue in detail..."
                                value={formData.message}
                                onChange={(e) =>
                                    setFormData({ ...formData, message: e.target.value })
                                }
                                disabled={isPending}
                                rows={6}
                                required
                            />
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 pt-2">
                            <Button
                                className="w-full"
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isPending ? "Submitting..." : "Submit Ticket"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
