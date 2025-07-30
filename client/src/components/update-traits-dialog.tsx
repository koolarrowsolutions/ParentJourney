import { useState } from "react";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type ChildProfile, type InsertChildProfile } from "@shared/schema";
import { PERSONALITY_TRAITS, getTraitsByAge, getTraitByKey, type PersonalityTrait } from "@shared/personality-traits";
import { Sparkles, Calendar } from "lucide-react";

interface UpdateTraitsDialogProps {
  profile: ChildProfile;
  trigger?: React.ReactNode;
}

export function UpdateTraitsDialog({ profile, trigger }: UpdateTraitsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<string[]>(profile.personalityTraits || []);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertChildProfile>) => {
      const response = await apiRequest("PUT", `/api/child-profiles/${profile.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
      toast({
        title: "Traits Updated! ✨",
        description: `${profile.name}'s personality traits have been updated successfully.`,
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update personality traits. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleTrait = (traitKey: string) => {
    setSelectedTraits(prev => {
      if (prev.includes(traitKey)) {
        return prev.filter(key => key !== traitKey);
      } else if (prev.length < 7) {
        return [...prev, traitKey];
      } else {
        toast({
          title: "Maximum Traits Selected",
          description: "You can select up to 7 personality traits that best describe your child.",
          variant: "destructive",
        });
        return prev;
      }
    });
  };

  const getRelevantTraits = (): PersonalityTrait[] => {
    const today = new Date();
    const birth = new Date(profile.dateOfBirth);
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    
    return getTraitsByAge(Math.max(0, months));
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

  const handleSave = () => {
    updateMutation.mutate({
      personalityTraits: selectedTraits,
    });
  };

  const handleCancel = () => {
    setSelectedTraits(profile.personalityTraits || []);
    setOpen(false);
  };

  // Reset traits when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedTraits(profile.personalityTraits || []);
    }
  }, [open, profile.personalityTraits]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center">
            <Sparkles className="mr-1 h-3 w-3" />
            Update Traits
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            ✨ Update {profile.name}'s Personality Traits
          </DialogTitle>
          <div className="flex items-center text-sm text-neutral-600 mt-2">
            <Calendar className="mr-1 h-3 w-3" />
            <span>Currently {calculateAge(profile.dateOfBirth)}</span>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">📈 Why Update Traits?</h3>
            <p className="text-sm text-blue-800">
              Children's personalities evolve as they grow. Updating traits helps ensure you receive the most relevant 
              developmental insights and parenting suggestions for your child's current stage.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-neutral-800">
                Select Current Traits (up to 7)
              </h3>
              <span className="text-sm text-neutral-600">
                Selected: {selectedTraits.length}/7
              </span>
            </div>

            {selectedTraits.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-neutral-600 mb-2">Currently selected:</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {selectedTraits.map((traitKey) => {
                    const trait = getTraitByKey(traitKey);
                    return trait ? (
                      <Badge
                        key={traitKey}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-red-100"
                        onClick={() => toggleTrait(traitKey)}
                        title="Click to remove"
                      >
                        {trait.emoji} {trait.label} ×
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border border-neutral-200 rounded-lg">
              {getRelevantTraits().map((trait) => (
                <button
                  key={trait.key}
                  type="button"
                  onClick={() => toggleTrait(trait.key)}
                  className={`p-3 rounded-lg border text-left text-sm transition-all hover:border-primary/50 ${
                    selectedTraits.includes(trait.key)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                  title={trait.description}
                >
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">{trait.emoji}</span>
                    <span className="font-medium">{trait.label}</span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2">
                    {trait.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1 bg-primary text-white hover:bg-primary/90"
            >
              {updateMutation.isPending ? "Updating..." : "💾 Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}