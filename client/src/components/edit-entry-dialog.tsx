import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit2, Loader2 } from "lucide-react";
import type { JournalEntry, ChildProfile, JournalEntryWithAi } from "@shared/schema";
import { insertJournalEntrySchema } from "@shared/schema";
import { z } from "zod";

interface EditEntryDialogProps {
  entry: JournalEntry;
  trigger?: React.ReactNode;
}

const moodOptions = [
  { value: "😊", label: "😊 Happy" },
  { value: "😄", label: "😄 Joyful" },
  { value: "🥰", label: "🥰 Loving" },
  { value: "😌", label: "😌 Peaceful" },
  { value: "🤗", label: "🤗 Grateful" },
  { value: "😔", label: "😔 Sad" },
  { value: "😰", label: "😰 Anxious" },
  { value: "😤", label: "😤 Frustrated" },
];

export function EditEntryDialog({ entry, trigger }: EditEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
      // Get auth token for authenticated requests
      const token = localStorage.getItem('parentjourney_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/child-profiles", {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch profiles");
      return response.json();
    },
  });

  const editSchema = insertJournalEntrySchema.extend({
    requestAiFeedback: z.boolean().default(false),
  });

  const form = useForm<JournalEntryWithAi>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: entry.title || "",
      content: entry.content,
      mood: entry.mood || "",
      childProfileId: entry.childProfileId || "",
      requestAiFeedback: false,
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: Partial<JournalEntryWithAi>) => {
      const { requestAiFeedback, ...updateData } = data;
      
      // Get auth token for authenticated requests
      const token = localStorage.getItem('parentjourney_token');
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/journal-entries/${entry.id}`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/journal-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mood-analytics"] });
      setOpen(false);
      form.reset();
      toast({
        title: "✅ Entry Updated!",
        description: "Your journal entry has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Update Failed",
        description: error.message || "Failed to update entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JournalEntryWithAi) => {
    editMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neutral-800 flex items-center">
            <Edit2 className="mr-2 h-5 w-5 text-primary" />
            ✏️ Edit Journal Entry
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">
                    📝 Entry Title (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Give your entry a memorable title..."
                      className="border-neutral-200 focus:border-primary"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content Field */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">
                    💭 Your Thoughts *
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Update your parenting journey, challenges, victories, or reflections..."
                      className="min-h-[120px] border-neutral-200 focus:border-primary resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Two-column layout for smaller fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mood Field */}
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      😊 How are you feeling?
                    </FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="border-neutral-200 focus:border-primary">
                          <SelectValue placeholder="Select your mood" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No mood selected</SelectItem>
                        {moodOptions.map((mood) => (
                          <SelectItem key={mood.value} value={mood.value}>
                            {mood.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Child Profile Field */}
              <FormField
                control={form.control}
                name="childProfileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      👶 About which child?
                    </FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="border-neutral-200 focus:border-primary">
                          <SelectValue placeholder="Select a child" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">General parenting entry</SelectItem>
                        {childProfiles?.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* AI Feedback Field */}
            <FormField
              control={form.control}
              name="requestAiFeedback"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-neutral-200 p-4 bg-neutral-50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium text-neutral-700">
                      🤖 Get AI Feedback
                    </FormLabel>
                    <p className="text-xs text-neutral-500">
                      Request personalized parenting insights and suggestions
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={editMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={editMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {editMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                💾 Update Entry
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}