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
import { ApplePass } from "@/lib/types";

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
    const selectedPass: ApplePass = passes?.[0];

    console.log("selectedPass", selectedPass);

    const res = await fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passId: Number(passId),
        message,
        textColor: selectedPass?.text_color,
        backgroundColor: selectedPass?.background_color,
        secondaryLeftLabel: selectedPass?.secondary_left_label,
        secondaryLeftValue: selectedPass?.secondary_left_value,
        secondaryRightLabel: selectedPass?.secondary_right_label,
        secondaryRightValue: selectedPass?.secondary_right_value,
        websiteUrl: selectedPass?.website_url,
        description: selectedPass?.description,
        headerFieldLabel: selectedPass?.header_field_label,
        headerFieldValue: selectedPass?.header_field_value,
        barcodeValue: selectedPass?.barcode_value,
        barcodeFormat: selectedPass?.barcode_format,
        logoUrl: selectedPass?.logo_url,
        stripImage: selectedPass?.strip_image,
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
            {passes.map((p: ApplePass) => (
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
