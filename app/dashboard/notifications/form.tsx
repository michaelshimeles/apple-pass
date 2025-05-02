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

export default function NotificationsForm({ passes }: { passes: any[] }) {
    const [passId, setPassId] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
        } else {
            toast.error("❌ Failed to send. " + data?.message || res.status);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button type="submit" variant="outline">
                Send Notification
            </Button>
        </form>
    );
}
