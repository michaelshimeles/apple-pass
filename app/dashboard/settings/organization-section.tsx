"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase,
  Globe,
  Shield,
  Ticket,
  Users,
  Users as UsersIcon,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Pass {
  id: number;
  name: string;
  created_at: string;
}

interface OnboardingInfo {
  position: string;
  company_url: string;
  total_visitors: string;
}

// Add this interface near the top with other interfaces
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  avatar: string;
  lastActive: string;
}

// Add this mock data inside the component before the return statement
const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "admin",
    avatar: "AJ",
    lastActive: "2025-05-21T10:30:00Z",
  },
  {
    id: "2",
    name: "Jamie Smith",
    email: "jamie@example.com",
    role: "member",
    avatar: "JS",
    lastActive: "2025-05-20T15:45:00Z",
  },
  {
    id: "3",
    name: "Taylor Wilson",
    email: "taylor@example.com",
    role: "member",
    avatar: "TW",
    lastActive: "2025-05-19T09:15:00Z",
  },
];

interface OrgInfo {
  id: number;
  org_id: string;
  name: string;
  admin_user_id: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  pass_count: number;
  recent_passes: Pass[];
  is_admin: boolean;
  onboarding_info: OnboardingInfo | null;
}

interface OrganizationSectionProps {
  org: OrgInfo;
  isLoading?: boolean;
}

export function OrganizationSection({
  org,
  isLoading = false,
}: OrganizationSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    tooltip,
  }: {
    title: string;
    value: React.ReactNode;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    tooltip?: string;
  }) => (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          {title}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          {org.name}
        </h2>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span>Organization ID: </span>
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            {org.org_id}
          </code>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Members"
          value={org.member_count?.toLocaleString() || "0"}
          description="Total organization members"
          icon={Users}
          tooltip="Number of members with access to this organization"
        />

        <StatCard
          title="Passes"
          value={org.pass_count?.toLocaleString() || "0"}
          description="Total passes created"
          icon={Ticket}
          tooltip="Total number of passes created in this organization"
        />

        <StatCard
          title="Your Role"
          value={org.is_admin ? "Admin" : "Member"}
          description={org.is_admin ? "Full access" : "Limited access"}
          icon={Shield}
          tooltip={
            org.is_admin
              ? "You have full administrative privileges"
              : "Limited access based on your role"
          }
        />
      </div>

      <div className="grid gap-6">
        {org.onboarding_info && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
              <CardDescription>
                Details from your organization&apos;s onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Website</p>
                    <a
                      href={
                        org.onboarding_info.company_url.startsWith("http")
                          ? org.onboarding_info.company_url
                          : `https://${org.onboarding_info.company_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {org.onboarding_info.company_url}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-70"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Your Role</p>
                    <p className="text-sm text-muted-foreground">
                      {org.onboarding_info.position}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UsersIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Monthly Visitors</p>
                    <p className="text-sm text-muted-foreground">
                      {org.onboarding_info.total_visitors}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {org.recent_passes && org.recent_passes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Passes</CardTitle>
              <CardDescription>
                Recently created passes in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {org.recent_passes.map((pass) => (
                  <div
                    key={pass.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{pass.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Created on {formatDate(pass.created_at)}
                      </p>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage your organization members and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTeamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium text-primary">
                        {member.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        member.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                      )}
                    >
                      {member.role === "admin" ? "Admin" : "Member"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Last active {formatDate(member.lastActive)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
