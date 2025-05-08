"use client";

import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function NotificationsForm({ passes }: any) {
    const [passId, setPassId] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!passId || !message) {
            toast.error("Please fill out both fields.");
            return;
        }

        const res = await fetch("/api/send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passId: Number(passId), message }),
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("✅ Notification sent!");
            setLoading(false)
            setMessage("");
        } else {
            toast.error("❌ Failed to send. " + data?.message || res.status);
            setLoading(false)
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
            <Select onValueChange={setPassId}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a pass" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {passes.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
                required
            />

            <Button type="submit" variant="outline" disabled={loading}>
                {!loading ? "Send Notification" : "Sending..."}
            </Button>
        </form>
    );
}
