import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertChildProfileSchema, type InsertChildProfile, type ChildProfile } from "@shared/schema";
import { Users, Plus, Edit, Trash2, Baby, Calendar, User } from "lucide-react";

interface ChildProfileDialogProps {
  trigger?: React.ReactNode;
  editProfile?: ChildProfile;
  onClose?: () => void;
}

function ChildProfileForm({ editProfile, onSuccess }: { editProfile?: ChildProfile; onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertChildProfile>({
    resolver: zodResolver(insertChildProfileSchema),
    defaultValues: {
      name: editProfile?.name || "",
      dateOfBirth: editProfile?.dateOfBirth || "",
      gender: editProfile?.gender || "",
      notes: editProfile?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertChildProfile) => {
      const response = await apiRequest("POST", "/api/child-profiles", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      toast({
        title: "Profile Created! 👶",
        description: "Your child's profile has been saved successfully.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create child profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertChildProfile) => {
      const response = await apiRequest("PUT", `/api/child-profiles/${editProfile!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      toast({
        title: "Profile Updated! ✨",
        description: "Your child's profile has been updated successfully.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update child profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertChildProfile) => {
    if (editProfile) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "";
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`;
    }
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} old`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-neutral-700">
                👶 Child's Name <span className="text-red-400">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your child's name..."
                  className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-neutral-700">
                🎂 Date of Birth <span className="text-red-400">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                  {...field}
                />
              </FormControl>
              {field.value && (
                <p className="text-xs text-neutral-500">
                  Currently {calculateAge(field.value)}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-neutral-700">
                ⚤ Gender <span className="text-neutral-400">(optional)</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="border-neutral-200 focus:ring-2 focus:ring-primary">
                    <SelectValue placeholder="Select gender..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">👦 Boy</SelectItem>
                  <SelectItem value="female">👧 Girl</SelectItem>
                  <SelectItem value="other">🌈 Other</SelectItem>
                  <SelectItem value="not_specified">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-neutral-700">
                📝 Notes <span className="text-neutral-400">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Any special notes about your child's personality, interests, developmental milestones, or anything you'd like to remember..."
                  className="border-neutral-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-primary text-white hover:bg-primary/90"
          >
            {editProfile ? "💾 Update Profile" : "➕ Add Child Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function ChildProfilesDialog({ trigger, editProfile, onClose }: ChildProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ChildProfile | undefined>(editProfile);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/child-profiles");
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/child-profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      toast({
        title: "Profile Deleted",
        description: "The child profile has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setOpen(false);
    setSelectedProfile(undefined);
    onClose?.();
  };

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`;
    }
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} old`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            👶 My Children
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Users className="mr-2 h-5 w-5 text-primary" />
            👪 Manage Child Profiles
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          <Card className="border border-neutral-200">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-neutral-800 mb-4">
                {selectedProfile ? "✏️ Edit Profile" : "➕ Add New Child"}
              </h3>
              <ChildProfileForm
                editProfile={selectedProfile}
                onSuccess={() => {
                  setSelectedProfile(undefined);
                  if (editProfile) handleClose();
                }}
              />
              {selectedProfile && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedProfile(undefined)}
                  className="mt-4"
                >
                  Cancel Edit
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Existing Profiles */}
          <div>
            <h3 className="text-lg font-medium text-neutral-800 mb-4">
              📋 Your Children
            </h3>
            {isLoading ? (
              <div className="text-center py-8 text-neutral-500">
                Loading profiles...
              </div>
            ) : profiles && profiles.length > 0 ? (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <Card key={profile.id} className="border border-neutral-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Baby className="mr-2 h-4 w-4 text-primary" />
                            <h4 className="font-medium text-neutral-800">
                              {profile.name}
                            </h4>
                            {profile.gender && (
                              <span className="ml-2 text-sm text-neutral-500">
                                {profile.gender === "male" ? "👦" : profile.gender === "female" ? "👧" : "🌈"}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-neutral-600 mb-2">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span>{calculateAge(profile.dateOfBirth)}</span>
                          </div>
                          {profile.notes && (
                            <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                              {profile.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProfile(profile)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(profile.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <Baby className="mx-auto h-12 w-12 mb-4 text-neutral-300" />
                <p>👶 No child profiles yet.</p>
                <p className="text-sm">Add your first child profile above to get personalized developmental insights!</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}