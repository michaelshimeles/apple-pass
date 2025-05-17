"use client";

import { useEffect } from "react";

export default function TrackVisit({ passId }: { passId: string }) {
  useEffect(() => {
    fetch("/api/track/user", {
      method: "POST",
      body: JSON.stringify({ passId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, [passId]);

  return null;
}
