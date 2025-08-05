import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Search,
  UserCheck,
  UserX,
  Gift,
  MessageSquare
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  createdAt: Date;
  lastLoginAt?: Date;
  subscriptionStatus: 'free' | 'active' | 'cancelled' | 'past_due';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  totalEntries: number;
  adminNotes?: string;
}

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  churnRate: number;
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home page if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Don't render anything while redirecting
  if (!isLoading && !isAuthenticated) {
    return null;
  }

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch admin stats');
      return response.json() as Promise<AdminStats>;
    },
    enabled: isAuthenticated // Only fetch when authenticated
  });

  // Fetch users list
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users', searchTerm],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/users?search=${searchTerm}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json() as Promise<AdminUser[]>;
    },
    enabled: isAuthenticated // Only fetch when authenticated
  });

  // Grant free access mutation
  const grantAccessMutation = useMutation({
    mutationFn: async ({ userId, months }: { userId: string; months: number }) => {
      const response = await apiRequest('POST', '/api/admin/grant-access', { userId, months });
      if (!response.ok) throw new Error('Failed to grant access');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Free access granted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  // Add admin note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ userId, note }: { userId: string; note: string }) => {
      const response = await apiRequest('POST', '/api/admin/add-note', { userId, note });
      if (!response.ok) throw new Error('Failed to add note');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Note added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      free: "secondary",
      active: "default",
      cancelled: "destructive",
      past_due: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, subscriptions, and monitor platform health</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold">${stats?.monthlyRevenue || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Users (Month)</p>
                  <p className="text-2xl font-bold">{stats?.newUsersThisMonth || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                  <p className="text-2xl font-bold">{stats?.churnRate || 0}%</p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div>Loading users...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Entries</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getStatusBadge(user.subscriptionStatus)}</TableCell>
                          <TableCell>{user.totalEntries}</TableCell>
                          <TableCell>{format(new Date(user.createdAt), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedUser(user)}
                                  >
                                    <Gift className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Grant Free Access</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p>Grant free premium access to {user.name}?</p>
                                    <div className="flex space-x-2">
                                      <Button 
                                        onClick={() => grantAccessMutation.mutate({ userId: user.id, months: 1 })}
                                        disabled={grantAccessMutation.isPending}
                                      >
                                        1 Month
                                      </Button>
                                      <Button 
                                        onClick={() => grantAccessMutation.mutate({ userId: user.id, months: 3 })}
                                        disabled={grantAccessMutation.isPending}
                                      >
                                        3 Months
                                      </Button>
                                      <Button 
                                        onClick={() => grantAccessMutation.mutate({ userId: user.id, months: 12 })}
                                        disabled={grantAccessMutation.isPending}
                                      >
                                        1 Year
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Admin Note</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Input 
                                      placeholder="Add a note about this user..."
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const note = (e.target as HTMLInputElement).value;
                                          if (note.trim()) {
                                            addNoteMutation.mutate({ userId: user.id, note });
                                            (e.target as HTMLInputElement).value = '';
                                          }
                                        }
                                      }}
                                    />
                                    {user.adminNotes && (
                                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                        Previous notes: {user.adminNotes}
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Subscription Management</h3>
                <p className="text-gray-600">
                  Payment integration will be available once Stripe and PayPal API keys are configured.
                  This section will show:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-1 text-gray-600">
                  <li>Active subscription details</li>
                  <li>Payment history and transactions</li>
                  <li>Failed payment recovery</li>
                  <li>Refund processing</li>
                  <li>Subscription cancellation management</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Analytics & Insights</h3>
                <p className="text-gray-600">
                  Advanced analytics will include:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-1 text-gray-600">
                  <li>Revenue trends and forecasting</li>
                  <li>User engagement metrics</li>
                  <li>Feature adoption rates</li>
                  <li>Churn analysis and predictions</li>
                  <li>Lifetime value calculations</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Platform Settings</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Payment Configuration</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure pricing tiers and payment methods when ready.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Feature Flags</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Enable/disable features for different user tiers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Email Templates</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Customize automated emails for subscriptions and notifications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}