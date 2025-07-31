import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Star, Trophy, Calendar as CalendarIcon, Plus, Check, Clock, Gift } from "lucide-react";
import { ChildProfile } from "@shared/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: string;
  childId: string;
  title: string;
  description: string;
  category: string;
  targetAge: number; // in months
  isCompleted: boolean;
  completedDate?: string;
  notes?: string;
  isCustom: boolean;
}

const MILESTONE_CATEGORIES = [
  { value: "physical", label: "🏃 Physical Development", emoji: "🏃" },
  { value: "cognitive", label: "🧠 Cognitive Development", emoji: "🧠" },
  { value: "social", label: "👥 Social & Emotional", emoji: "👥" },
  { value: "language", label: "💬 Language & Communication", emoji: "💬" },
  { value: "creative", label: "🎨 Creative & Artistic", emoji: "🎨" },
  { value: "academic", label: "📚 Academic & Learning", emoji: "📚" },
  { value: "personal", label: "⭐ Personal Achievement", emoji: "⭐" }
];

const DEFAULT_MILESTONES = [
  // 0-6 months
  { title: "First Smile", category: "social", targetAge: 2, description: "Social smile in response to others" },
  { title: "Holds Head Up", category: "physical", targetAge: 3, description: "Can hold head steady when upright" },
  { title: "Rolls Over", category: "physical", targetAge: 4, description: "Rolls from tummy to back or back to tummy" },
  { title: "Sits Without Support", category: "physical", targetAge: 6, description: "Can sit up without being held" },
  
  // 6-12 months
  { title: "First Words", category: "language", targetAge: 9, description: "Says first meaningful words like 'mama' or 'dada'" },
  { title: "Crawls", category: "physical", targetAge: 8, description: "Moves around by crawling" },
  { title: "Stands Up", category: "physical", targetAge: 10, description: "Pulls self up to standing position" },
  { title: "First Steps", category: "physical", targetAge: 12, description: "Takes first independent steps" },
  
  // 1-2 years
  { title: "Says 10+ Words", category: "language", targetAge: 15, description: "Has vocabulary of 10 or more words" },
  { title: "Walks Confidently", category: "physical", targetAge: 15, description: "Walks without falling frequently" },
  { title: "Plays Pretend", category: "cognitive", targetAge: 18, description: "Engages in pretend play activities" },
  { title: "Follows Simple Instructions", category: "cognitive", targetAge: 18, description: "Can follow one-step instructions" },
  
  // 2-3 years
  { title: "Potty Training", category: "personal", targetAge: 30, description: "Successfully uses the potty" },
  { title: "Speaks in Sentences", category: "language", targetAge: 24, description: "Uses 2-3 word sentences regularly" },
  { title: "Shares with Others", category: "social", targetAge: 30, description: "Willingly shares toys with friends" },
  { title: "Rides Tricycle", category: "physical", targetAge: 36, description: "Can pedal and steer a tricycle" },
  
  // 3-5 years
  { title: "Writes Own Name", category: "academic", targetAge: 48, description: "Can write their name independently" },
  { title: "Counts to 10", category: "academic", targetAge: 42, description: "Can count from 1 to 10" },
  { title: "Makes Friends", category: "social", targetAge: 48, description: "Forms friendships with peers" },
  { title: "Tells Stories", category: "language", targetAge: 48, description: "Can tell simple stories about events" },
  
  // 5+ years
  { title: "Reads Simple Books", category: "academic", targetAge: 60, description: "Can read age-appropriate books" },
  { title: "Rides Bicycle", category: "physical", targetAge: 72, description: "Rides a two-wheel bicycle" },
  { title: "Shows Empathy", category: "social", targetAge: 60, description: "Demonstrates understanding of others' feelings" },
  { title: "Completes Chores", category: "personal", targetAge: 72, description: "Takes responsibility for simple household tasks" }
];

