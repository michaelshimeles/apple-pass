"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth/auth-client";
import {
  Building2,
  Eye,
  EyeOff,
  Mail,
  PlusCircle,
  Settings2,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface Member {
  id: string;
  role: string;
  user: {
    email: string;
    name: string;
    image?: string;
  };
  userId: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  members?: Member[];
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

function SettingsContent() {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>(
    [],
  );
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentTab, setCurrentTab] = useState("profile");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Profile form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile picture upload states
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: organizations } = authClient.useListOrganizations();

  console.log("organizations", organizations);
  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "organization", "billing"].includes(tab)) {
      setCurrentTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user session
        const session = await authClient.getSession();
        if (session.data?.user) {
          setUser(session.data.user);
          setName(session.data.user.name || "");
          setEmail(session.data.user.email || "");
        }

        // Get organization data
        const listInvites = await authClient.organization.listInvitations({});

        console.log("listInvites", listInvites);
        if (listInvites.data) {
          setPendingInvitations(
            listInvites.data?.filter((invite) => invite.status === "pending"),
          );
        }

        if (organizations?.[0]?.id) {
          const response = await authClient.organization.setActive({
            organizationId: organizations?.[0]?.id,
          });

          console.log("resres", response);
          setOrganization(response.data);
          setMembers(response.data?.members || []);

          // Check if current user is admin
          if (session.data?.user) {
            const currentUserMember = response.data?.members?.find(
              (member) => member.userId === session.data.user.id,
            );
            setIsAdmin(
              currentUserMember?.role === "admin" ||
                currentUserMember?.role === "owner",
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizations]);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const handleUpdateProfile = async () => {
    try {
      await authClient.updateUser({
        name,
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to change password");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profileImage) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", profileImage);

      // Upload to your R2 storage endpoint
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();

        // Update user profile with new image URL
        await authClient.updateUser({
          name,
          image: url,
        });

        setUser((prev) => (prev ? { ...prev, image: url } : null));
        setImagePreview(null);
        setProfileImage(null);
        toast.success("Profile picture updated successfully");
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInviteMember = async () => {
    if (!newInviteEmail || !organization) return;

    try {
      await authClient.organization.inviteMember({
        email: newInviteEmail,
        role: "member",
      });

      // Refresh the pending invitations list
      const listInvites = await authClient.organization.listInvitations();
      if (listInvites.data) {
        setPendingInvitations(
          listInvites.data.filter((invite) => invite.status === "pending"),
        );
      }

      setNewInviteEmail("");
      toast.success("Invitation sent successfully");
    } catch {
      toast.error("Failed to send invitation");
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    try {
      await authClient.organization.removeMember({
        memberIdOrEmail: memberUserId,
      });
      setMembers(members.filter((m) => m.userId !== memberUserId));
      toast.success("Member removed successfully");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await authClient.organization.cancelInvitation({
        invitationId,
      });

      console.log("remove", response);
      setPendingInvitations(
        pendingInvitations.filter((inv) => inv.id !== invitationId),
      );
      toast.success("Invitation cancelled successfully");
    } catch {
      toast.error("Failed to cancel invitation");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-9 w-32 mb-2 bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-5 w-80 bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Tabs Skeleton */}
        <div className="w-full max-w-4xl">
          <div className="flex space-x-1 mb-6">
            <Skeleton className="h-10 w-20 bg-gray-200 dark:bg-gray-800" />
            <Skeleton className="h-10 w-28 bg-gray-200 dark:bg-gray-800" />
            <Skeleton className="h-10 w-16 bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="space-y-6">
            {/* Profile Information Card Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-6 w-40 bg-gray-200 dark:bg-gray-800" />
                </div>
                <Skeleton className="h-4 w-72 bg-gray-200 dark:bg-gray-800" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24 bg-gray-200 dark:bg-gray-800" />
                      <Skeleton className="h-8 w-12 bg-gray-200 dark:bg-gray-800" />
                      <Skeleton className="h-8 w-16 bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <Skeleton className="h-4 w-48 bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-800" />
                    <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-800" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-gray-800" />
                    <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>

                <Skeleton className="h-10 w-28 bg-gray-200 dark:bg-gray-800" />
              </CardContent>
            </Card>

            {/* Change Password Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36 bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-4 w-64 bg-gray-200 dark:bg-gray-800" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-800" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-800" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40 bg-gray-200 dark:bg-gray-800" />
                  <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-800" />
                </div>
                <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-800" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full max-w-4xl"
      >
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={imagePreview || user?.image || ""} />
                  <AvatarFallback>
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("profile-image-input")?.click()
                      }
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? "Uploading..." : "Change Photo"}
                    </Button>
                    {profileImage && (
                      <Button
                        size="sm"
                        onClick={handleUploadProfilePicture}
                        disabled={uploadingImage}
                      >
                        Save
                      </Button>
                    )}
                    {imagePreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImagePreview(null);
                          setProfileImage(null);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled
                  />
                </div>
              </div>

              <Button onClick={handleUpdateProfile}>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button onClick={handleChangePassword}>Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          {/* Organization Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Details
              </CardTitle>
              <CardDescription>
                Manage your organization settings and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {organization ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Organization Name</Label>
                      <Input
                        disabled
                        value={organization.name}
                        placeholder="Organization name"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Organization Slug</Label>
                      <Input
                        disabled
                        value={organization.slug}
                        placeholder="organization-slug"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Created</Label>
                    <Input
                      disabled
                      value={
                        organization.createdAt instanceof Date
                          ? organization.createdAt.toLocaleDateString()
                          : new Date(
                              organization.createdAt,
                            ).toLocaleDateString()
                      }
                      readOnly
                    />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No organization found</p>
              )}
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                {isAdmin
                  ? "Manage your team members and send invitations"
                  : "View your team members"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info message for non-admin users */}
              {!isAdmin && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/50">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Member View Only
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        You can view team members but cannot invite or remove
                        members. Contact an admin for member management.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Invite new member - Only show for admins */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label>Invite Team Member</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        placeholder="colleague@example.com"
                        className="pl-10"
                        value={newInviteEmail}
                        onChange={(e) => setNewInviteEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleInviteMember();
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={handleInviteMember}
                      disabled={!newInviteEmail}
                      size="icon"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Pending invites - Only show for admins */}
              {isAdmin && pendingInvitations.length > 0 && (
                <div className="space-y-2">
                  <Label>Pending Invitations</Label>
                  <div className="space-y-2">
                    {pendingInvitations?.length > 0 ? (
                      pendingInvitations.map((invitation) => {
                        if (invitation.status === "pending") {
                          return (
                            <div
                              key={invitation.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                                  <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {invitation.email}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Invited{" "}
                                    {new Date(
                                      invitation.createdAt,
                                    ).toLocaleDateString()}{" "}
                                    • Role: {invitation.role}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                >
                                  {invitation.status}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleCancelInvitation(invitation.id)
                                  }
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          );
                        }
                      })
                    ) : (
                      <div className="text-center text-sm text-muted-foreground">
                        No pending invitations.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Current members */}
              <div className="space-y-2">
                <Label>Current Members</Label>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user?.image || ""} />
                          <AvatarFallback>
                            {member.user?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{member.role}</Badge>
                        {isAdmin && member.userId !== user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.userId)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>
                Manage your billing information and subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Billing section coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 p-6">
          <div>
            <div className="h-9 w-32 mb-2 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md" />
            <div className="h-5 w-80 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md" />
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
