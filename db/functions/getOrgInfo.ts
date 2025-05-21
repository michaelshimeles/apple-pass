// get org info by org id
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../drizzle";
import { organization_members, organizations, passes, onboarding_info } from "../schema";

interface OnboardingInfo {
  position: string;
  company_url: string;
  total_visitors: string;
}

interface OrgInfo {
  id: number;
  org_id: string;
  name: string;
  admin_user_id: string;
  created_at: Date;
  updated_at: Date;
  member_count: number;
  pass_count: number;
  recent_passes: Array<{
    id: number;
    name: string;
    created_at: Date;
  }>;
  is_admin: boolean;
  onboarding_info: OnboardingInfo | null;
}

export const getOrgInfo = async (
  userId: string,
): Promise<{
  statusSuccess: boolean;
  result?: OrgInfo;
  error?: unknown;
}> => {
  if (!userId) {
    return {
      statusSuccess: false,
      error: "User ID is required",
    };
  }

  try {
    // First, try to find if the user is an admin of any organization
    const orgAsAdmin = await db
      .select()
      .from(organizations)
      .where(eq(organizations.admin_user_id, userId))
      .limit(1);

    let orgId: number | null = null;
    let isAdmin = false;

    if (orgAsAdmin.length > 0) {
      // User is an admin of this organization
      orgId = orgAsAdmin[0].id;
      isAdmin = true;
    } else {
      // If not an admin, check if they're a member of any organization
      const orgMembership = await db
        .select()
        .from(organization_members)
        .where(eq(organization_members.user_id, userId))
        .limit(1);

      if (orgMembership.length > 0) {
        orgId = orgMembership[0].organization_id;
      }
    }

    if (!orgId) {
      return {
        statusSuccess: false,
        error: "User is not part of any organization",
      };
    }

    // Get organization details
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId));
      
    // Get onboarding info separately
    const [onboarding] = await db
      .select({
        position: onboarding_info.position,
        company_url: onboarding_info.company_url,
        total_visitors: onboarding_info.total_visitors
      })
      .from(onboarding_info)
      .where(eq(onboarding_info.organization_id, orgId))
      .limit(1);

    if (!org) {
      return {
        statusSuccess: false,
        error: "Organization not found",
      };
    }

    // Get member count
    const [memberCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organization_members)
      .where(eq(organization_members.organization_id, orgId));

    // Get pass count
    const [passCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(passes)
      .where(eq(passes.organization_id, orgId));

    // Get recent passes (last 5)
    const recentPasses = await db
      .select({
        id: passes.id,
        name: passes.name,
        created_at: passes.created_at,
      })
      .from(passes)
      .where(eq(passes.organization_id, orgId))
      .orderBy(desc(passes.created_at))
      .limit(5);

    const result: OrgInfo = {
      ...org,
      member_count: memberCount?.count || 0,
      pass_count: passCount?.count || 0,
      recent_passes: recentPasses,
      is_admin: isAdmin,
      onboarding_info: onboarding || null
    };

    return {
      statusSuccess: true,
      result,
    };
  } catch (error) {
    console.error("Error fetching organization info:", error);
    return {
      statusSuccess: false,
      error,
    };
  }
};
