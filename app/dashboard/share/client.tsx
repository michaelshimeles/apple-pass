"use client";
import { useEffect, useState } from "react";
import { ApplePass } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SharePass from "@/app/share/_components/share-pass";
import Pass from "@/app/share/_components/pass";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import { updatePassName } from "./_actions";
import { toast } from "sonner";

type PassItem = {
  id: number;
  name: string;
  pass_share_id: string;
};

export function SharePreviewClient({
  pass,
  userPasses,
}: {
  pass: ApplePass;
  userPasses: PassItem[];
}) {
  const [passName, setPassName] = useState(pass?.name || "");
  const [selectedPass, setSelectedPass] = useState<string | undefined>(
    pass?.pass_share_id,
  );
  const router = useRouter();
  const pathname = usePathname();

  // Update passName when pass changes
  useEffect(() => {
    if (pass?.name) {
      setPassName(pass.name);
    }
  }, [pass]);

  // Handle pass selection change
  const handlePassChange = (value: string) => {
    setSelectedPass(value);
    router.push(`${pathname}?passId=${value}`);
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Pass Sharing Preview</h1>
        {userPasses?.length > 0 && (
          <Select
            defaultValue={pass?.pass_share_id}
            onValueChange={handlePassChange}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a pass" />
            </SelectTrigger>
            <SelectContent>
              {userPasses.map((passItem) => (
                <SelectItem key={passItem.id} value={passItem.pass_share_id}>
                  {passItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex justify-start items-start gap-[5rem] w-full">
        <div className="border h-[95%] rounded max-w-[800px] w-full">
          <SharePass pass={pass} passName={passName}>
            <Pass pass={pass} />
          </SharePass>
        </div>
        <div
          className="w-full max-w-[400px] animate-fadeInUp"
          style={{ animationDelay: "0.3s" }}
        >
          <Card className="shadow-md border-slate-200 rounded">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">
                Customize Your Pass Page
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Pass Title
                </Label>
                <Input
                  placeholder="Enter pass name"
                  value={passName}
                  onChange={(e) => setPassName(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  This will be displayed when sharing your pass.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={async () => {
                  if (!selectedPass) {
                    toast.error("No pass selected");
                    return;
                  }

                  // First update the pass name
                  const result = await updatePassName({
                    passShareId: selectedPass,
                    name: passName,
                  });

                  if (result.success) {
                    toast.success("Pass name updated successfully");
                    // Navigate to the share page
                    window.open(`/share/pass/${selectedPass}`, "_blank");
                  } else {
                    toast.error(result.error || "Failed to update pass name");
                  }
                }}
              >
                Share
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
