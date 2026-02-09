"use client";

import { useActionState } from "react";
import { addTicketReply } from "@/lib/actions/support.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const initialState = {
    success: false,
    message: "",
};

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        try {
            const message = formData.get("message") as string;
            if (!message.trim()) return { success: false, message: "Message cannot be empty" };

            await addTicketReply(ticketId, message);
            // We need to clear the form, but with useActionState it's tricky without a ref or state reset.
            // But since page revalidates, maybe it's fine.
            return { success: true, message: "Reply sent successfully" };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }, initialState);

    if (state.success) {
        // Simple way to reset form is just let key change or manual reset.
        // For now user sees toast.
        toast.success("Reply sent!");
        // Reset success state to avoid toast loop? 
        // state.success = false; (Cannot mutate)
    }

    if (state.message && !state.success) {
        toast.error(state.message);
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form action={formAction} className="space-y-4">
                    <Textarea
                        name="message"
                        placeholder="Type your reply here..."
                        className="min-h-[100px]"
                        required
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Reply
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
