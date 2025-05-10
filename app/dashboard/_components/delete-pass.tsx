"use client"
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deletePass } from "@/db/functions/deletePass";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DeletePass({ passId }: { passId: string }) {
    const router = useRouter()
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button onClick={() => {
                }} size="icon" variant="destructive">
                    <Trash />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Pass</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this pass?
                    </DialogDescription>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button 
                        variant="destructive"
                        onClick={() => {
                            deletePass(passId)
                            toast.success("Pass deleted successfully")
                            router.refresh()
                        }}>Delete</Button>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}