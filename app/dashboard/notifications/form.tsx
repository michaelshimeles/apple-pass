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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

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

    console.log("passes", passes);

    const res = await fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passId: Number(passId),
        message,
        textColor: passes?.[0]?.textColor,
        backgroundColor: passes?.[0]?.backgroundColor,
        secondaryLeftLabel: passes?.[0]?.secondaryLeftLabel,
        secondaryLeftValue: passes?.[0]?.secondaryLeftValue,
        secondaryRightLabel: passes?.[0]?.secondaryRightLabel,
        secondaryRightValue: passes?.[0]?.secondaryRightValue,
        websiteUrl: passes?.[0]?.websiteUrl,
        description: passes?.[0]?.description,
        headerFieldLabel: passes?.[0]?.headerFieldLabel,
        headerFieldValue: passes?.[0]?.headerFieldValue,
        barcodeValue: passes?.[0]?.barcodeValue,
        barcodeFormat: passes?.[0]?.barcodeFormat,
        logoUrl: passes?.[0]?.logoUrl,
        stripImage: passes?.[0]?.stripImage,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("✅ Notification sent!");
      setLoading(false);
      setMessage("");
    } else {
      toast.error("❌ Failed to send. " + data?.message || res.status);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 max-w-sm">
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
      <div className="text-xs text-gray-400 text-right mb-1">
        {message?.length || 0}/1150
      </div>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message"
        required
        maxLength={1150}
      />
      <Button type="submit" variant="outline" disabled={loading}>
        {!loading ? "Send Notification" : "Sending..."}
      </Button>
    </form>
  );
}
