import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ChildProfile } from "@shared/schema";
import { 
  getAgeAppropriateMilestones, 
  getMilestoneStatus, 
  calculateAgeInMonths,
  formatAgeRange,
  getCategoryEmoji,
  getStatusColor,
  type Milestone
} from "@/utils/age-appropriate-milestones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Trophy, Plus, Check, Clock, Gift, Target, Baby } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MilestoneTracking() {
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [customMilestones, setCustomMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    category: "physical" as Milestone['category'],
    ageMin: 12,
    ageMax: 18
  });
  
  const { toast } = useToast();
  
  // Fetch child profiles
  const { data: childProfiles = [] } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    queryFn: async () => {
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
    enabled: !!localStorage.getItem('parentjourney_token'), // Only fetch when authenticated
    staleTime: 60000, // Cache for 1 minute
    retry: false // Don't retry on auth failures
  });

  // Get selected child data
  const selectedChildData = childProfiles.find(child => child.id === selectedChild);
  
  // Get age-appropriate milestones for selected child
  const ageAppropriateMilestones = selectedChildData 
    ? getAgeAppropriateMilestones(selectedChildData.dateOfBirth, customMilestones)
    : [];

  const handleToggleMilestone = (milestoneId: string) => {
    const newCompleted = new Set(completedMilestones);
    if (newCompleted.has(milestoneId)) {
      newCompleted.delete(milestoneId);
    } else {
      newCompleted.add(milestoneId);
    }
    setCompletedMilestones(newCompleted);
    
    toast({
      title: newCompleted.has(milestoneId) ? "Milestone Completed! 🎉" : "Milestone Unchecked",
      description: newCompleted.has(milestoneId) 
        ? "Great job celebrating this achievement!" 
        : "Milestone has been unmarked as completed.",
    });
  };

  const handleAddCustomMilestone = () => {
    if (!newMilestone.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a milestone title",
        variant: "destructive"
      });
      return;
    }

    const customMilestone: Milestone = {
      id: `custom-${Date.now()}`,
      title: newMilestone.title,
      description: newMilestone.description,
      ageRange: { min: newMilestone.ageMin, max: newMilestone.ageMax },
      category: newMilestone.category,
      priority: 'medium',
      isCustom: true
    };

    setCustomMilestones(prev => [...prev, customMilestone]);
    setNewMilestone({
      title: "",
      description: "",
      category: "physical",
      ageMin: 12,
      ageMax: 18
    });
    setShowAddMilestone(false);
    
    toast({
      title: "Custom Milestone Added!",
      description: "Your custom milestone has been added to the tracking list.",
    });
  };

  if (childProfiles.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <Baby className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Children Added Yet</h3>
          <p className="text-neutral-500 mb-6">Add child profiles to start tracking developmental milestones</p>
          <Button variant="outline">Add Child Profile</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Child Selection */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Target className="h-5 w-5" />
            Choose Child to Track
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="bg-white border-blue-200">
              <SelectValue placeholder="Select a child to track milestones" />
            </SelectTrigger>
            <SelectContent>
              {childProfiles.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name} ({calculateAgeInMonths(child.dateOfBirth)} months old)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedChildData && (
        <>
          {/* Child Info & Progress Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Trophy className="h-5 w-5" />
                {selectedChildData.name}'s Milestone Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {calculateAgeInMonths(selectedChildData.dateOfBirth)} months
                  </div>
                  <div className="text-sm text-green-600">Current Age</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {completedMilestones.size}
                  </div>
                  <div className="text-sm text-blue-600">Completed Milestones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">
                    {ageAppropriateMilestones.length}
                  </div>
                  <div className="text-sm text-purple-600">Available Milestones</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Custom Milestone */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-neutral-800">Age-Appropriate Milestones</h2>
            <Dialog open={showAddMilestone} onOpenChange={setShowAddMilestone}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Milestone
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Custom Milestone</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Title</label>
                    <Input
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter milestone title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Description</label>
                    <Textarea
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the milestone"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Category</label>
                    <Select 
                      value={newMilestone.category} 
                      onValueChange={(value: Milestone['category']) => 
                        setNewMilestone(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical">🏃‍♂️ Physical</SelectItem>
                        <SelectItem value="cognitive">🧠 Cognitive</SelectItem>
                        <SelectItem value="social">👥 Social</SelectItem>
                        <SelectItem value="emotional">💕 Emotional</SelectItem>
                        <SelectItem value="language">🗣️ Language</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700">Min Age (months)</label>
                      <Input
                        type="number"
                        value={newMilestone.ageMin}
                        onChange={(e) => setNewMilestone(prev => ({ ...prev, ageMin: parseInt(e.target.value) || 12 }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700">Max Age (months)</label>
                      <Input
                        type="number"
                        value={newMilestone.ageMax}
                        onChange={(e) => setNewMilestone(prev => ({ ...prev, ageMax: parseInt(e.target.value) || 18 }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddCustomMilestone} className="flex-1">
                      Add Milestone
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddMilestone(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Milestones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ageAppropriateMilestones.map((milestone) => {
              const isCompleted = completedMilestones.has(milestone.id);
              const childAge = calculateAgeInMonths(selectedChildData.dateOfBirth);
              const status = getMilestoneStatus(milestone, childAge);
              const statusColor = getStatusColor(status);

              return (
                <Card 
                  key={milestone.id} 
                  className={`transition-all duration-300 hover:shadow-md cursor-pointer ${
                    isCompleted ? 'ring-2 ring-green-400 bg-green-50' : 'hover:ring-2 hover:ring-blue-200'
                  }`}
                  onClick={() => handleToggleMilestone(milestone.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryEmoji(milestone.category)}</span>
                        <Badge className={`text-xs ${statusColor}`}>
                          {status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {milestone.isCustom && (
                          <Star className="h-3 w-3 text-amber-500" />
                        )}
                        {isCompleted ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-neutral-400" />
                        )}
                      </div>
                    </div>
                    
                    <h3 className={`font-semibold mb-1 ${isCompleted ? 'text-green-800' : 'text-neutral-800'}`}>
                      {milestone.title}
                    </h3>
                    
                    <p className={`text-sm mb-2 ${isCompleted ? 'text-green-700' : 'text-neutral-600'}`}>
                      {milestone.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${isCompleted ? 'text-green-600' : 'text-neutral-500'}`}>
                        Age: {formatAgeRange(milestone.ageRange)}
                      </span>
                      <span className={`capitalize ${isCompleted ? 'text-green-600' : 'text-neutral-500'}`}>
                        {milestone.priority} priority
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {ageAppropriateMilestones.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Gift className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Milestones Available</h3>
                <p className="text-neutral-500">Add custom milestones to start tracking your child's progress</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}