export function MilestoneTracking() {
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [completedDate, setCompletedDate] = useState<Date | undefined>(new Date());
  const [completionNotes, setCompletionNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
  });

  // Mock milestone data - in real app, this would come from an API
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const initializeMilestones = (childId: string, ageInMonths: number) => {
    const relevantMilestones = DEFAULT_MILESTONES
      .filter(m => m.targetAge <= ageInMonths + 12) // Show milestones up to 12 months ahead
      .map(m => ({
        id: `${childId}-${m.title.replace(/\s+/g, '-').toLowerCase()}`,
        childId,
        title: m.title,
        description: m.description,
        category: m.category,
        targetAge: m.targetAge,
        isCompleted: false,
        isCustom: false
      }));
    
    setMilestones(prev => [
      ...prev.filter(existing => existing.childId !== childId),
      ...relevantMilestones
    ]);
  };

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    return Math.max(0, months);
  };

  const getSelectedChildMilestones = () => {
    if (!selectedChild) return [];
    
    const child = childProfiles?.find(c => c.id === selectedChild);
    if (!child) return [];
    
    const ageInMonths = calculateAge(child.dateOfBirth);
    const childMilestones = milestones.filter(m => m.childId === selectedChild);
    
    // Initialize milestones if none exist for this child
    if (childMilestones.length === 0) {
      initializeMilestones(selectedChild, ageInMonths);
      return milestones.filter(m => m.childId === selectedChild);
    }
    
    return childMilestones;
  };

  const markMilestoneComplete = (milestoneId: string) => {
    setMilestones(prev => prev.map(m => 
      m.id === milestoneId 
        ? { ...m, isCompleted: true, completedDate: new Date().toISOString(), notes: completionNotes }
        : m
    ));
    
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      toast({
        title: "🎉 Milestone Achieved!",
        description: `Congratulations! ${milestone.title} has been completed.`,
      });
    }
    
    setCompletionNotes("");
  };

  const addCustomMilestone = (data: { title: string; description: string; category: string; targetAge: number }) => {
    const newMilestone: Milestone = {
      id: `${selectedChild}-custom-${Date.now()}`,
      childId: selectedChild,
      title: data.title,
      description: data.description,
      category: data.category,
      targetAge: data.targetAge,
      isCompleted: false,
      isCustom: true
    };
    
    setMilestones(prev => [...prev, newMilestone]);
    setShowAddMilestone(false);
    
    toast({
      title: "Custom Milestone Added!",
      description: `"${data.title}" has been added to the milestone tracker.`,
    });
  };

  const getMilestoneStatus = (milestone: Milestone, currentAge: number) => {
    if (milestone.isCompleted) return "completed";
    if (currentAge >= milestone.targetAge) return "due";
    if (currentAge >= milestone.targetAge - 3) return "upcoming";
    return "future";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "due": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "upcoming": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check className="h-4 w-4" />;
      case "due": return <Trophy className="h-4 w-4" />;
      case "upcoming": return <Clock className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const selectedChildData = childProfiles?.find(c => c.id === selectedChild);
  const currentAge = selectedChildData ? calculateAge(selectedChildData.dateOfBirth) : 0;
  const childMilestones = getSelectedChildMilestones();

  // Group milestones by status
  const groupedMilestones = {
    due: childMilestones.filter(m => getMilestoneStatus(m, currentAge) === "due"),
    upcoming: childMilestones.filter(m => getMilestoneStatus(m, currentAge) === "upcoming"),
    completed: childMilestones.filter(m => getMilestoneStatus(m, currentAge) === "completed"),
    future: childMilestones.filter(m => getMilestoneStatus(m, currentAge) === "future")
  };

  return (
    <Card className="shadow-sm border border-neutral-200 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            🎯 Milestone Tracking
          </span>
          {selectedChild && (
            <Button 
              onClick={() => setShowAddMilestone(true)} 
              size="sm"
              className="animate-scale-in"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Custom
            </Button>
          )}
        </CardTitle>
        <div className="text-sm text-neutral-600">
          Track and celebrate your child's developmental milestones
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Child Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            👶 Select Child
          </label>
          <div className="space-y-2">
            {childProfiles && childProfiles.length > 0 ? (
              childProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`milestone-child-${profile.id}`}
                    checked={selectedChild === profile.id}
                    onChange={(e) => {
                      setSelectedChild(e.target.checked ? profile.id : "");
                    }}
                    className="rounded border-neutral-300 text-primary focus:ring-primary focus:ring-2"
                  />
                  <label 
                    htmlFor={`milestone-child-${profile.id}`}
                    className="text-sm text-neutral-700 flex items-center cursor-pointer"
                  >
                    👶 {profile.name} ({Math.floor(calculateAge(profile.dateOfBirth) / 12)} years old)
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 italic">No children added yet</p>
            )}
          </div>
        </div>

        {selectedChild && selectedChildData && (
          <div className="space-y-6">
            {/* Child Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">
                    👶 {selectedChildData.name}'s Milestones
                  </h3>
                  <p className="text-sm text-blue-700">
                    Age: {Math.floor(currentAge / 12)} years, {currentAge % 12} months
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {groupedMilestones.completed.length}
                  </div>
                  <div className="text-xs text-blue-700">Completed</div>
                </div>
              </div>
            </div>

            {/* Milestone Progress */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-lg font-bold text-yellow-600">{groupedMilestones.due.length}</div>
                <div className="text-xs text-yellow-700">Ready Now</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-blue-600">{groupedMilestones.upcoming.length}</div>
                <div className="text-xs text-blue-700">Upcoming</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-lg font-bold text-green-600">{groupedMilestones.completed.length}</div>
                <div className="text-xs text-green-700">Achieved</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-lg font-bold text-gray-600">{groupedMilestones.future.length}</div>
                <div className="text-xs text-gray-700">Future</div>
              </div>
            </div>

            {/* Milestone Lists */}
            {Object.entries(groupedMilestones).map(([status, statusMilestones]) => {
              if (statusMilestones.length === 0) return null;
              
              const statusLabels = {
                due: "🎯 Ready to Achieve",
                upcoming: "⏰ Coming Up Soon",
                completed: "✅ Completed Milestones",
                future: "🔮 Future Milestones"
              };

              return (
                <div key={status} className="space-y-3">
                  <h3 className="font-medium text-neutral-800 flex items-center">
                    {statusLabels[status as keyof typeof statusLabels]}
                    <Badge variant="secondary" className="ml-2">
                      {statusMilestones.length}
                    </Badge>
                  </h3>

                  <div className="space-y-2">
                    {statusMilestones.map(milestone => {
                      const milestoneStatus = getMilestoneStatus(milestone, currentAge);
                      const category = MILESTONE_CATEGORIES.find(c => c.value === milestone.category);
                      
                      return (
                        <div
                          key={milestone.id}
                          className={cn(
                            "p-4 rounded-lg border transition-all hover-lift",
                            getStatusColor(milestoneStatus)
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getStatusIcon(milestoneStatus)}
                                <span className="font-medium">{milestone.title}</span>
                                {category && (
                                  <Badge variant="outline" className="text-xs">
                                    {category.emoji} {category.label.split(' ')[1]}
                                  </Badge>
                                )}
                                {milestone.isCustom && (
                                  <Badge variant="secondary" className="text-xs">
                                    Custom
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm opacity-80 mb-2">
                                {milestone.description}
                              </p>
                              <div className="flex items-center text-xs opacity-70">
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                Target age: {Math.floor(milestone.targetAge / 12)} years, {milestone.targetAge % 12} months
                              </div>
                              {milestone.completedDate && (
                                <div className="flex items-center text-xs opacity-70 mt-1">
                                  <Gift className="mr-1 h-3 w-3" />
                                  Completed: {format(new Date(milestone.completedDate), 'MMM d, yyyy')}
                                </div>
                              )}
                              {milestone.notes && (
                                <div className="mt-2 text-xs bg-white/50 p-2 rounded">
                                  💭 {milestone.notes}
                                </div>
                              )}
                            </div>
                            
                            {!milestone.isCompleted && milestoneStatus === "due" && (
                              <div className="ml-4 space-y-2">
                                <Textarea
                                  placeholder="Add celebration notes..."
                                  value={completionNotes}
                                  onChange={(e) => setCompletionNotes(e.target.value)}
                                  rows={2}
                                  className="text-xs"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => markMilestoneComplete(milestone.id)}
                                  className="w-full animate-gentle-bounce"
                                >
                                  <Check className="mr-1 h-3 w-3" />
                                  Complete!
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!selectedChild && (
          <div className="text-center py-8 text-neutral-500">
            <Trophy className="mx-auto h-12 w-12 mb-4 text-neutral-300" />
            <p>Select a child to start tracking milestones</p>
            <p className="text-sm">Celebrate every achievement in your child's journey!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}