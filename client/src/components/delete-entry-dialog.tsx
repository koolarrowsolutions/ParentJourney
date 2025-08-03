import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Loader2 } from "lucide-react";
import type { JournalEntry } from "@shared/schema";

interface DeleteEntryDialogProps {
  entry: JournalEntry;
  trigger?: React.ReactNode;
}

export function DeleteEntryDialog({ entry, trigger }: DeleteEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Get auth token for authenticated requests
      const token = localStorage.getItem('parentjourney_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/journal-entries/${entry.id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/journal-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mood-analytics"] });
      setOpen(false);
      toast({
        title: "🗑️ Entry Deleted",
        description: "Your journal entry has been permanently deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Delete Failed",
        description: error.message || "Failed to delete entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-neutral-800 flex items-center">
            <Trash2 className="mr-2 h-5 w-5 text-red-500" />
            🗑️ Delete Journal Entry
          </AlertDialogTitle>
          <AlertDialogDescription className="text-neutral-600">
            Are you sure you want to delete this journal entry? This action cannot be undone and will permanently remove:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <h4 className="font-medium text-neutral-800 mb-2">
              📝 {entry.title || "Untitled Entry"}
            </h4>
            <p className="text-sm text-neutral-600 line-clamp-3 mb-2">
              {entry.content.substring(0, 150)}
              {entry.content.length > 150 ? "..." : ""}
            </p>
            <div className="flex items-center text-xs text-neutral-500 space-x-4">
              {entry.mood && (
                <span className="flex items-center">
                  {entry.mood} Mood tracked
                </span>
              )}
              {entry.aiFeedback && (
                <span>🤖 AI feedback included</span>
              )}
              <span>📅 {new Date(entry.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            🗑️ Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}