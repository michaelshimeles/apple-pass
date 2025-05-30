"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function JoinOrgDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover:text-gray-900">Join Org</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join an Organization</DialogTitle>
          <DialogDescription>
            Ask the owner of the org to invite you, invites are sent via email.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}