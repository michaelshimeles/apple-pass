"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AcceptInviation({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;


      try {
        const response = await authClient.organization.acceptInvitation({
          invitationId: id,
        });


        if (response.data) {
          setSuccess(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else if (response.error) {
          setError(response.error.message || "Failed to accept invitation");
        }
      } catch (error) {
        console.error(error);
        setError("An unexpected error occurred while accepting the invitation");
      } finally {
        setLoading(false);
      }
    };

    getParams();
  }, [params, router]);

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {loading
              ? "Processing Invitation..."
              : success
                ? "Welcome to the team!"
                : "Invitation Error"}
          </CardTitle>
          <CardDescription>
            {loading
              ? "We're adding you to the organization"
              : success
                ? "You've successfully joined the organization. Redirecting to dashboard..."
                : "There was a problem accepting your invitation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {loading && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {success && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-sm text-muted-foreground">
                Redirecting in a moment...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
              <div className="space-y-2 w-full">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => router.push("/sign-in")}
                  variant="outline"
                  className="w-full hover:text-gray-900"
                >
                  Sign In Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
