import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Search, 
  Plus, 
  Calendar,
  Mail,
  Crown,
  Settings,
  UserPlus,
  ArrowLeft,
  Building,
  Trash2,
  Pause,
  Play,
  Edit,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  churnRate: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  adminNotes: string | null;
  freeAccessGrantedUntil: string | null;
  totalEntries: number;
}

interface FamilyData {
  id: string;
  name: string;
  createdAt: string;
  parentCount: number;
  childCount: number;
  userCount: number;
}

const grantAccessSchema = z.object({
  months: z.number().min(1, "Must be at least 1 month").max(24, "Maximum 24 months"),
});

const addNoteSchema = z.object({
  note: z.string().min(1, "Note cannot be empty").max(500, "Note too long"),
});

const updateRoleSchema = z.object({
  role: z.enum(["user", "admin", "support"], { required_error: "Please select a role" }),
});

const updateSubscriptionSchema = z.object({
  subscriptionStatus: z.enum(["free", "active", "cancelled", "past_due"], { required_error: "Please select a status" }),
  subscriptionEndDate: z.string().optional(),
});

const addParentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.string().min(1, "Relationship is required"),
  age: z.string().optional(),
  parentingStyle: z.string().optional(),
  parentingPhilosophy: z.string().optional(),
  parentingGoals: z.string().optional(),
  notes: z.string().optional(),
});

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<FamilyData | null>(null);
  const [showGrantAccessDialog, setShowGrantAccessDialog] = useState(false);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [showUpdateRoleDialog, setShowUpdateRoleDialog] = useState(false);
  const [showUpdateSubscriptionDialog, setShowUpdateSubscriptionDialog] = useState(false);
  const [showAddParentDialog, setShowAddParentDialog] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [showPauseUserDialog, setShowPauseUserDialog] = useState(false);
  const [newParentId, setNewParentId] = useState<string | null>(null);
  const [showDemoMode, setShowDemoMode] = useState(false);

  // Demo data
  const demoStats = {
    totalUsers: 2847,
    activeSubscriptions: 1523,
    monthlyRevenue: 22845.50,
    newUsersThisMonth: 312,
    churnRate: 4.2
  };

  const demoUsers = [
    {
      id: "demo-1",
      username: "sarah_martinez",
      email: "sarah.martinez@email.com", 
      name: "Sarah Martinez",
      role: "user",
      subscriptionStatus: "active",
      subscriptionEndDate: "2025-12-15",
      freeAccessGrantedUntil: null,
      createdAt: "2024-08-15T14:30:00Z",
      lastLoginAt: "2025-08-05T09:15:00Z",
      totalEntries: 156,
      adminNotes: "Premium user since launch, very engaged with daily journaling"
    },
    {
      id: "demo-2", 
      username: "michael_chen",
      email: "m.chen@gmail.com",
      name: "Michael Chen",
      role: "user",
      subscriptionStatus: "free",
      subscriptionEndDate: null,
      freeAccessGrantedUntil: "2025-10-01",
      createdAt: "2024-11-20T16:45:00Z",
      lastLoginAt: "2025-08-04T18:22:00Z",
      totalEntries: 42,
      adminNotes: "Granted free access during Black Friday promotion"
    },
    {
      id: "demo-3",
      username: "jessica_thompson",
      email: "jess.thompson@yahoo.com",
      name: "Jessica Thompson", 
      role: "user",
      subscriptionStatus: "cancelled",
      subscriptionEndDate: "2025-06-30",
      freeAccessGrantedUntil: null,
      createdAt: "2024-03-10T11:20:00Z",
      lastLoginAt: "2025-06-28T14:10:00Z",
      totalEntries: 89,
      adminNotes: "Cancelled due to pricing concerns, potential re-engagement candidate"
    },
    {
      id: "demo-4",
      username: "david_rodriguez", 
      email: "david.rodriguez@outlook.com",
      name: "David Rodriguez",
      role: "user",
      subscriptionStatus: "active",
      subscriptionEndDate: "2025-09-22",
      freeAccessGrantedUntil: null,
      createdAt: "2024-09-22T13:15:00Z",
      lastLoginAt: "2025-08-05T20:45:00Z",
      totalEntries: 203,
      adminNotes: "Power user, frequently shares feedback and feature requests"
    },
    {
      id: "demo-5",
      username: "emily_wilson",
      email: "emily.wilson@email.com",
      name: "Emily Wilson",
      role: "user", 
      subscriptionStatus: "paused",
      subscriptionEndDate: "2025-08-15",
      freeAccessGrantedUntil: null,
      createdAt: "2024-07-05T09:30:00Z",
      lastLoginAt: "2025-07-20T16:30:00Z",
      totalEntries: 78,
      adminNotes: "Temporarily paused subscription during maternity leave"
    },
    {
      id: "demo-6",
      username: "alex_johnson",
      email: "alex.johnson@gmail.com",
      name: "Alex Johnson",
      role: "moderator",
      subscriptionStatus: "active",
      subscriptionEndDate: "2026-01-01",
      freeAccessGrantedUntil: null,
      createdAt: "2024-01-15T10:00:00Z",
      lastLoginAt: "2025-08-05T22:15:00Z", 
      totalEntries: 312,
      adminNotes: "Community moderator, helps with user support and content moderation"
    },
    {
      id: "demo-7",
      username: "lisa_anderson",
      email: "lisa.anderson@hotmail.com",
      name: "Lisa Anderson",
      role: "user",
      subscriptionStatus: "trial",
      subscriptionEndDate: "2025-08-15",
      freeAccessGrantedUntil: null,
      createdAt: "2025-08-01T12:00:00Z",
      lastLoginAt: "2025-08-05T08:30:00Z",
      totalEntries: 8,
      adminNotes: "New trial user, showing high engagement in first week"
    },
    {
      id: "demo-8",
      username: "robert_taylor",
      email: "r.taylor@email.com", 
      name: "Robert Taylor",
      role: "user",
      subscriptionStatus: "expired",
      subscriptionEndDate: "2025-07-01",
      freeAccessGrantedUntil: null,
      createdAt: "2024-06-01T15:45:00Z",
      lastLoginAt: "2025-07-01T10:15:00Z",
      totalEntries: 67,
      adminNotes: "Subscription expired, hasn't renewed yet but was previously active"
    }
  ];

  const demoFamilies = [
    {
      id: "demo-family-1",
      name: "The Martinez Family",
      parentCount: 2,
      childCount: 3,
      userCount: 2,
      createdAt: "2024-08-15T14:30:00Z"
    },
    {
      id: "demo-family-2", 
      name: "The Chen Family",
      parentCount: 1,
      childCount: 1,
      userCount: 1,
      createdAt: "2024-11-20T16:45:00Z"
    },
    {
      id: "demo-family-3",
      name: "The Thompson Family",
      parentCount: 2,
      childCount: 2,
      userCount: 1,
      createdAt: "2024-03-10T11:20:00Z"
    }
  ];

  // Check if user has admin access
  if (!user || (user.username !== 'esanjosechicano')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch admin statistics (use demo data when in demo mode)
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: showDemoMode ? ["demo", "stats"] : ["/api/admin/stats"],
    queryFn: showDemoMode 
      ? () => Promise.resolve(demoStats) 
      : async ({ queryKey }) => {
          const url = queryKey[0] as string;
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        },
    refetchInterval: showDemoMode ? false : 30000, // Don't refresh in demo mode
    enabled: true, // Ensure query is always enabled
  });

  // Function to filter demo users based on current filters
  const getFilteredDemoUsers = () => {
    let filteredUsers = [...demoUsers];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (filterStatus && filterStatus !== "all") {
      filteredUsers = filteredUsers.filter(user => {
        if (filterStatus === "active") {
          return user.subscriptionStatus === "active" || 
                 (user.freeAccessGrantedUntil && new Date(user.freeAccessGrantedUntil) > new Date());
        }
        return user.subscriptionStatus === filterStatus;
      });
    }
    
    // Apply role filter
    if (filterRole && filterRole !== "all") {
      filteredUsers = filteredUsers.filter(user => user.role === filterRole);
    }
    
    // Apply sorting
    filteredUsers.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];
      
      if (sortBy === "createdAt" || sortBy === "lastLoginAt") {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }
      
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || "";
      }
      
      if (sortOrder === "desc") {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
    
    return filteredUsers;
  };

  // Fetch all users with filters (use demo data when in demo mode)
  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers, error: usersError } = useQuery({
    queryKey: showDemoMode 
      ? ["demo", "users", searchTerm, filterStatus, filterRole, sortBy, sortOrder] 
      : [`/api/admin/users?search=${encodeURIComponent(searchTerm)}&status=${filterStatus}&role=${filterRole}&sortBy=${sortBy}&sortOrder=${sortOrder}`],
    queryFn: showDemoMode 
      ? () => Promise.resolve(getFilteredDemoUsers()) 
      : async ({ queryKey }) => {
          const url = queryKey[0] as string;
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        },
    enabled: true, // Ensure query is always enabled
  });

  // Debug logging
  React.useEffect(() => {
    console.log("Admin Dashboard Debug:", {
      showDemoMode,
      usersLoading,
      usersLength: users?.length,
      usersError,
      queryKey: showDemoMode 
        ? ["demo", "users", searchTerm, filterStatus, filterRole, sortBy, sortOrder] 
        : [`/api/admin/users?search=${encodeURIComponent(searchTerm)}&status=${filterStatus}&role=${filterRole}&sortBy=${sortBy}&sortOrder=${sortOrder}`]
    });
  }, [showDemoMode, usersLoading, users, usersError, searchTerm, filterStatus, filterRole, sortBy, sortOrder]);

  // Fetch all families (use demo data when in demo mode)
  const { data: families = [], isLoading: familiesLoading, refetch: refetchFamilies } = useQuery({
    queryKey: showDemoMode 
      ? ["demo", "families", searchTerm] 
      : [`/api/admin/families?search=${encodeURIComponent(searchTerm)}`],
    queryFn: showDemoMode ? () => {
      const filteredFamilies = searchTerm 
        ? demoFamilies.filter(family => family.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : demoFamilies;
      return Promise.resolve(filteredFamilies);
    } : async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      },
    enabled: true, // Ensure query is always enabled
  });

  // Grant free access mutation
  const grantAccessMutation = useMutation({
    mutationFn: async ({ userId, months }: { userId: string; months: number }) =>
      apiRequest("/api/admin/grant-access", "POST", { userId, months }),
    onSuccess: () => {
      toast({ title: "Success", description: "Free access granted successfully" });
      setShowGrantAccessDialog(false);
      refetchUsers();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to grant access", variant: "destructive" });
    },
  });

  // Add admin note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ userId, note }: { userId: string; note: string }) =>
      apiRequest("/api/admin/add-note", "POST", { userId, note }),
    onSuccess: () => {
      toast({ title: "Success", description: "Note added successfully" });
      setShowAddNoteDialog(false);
      refetchUsers();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add note", variant: "destructive" });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) =>
      apiRequest("/api/admin/update-user-role", "PUT", { userId, role }),
    onSuccess: () => {
      toast({ title: "Success", description: "User role updated successfully" });
      setShowUpdateRoleDialog(false);
      refetchUsers();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update role", variant: "destructive" });
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, subscriptionStatus, subscriptionEndDate }: { 
      userId: string; 
      subscriptionStatus: string; 
      subscriptionEndDate?: string 
    }) =>
      apiRequest("/api/admin/update-subscription", "PUT", { userId, subscriptionStatus, subscriptionEndDate }),
    onSuccess: () => {
      toast({ title: "Success", description: "Subscription updated successfully" });
      setShowUpdateSubscriptionDialog(false);
      refetchUsers();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update subscription", variant: "destructive" });
    },
  });

  // Add parent to family mutation
  const addParentMutation = useMutation({
    mutationFn: async ({ familyId, parentData }: { familyId: string; parentData: any }) =>
      apiRequest("/api/admin/add-parent", "POST", { familyId, parentData }),
    onSuccess: (data: any) => {
      toast({ title: "Success", description: "Parent profile added successfully" });
      setNewParentId(data.parent.id);
      setShowAddParentDialog(false);
      setShowCreateUserDialog(true);
      refetchFamilies();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add parent", variant: "destructive" });
    },
  });

  // Create user for parent mutation
  const createUserMutation = useMutation({
    mutationFn: async ({ parentId, userData }: { parentId: string; userData: any }) =>
      apiRequest("/api/admin/create-user-for-parent", "POST", { parentId, userData }),
    onSuccess: () => {
      toast({ title: "Success", description: "User account created successfully" });
      setShowCreateUserDialog(false);
      setNewParentId(null);
      refetchUsers();
      refetchFamilies();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create user account", variant: "destructive" });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) =>
      apiRequest(`/api/admin/delete-user/${userId}`, "DELETE"),
    onSuccess: () => {
      toast({ title: "Success", description: "User deleted successfully" });
      setShowDeleteUserDialog(false);
      setSelectedUser(null);
      refetchUsers();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    },
  });

  // Pause/unpause user mutation
  const pauseUserMutation = useMutation({
    mutationFn: async ({ userId, paused }: { userId: string; paused: boolean }) =>
      apiRequest("/api/admin/pause-user", "POST", { userId, paused }),
    onSuccess: (_, { paused }) => {
      toast({ 
        title: "Success", 
        description: `User ${paused ? 'paused' : 'unpaused'} successfully` 
      });
      setShowPauseUserDialog(false);
      setSelectedUser(null);
      refetchUsers();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
    },
  });

  // Form configurations
  const grantAccessForm = useForm({
    resolver: zodResolver(grantAccessSchema),
    defaultValues: { months: 1 },
  });

  const addNoteForm = useForm({
    resolver: zodResolver(addNoteSchema),
    defaultValues: { note: "" },
  });

  const updateRoleForm = useForm({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: { role: "user" },
  });

  const updateSubscriptionForm = useForm({
    resolver: zodResolver(updateSubscriptionSchema),
    defaultValues: { subscriptionStatus: "free", subscriptionEndDate: "" },
  });

  const addParentForm = useForm({
    resolver: zodResolver(addParentSchema),
    defaultValues: {
      name: "",
      relationship: "",
      age: "",
      parentingStyle: "",
      parentingPhilosophy: "",
      parentingGoals: "",
      notes: "",
    },
  });

  const createUserForm = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      password: "",
    },
  });

  const handleGrantAccess = (data: z.infer<typeof grantAccessSchema>) => {
    if (selectedUser) {
      grantAccessMutation.mutate({ userId: selectedUser.id, months: data.months });
    }
  };

  const handleAddNote = (data: z.infer<typeof addNoteSchema>) => {
    if (selectedUser) {
      addNoteMutation.mutate({ userId: selectedUser.id, note: data.note });
    }
  };

  const handleUpdateRole = (data: z.infer<typeof updateRoleSchema>) => {
    if (selectedUser) {
      updateRoleMutation.mutate({ userId: selectedUser.id, role: data.role });
    }
  };

  const handleUpdateSubscription = (data: z.infer<typeof updateSubscriptionSchema>) => {
    if (selectedUser) {
      updateSubscriptionMutation.mutate({
        userId: selectedUser.id,
        subscriptionStatus: data.subscriptionStatus,
        subscriptionEndDate: data.subscriptionEndDate,
      });
    }
  };

  const handleAddParent = (data: z.infer<typeof addParentSchema>) => {
    if (selectedFamily) {
      addParentMutation.mutate({ familyId: selectedFamily.id, parentData: data });
    }
  };

  const handleCreateUser = (data: z.infer<typeof createUserSchema>) => {
    if (newParentId) {
      createUserMutation.mutate({ parentId: newParentId, userData: data });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "cancelled": return "destructive";
      case "past_due": return "secondary";
      default: return "outline";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "support": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to App
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Shield className="h-8 w-8 text-orange-500" />
                Admin Dashboard
                {showDemoMode && (
                  <Badge variant="default" className="bg-blue-600 text-white">
                    Demo Mode
                  </Badge>
                )}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {showDemoMode 
                  ? "Viewing demonstration data with fictional users and families"
                  : "Manage users, families, and subscriptions"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowDemoMode(!showDemoMode)}
              variant={showDemoMode ? "default" : "outline"}
              className={showDemoMode ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
              data-testid="button-demo-mode"
            >
              <Users className="mr-2 h-4 w-4" />
              {showDemoMode ? "Exit Demo" : "Demo"}
            </Button>
            <Badge variant="secondary" className="px-3 py-1">
              <Crown className="mr-2 h-4 w-4" />
              Administrator
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.activeSubscriptions || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${statsLoading ? "..." : stats?.monthlyRevenue?.toFixed(2) || "0.00"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users This Month</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.newUsersThisMonth || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : `${stats?.churnRate || 0}%`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="families" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Family Management
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts, subscriptions, and permissions
                </CardDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-user-search"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger data-testid="select-filter-status">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger data-testid="select-filter-role">
                      <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger data-testid="select-sort-by">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Sign Up Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="subscriptionStatus">Status</SelectItem>
                      <SelectItem value="totalEntries">Total Entries</SelectItem>
                      <SelectItem value="lastLoginAt">Last Login</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger data-testid="select-sort-order">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {(users as AdminUser[]).map((user: AdminUser) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{user.name}</h3>
                            <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                            {user.freeAccessGrantedUntil && new Date(user.freeAccessGrantedUntil) > new Date() && (
                              <Badge variant="secondary">Free Access</Badge>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            @{user.username} • {user.email}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                            <span>Joined: {formatDate(user.createdAt)}</span>
                            <span>Last Login: {formatDate(user.lastLoginAt)}</span>
                            <span>Entries: {user.totalEntries}</span>
                            <Badge variant={getStatusBadgeVariant(user.subscriptionStatus)}>
                              {user.subscriptionStatus}
                            </Badge>
                          </div>
                          {user.adminNotes && (
                            <p className="text-xs text-neutral-500 mt-1 bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                              Admin Notes: {user.adminNotes.split('\n').pop()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {showDemoMode ? (
                            <div className="text-sm text-neutral-500 italic bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded">
                              Demo Mode - Actions Disabled
                            </div>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteUserDialog(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`button-delete-user-${user.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowPauseUserDialog(true);
                                }}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                data-testid={`button-pause-user-${user.id}`}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowGrantAccessDialog(true);
                                }}
                                data-testid={`button-grant-access-${user.id}`}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Grant Access
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowAddNoteDialog(true);
                                }}
                                data-testid={`button-add-note-${user.id}`}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Add Note
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  updateRoleForm.setValue("role", user.role as any);
                                  setShowUpdateRoleDialog(true);
                                }}
                                data-testid={`button-update-role-${user.id}`}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Update Role
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  updateSubscriptionForm.setValue("subscriptionStatus", user.subscriptionStatus as any);
                                  updateSubscriptionForm.setValue(
                                    "subscriptionEndDate",
                                    user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toISOString().split('T')[0] : ""
                                  );
                                  setShowUpdateSubscriptionDialog(true);
                                }}
                                data-testid={`button-update-subscription-${user.id}`}
                              >
                                <Calendar className="h-4 w-4 mr-1" />
                                Update Subscription
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {(users as AdminUser[]).length === 0 && (
                      <div className="text-center py-8 text-neutral-500">
                        No users found matching your search criteria.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Families Tab */}
          <TabsContent value="families" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Family Management</CardTitle>
                <CardDescription>
                  Manage family structures and add additional parent profiles
                </CardDescription>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                    <Input
                      placeholder="Search families by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {familiesLoading ? (
                  <div className="text-center py-8">Loading families...</div>
                ) : (
                  <div className="space-y-4">
                    {(families as FamilyData[]).map((family: FamilyData) => (
                      <div
                        key={family.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="h-5 w-5 text-orange-500" />
                            <h3 className="font-medium">{family.name}</h3>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                            <span>Created: {formatDate(family.createdAt)}</span>
                            <span>Parents: {family.parentCount}</span>
                            <span>Children: {family.childCount}</span>
                            <span>Users: {family.userCount}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFamily(family);
                              addParentForm.reset();
                              setShowAddParentDialog(true);
                            }}
                            disabled={family.parentCount >= 6}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Parent {family.parentCount >= 6 && "(Max Reached)"}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(families as FamilyData[]).length === 0 && (
                      <div className="text-center py-8 text-neutral-500">
                        No families found matching your search criteria.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Grant Access Dialog */}
        <Dialog open={showGrantAccessDialog} onOpenChange={setShowGrantAccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Free Access</DialogTitle>
              <DialogDescription>
                Grant free premium access to {selectedUser?.name} for a specified period.
              </DialogDescription>
            </DialogHeader>
            <Form {...grantAccessForm}>
              <form onSubmit={grantAccessForm.handleSubmit(handleGrantAccess)} className="space-y-4">
                <FormField
                  control={grantAccessForm.control}
                  name="months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Months</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="24"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowGrantAccessDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={grantAccessMutation.isPending}>
                    {grantAccessMutation.isPending ? "Granting..." : "Grant Access"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Admin Note</DialogTitle>
              <DialogDescription>
                Add a note for {selectedUser?.name} that will be visible to administrators.
              </DialogDescription>
            </DialogHeader>
            <Form {...addNoteForm}>
              <form onSubmit={addNoteForm.handleSubmit(handleAddNote)} className="space-y-4">
                <FormField
                  control={addNoteForm.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter admin note..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddNoteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addNoteMutation.isPending}>
                    {addNoteMutation.isPending ? "Adding..." : "Add Note"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Update Role Dialog */}
        <Dialog open={showUpdateRoleDialog} onOpenChange={setShowUpdateRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update User Role</DialogTitle>
              <DialogDescription>
                Change the role for {selectedUser?.name}.
              </DialogDescription>
            </DialogHeader>
            <Form {...updateRoleForm}>
              <form onSubmit={updateRoleForm.handleSubmit(handleUpdateRole as any)} className="space-y-4">
                <FormField
                  control={updateRoleForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpdateRoleDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateRoleMutation.isPending}>
                    {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Update Subscription Dialog */}
        <Dialog open={showUpdateSubscriptionDialog} onOpenChange={setShowUpdateSubscriptionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Subscription</DialogTitle>
              <DialogDescription>
                Update subscription status for {selectedUser?.name}.
              </DialogDescription>
            </DialogHeader>
            <Form {...updateSubscriptionForm}>
              <form onSubmit={updateSubscriptionForm.handleSubmit(handleUpdateSubscription as any)} className="space-y-4">
                <FormField
                  control={updateSubscriptionForm.control}
                  name="subscriptionStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="past_due">Past Due</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateSubscriptionForm.control}
                  name="subscriptionEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpdateSubscriptionDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateSubscriptionMutation.isPending}>
                    {updateSubscriptionMutation.isPending ? "Updating..." : "Update Subscription"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Parent Dialog */}
        <Dialog open={showAddParentDialog} onOpenChange={setShowAddParentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Parent to Family</DialogTitle>
              <DialogDescription>
                Add a new parent profile to {selectedFamily?.name}. After creating the profile, you'll be able to create a user account for them.
              </DialogDescription>
            </DialogHeader>
            <Form {...addParentForm}>
              <form onSubmit={addParentForm.handleSubmit(handleAddParent)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addParentForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter parent's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addParentForm.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Partner">Partner</SelectItem>
                            <SelectItem value="Co-parent">Co-parent</SelectItem>
                            <SelectItem value="Step-parent">Step-parent</SelectItem>
                            <SelectItem value="Guardian">Guardian</SelectItem>
                            <SelectItem value="Grandparent">Grandparent</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={addParentForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter age (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addParentForm.control}
                  name="parentingStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parenting Style</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Authoritative, Permissive, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addParentForm.control}
                  name="parentingPhilosophy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parenting Philosophy</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe their approach to parenting..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addParentForm.control}
                  name="parentingGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parenting Goals</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What they hope to achieve as a parent..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addParentForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddParentDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addParentMutation.isPending}>
                    {addParentMutation.isPending ? "Adding..." : "Add Parent"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create User Account</DialogTitle>
              <DialogDescription>
                Create a user account for the newly added parent profile.
              </DialogDescription>
            </DialogHeader>
            <Form {...createUserForm}>
              <form onSubmit={createUserForm.handleSubmit(handleCreateUser)} className="space-y-4">
                <FormField
                  control={createUserForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createUserForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createUserForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createUserForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateUserDialog(false)}
                  >
                    Skip for Now
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete User Account
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the user account and all associated data.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                  <p className="font-medium">User to delete:</p>
                  <p className="text-sm">{selectedUser.name} (@{selectedUser.username})</p>
                  <p className="text-sm text-neutral-600">{selectedUser.email}</p>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowDeleteUserDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => deleteUserMutation.mutate(selectedUser.id)}
                    disabled={deleteUserMutation.isPending}
                    data-testid="button-confirm-delete-user"
                  >
                    {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Pause User Dialog */}
        <Dialog open={showPauseUserDialog} onOpenChange={setShowPauseUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-orange-600 flex items-center gap-2">
                <Pause className="h-5 w-5" />
                Pause/Unpause User Access
              </DialogTitle>
              <DialogDescription>
                Temporarily suspend or restore user access to the application.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                  <p className="font-medium">User to modify:</p>
                  <p className="text-sm">{selectedUser.name} (@{selectedUser.username})</p>
                  <p className="text-sm text-neutral-600">{selectedUser.email}</p>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowPauseUserDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => pauseUserMutation.mutate({ userId: selectedUser.id, paused: false })}
                    disabled={pauseUserMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-unpause-user"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {pauseUserMutation.isPending ? "Unpausing..." : "Unpause User"}
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => pauseUserMutation.mutate({ userId: selectedUser.id, paused: true })}
                    disabled={pauseUserMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700"
                    data-testid="button-pause-user"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    {pauseUserMutation.isPending ? "Pausing..." : "Pause User"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}