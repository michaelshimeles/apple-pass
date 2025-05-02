import { db } from "@/db/drizzle";
import { passes } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function NotificationsPage() {
    const allPasses = await db.select().from(passes);

    return (
        <div className="p-6 max-w-xl space-y-4">
            <h1 className="text-2xl font-semibold">Send Notification</h1>

            <form
                action={async (formData) => {
                    "use server"
                    const passId = formData.get("passId");
                    const message = formData.get("message");
                    console.log('passId', passId);
                    console.log('message', message);

                    if (!passId || !message) {
                        return;
                    }

                }}
                method="POST"
                className="space-y-4"
            >
                <Select name="passId" required>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Choose a pass" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {allPasses.map((pass) => (
                                <SelectItem key={pass.id} value={pass.id.toString()}>
                                    {pass.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Input
                    type="text"
                    name="message"
                    placeholder="Enter your message"
                    required
                />
                <Button
                    type="submit"
                    variant="outline"
                >
                    Send Notification
                </Button>
            </form>
        </div>
    );
}
