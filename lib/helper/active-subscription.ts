import { auth } from "@/lib/auth/auth";
import { db } from "@/db/drizzle";
import { subscription, member, OrganizationRole } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function activeSubscription(): Promise<boolean> {
  console.log("🔍 Starting subscription check...");

  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("📝 Session data:", {
      hasSession: !!session,
      userId: session?.session?.userId,
      userEmail: session?.session?.user?.email,
      activeOrgId: session?.session?.activeOrganizationId,
    });

    if (!session?.session?.userId) {
      console.log("❌ No valid session found");
      return false;
    }

    const userId = session.session.userId;
    console.log("👤 Checking subscription for user:", userId);

    // Check if user is an admin of any organization with an active subscription
    console.log("🔎 Step 1: Checking admin memberships...");
    const adminMemberships = await db
      .select({
        organizationId: member.organizationId,
      })
      .from(member)
      .where(
        and(eq(member.userId, userId), eq(member.role, OrganizationRole.ADMIN)),
      );

    console.log("👑 Admin memberships found:", {
      count: adminMemberships.length,
      organizations: adminMemberships.map((m) => m.organizationId),
    });

    // If user is admin of any organization, check for active subscriptions
    if (adminMemberships.length > 0) {
      console.log("🔎 Step 2: Checking admin organization subscriptions...");

      for (const membership of adminMemberships) {
        console.log(
          `🏢 Checking subscriptions for org: ${membership.organizationId}`,
        );

        const activeSubscriptions = await db
          .select()
          .from(subscription)
          .where(
            and(
              eq(subscription.organizationId, membership.organizationId),
              eq(subscription.status, "active"),
            ),
          );

        console.log(
          `💳 Active subscriptions for org ${membership.organizationId}:`,
          {
            count: activeSubscriptions.length,
            subscriptions: activeSubscriptions.map((sub) => ({
              id: sub.id,
              status: sub.status,
              currentPeriodEnd: sub.currentPeriodEnd,
              canceledAt: sub.canceledAt,
              organizationId: sub.organizationId,
            })),
          },
        );

        if (activeSubscriptions.length > 0) {
          // Check if subscription is not cancelled and within valid period
          const sub = activeSubscriptions[0];
          const now = new Date();
          const currentPeriodEnd = new Date(sub.currentPeriodEnd);

          console.log("⏰ Subscription validity check:", {
            subscriptionId: sub.id,
            now: now.toISOString(),
            currentPeriodEnd: currentPeriodEnd.toISOString(),
            canceledAt: sub.canceledAt,
            isNotCanceled: !sub.canceledAt,
            isNotExpired: currentPeriodEnd > now,
            isValid: !sub.canceledAt && currentPeriodEnd > now,
          });

          if (!sub.canceledAt && currentPeriodEnd > now) {
            console.log("✅ Valid admin subscription found! Returning true");
            return true;
          } else {
            console.log(
              "❌ Admin subscription is invalid (canceled or expired)",
            );
          }
        }
      }
    }

    // If user is not an admin, check if they're a member of an org with active subscription
    console.log("🔎 Step 3: Checking all member organizations...");
    const memberMemberships = await db
      .select({
        organizationId: member.organizationId,
      })
      .from(member)
      .where(eq(member.userId, userId));

    console.log("👥 All memberships found:", {
      count: memberMemberships.length,
      organizations: memberMemberships.map((m) => m.organizationId),
    });

    for (const membership of memberMemberships) {
      console.log(
        `🏢 Checking member subscriptions for org: ${membership.organizationId}`,
      );

      const activeSubscriptions = await db
        .select()
        .from(subscription)
        .where(
          and(
            eq(subscription.organizationId, membership.organizationId),
            eq(subscription.status, "active"),
          ),
        );

      console.log(
        `💳 Active subscriptions for member org ${membership.organizationId}:`,
        {
          count: activeSubscriptions.length,
          subscriptions: activeSubscriptions.map((sub) => ({
            id: sub.id,
            status: sub.status,
            currentPeriodEnd: sub.currentPeriodEnd,
            canceledAt: sub.canceledAt,
            organizationId: sub.organizationId,
          })),
        },
      );

      if (activeSubscriptions.length > 0) {
        // Check if subscription is not cancelled and within valid period
        const sub = activeSubscriptions[0];
        const now = new Date();
        const currentPeriodEnd = new Date(sub.currentPeriodEnd);

        console.log("⏰ Member subscription validity check:", {
          subscriptionId: sub.id,
          now: now.toISOString(),
          currentPeriodEnd: currentPeriodEnd.toISOString(),
          canceledAt: sub.canceledAt,
          isNotCanceled: !sub.canceledAt,
          isNotExpired: currentPeriodEnd > now,
          isValid: !sub.canceledAt && currentPeriodEnd > now,
        });

        if (!sub.canceledAt && currentPeriodEnd > now) {
          console.log("✅ Valid member subscription found! Returning true");
          return true;
        } else {
          console.log(
            "❌ Member subscription is invalid (canceled or expired)",
          );
        }
      }
    }

    console.log("❌ No valid subscriptions found. Returning false");
    return false;
  } catch (error) {
    console.error("💥 Error checking active subscription:", error);
    return false;
  }
}
