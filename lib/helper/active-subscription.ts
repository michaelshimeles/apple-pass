import { auth } from "@/lib/auth/auth";
import { db } from "@/db/drizzle";
import { subscription, member, OrganizationRole } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { toast } from "sonner";

export async function activeSubscription(): Promise<boolean> {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session?.userId) {
      return false;
    }

    const userId = session.session.userId;

    // Check if user is an admin of any organization with an active subscription
    const adminMemberships = await db
      .select({
        organizationId: member.organizationId,
      })
      .from(member)
      .where(
        and(eq(member.userId, userId), eq(member.role, OrganizationRole.ADMIN)),
      );

    // If user is admin of any organization, check for active subscriptions
    if (adminMemberships.length > 0) {
      for (const membership of adminMemberships) {
        const activeSubscriptions = await db
          .select()
          .from(subscription)
          .where(
            and(
              eq(subscription.organizationId, membership.organizationId),
              eq(subscription.status, "active"),
            ),
          );

        if (activeSubscriptions.length > 0) {
          // Check if subscription is not cancelled and within valid period
          const sub = activeSubscriptions[0];
          const now = new Date();
          const currentPeriodEnd = new Date(sub.currentPeriodEnd);

          if (!sub.canceledAt && currentPeriodEnd > now) {
            return true;
          } else {
            toast.error("Admin subscription is invalid (canceled or expired)");
          }
        }
      }
    }

    // If user is not an admin, check if they're a member of an org with active subscription
    const memberMemberships = await db
      .select({
        organizationId: member.organizationId,
      })
      .from(member)
      .where(eq(member.userId, userId));

    for (const membership of memberMemberships) {
      const activeSubscriptions = await db
        .select()
        .from(subscription)
        .where(
          and(
            eq(subscription.organizationId, membership.organizationId),
            eq(subscription.status, "active"),
          ),
        );


      if (activeSubscriptions.length > 0) {
        // Check if subscription is not cancelled and within valid period
        const sub = activeSubscriptions[0];
        const now = new Date();
        const currentPeriodEnd = new Date(sub.currentPeriodEnd);

        if (!sub.canceledAt && currentPeriodEnd > now) {
          return true;
        } else {
          toast.error("Member subscription is invalid (canceled or expired)");
        }
      }
    }

    toast.error("No valid subscriptions found");
    return false;
  } catch (error) {
    console.error("💥 Error checking active subscription:", error);
    return false;
  }
}
