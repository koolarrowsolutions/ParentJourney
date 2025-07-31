import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, MessageSquare, User, Calendar, Clock } from "lucide-react";
import { JournalEntry } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface JournalEntryCardProps {
  entry: JournalEntry;
  showChildInfo?: boolean;
  onEdit?: (entry: JournalEntry) => void;
}

export function JournalEntryCard({ entry, showChildInfo = true, onEdit }: JournalEntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/journal-entries/${entry.id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Entry Deleted",
        description: "Your journal entry has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const getContentPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Card className="shadow-sm border border-neutral-200 hover-lift transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {entry.title && (
              <h3 className="font-semibold text-neutral-800 mb-2 line-clamp-2">
                {entry.title}
              </h3>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-neutral-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(entry.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(entry.createdAt), 'h:mm a')}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {entry.mood && (
                <Badge variant="outline" className="text-xs">
                  {entry.mood}
                </Badge>
              )}
              
              {entry.hasAiFeedback && entry.aiFeedback && (
                <Badge variant="secondary" className="text-xs">
                  🤖 AI Feedback
                </Badge>
              )}

              {entry.childProfileId && showChildInfo && (
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Child Profile
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(entry)}
                className="hover-scale"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-red-600 hover:text-red-700 hover-scale"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Content */}
        <div className="mb-4">
          <p className="text-neutral-700 whitespace-pre-wrap">
            {isExpanded ? entry.content : getContentPreview(entry.content)}
          </p>
          
          {entry.content.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 p-0 h-auto text-sm text-primary hover:text-primary/80"
            >
              {isExpanded ? "Show less" : "Read more"}
            </Button>
          )}
        </div>

        {/* AI Feedback */}
        {entry.aiFeedback && isExpanded && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">🤖 AI Insights</span>
            </div>
            <div className="text-sm text-blue-700 whitespace-pre-wrap">
              {entry.aiFeedback}
            </div>
          </div>
        )}

        {/* Developmental Insight */}
        {entry.developmentalInsight && isExpanded && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-3 animate-fade-in">
            <div className="flex items-center mb-2">
              <User className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-800">👶 Developmental Insights</span>
            </div>
            <div className="text-sm text-purple-700 whitespace-pre-wrap">
              {entry.developmentalInsight}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}