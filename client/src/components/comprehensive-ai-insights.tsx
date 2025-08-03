import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Lightbulb, 
  Heart, 
  Target, 
  Baby, 
  User, 
  Sparkles,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Loader2,
  X
} from "lucide-react";
import type { JournalEntry, ChildProfile, ParentProfile } from "@shared/schema";
import { SparklyStarsLoader } from "@/components/ui/sparkly-stars-loader";

interface ComprehensiveAIInsightsProps {
  onInsightClick?: (insightType: string) => void;
}

export function ComprehensiveAIInsights({ onInsightClick }: ComprehensiveAIInsightsProps) {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const queryClient = useQueryClient();
  
  // Debug the analysis data state
  console.log("Current analysisData state:", analysisData);
  console.log("Selected insight:", selectedInsight);
  console.log("Is loading:", isLoading);

  // Check authentication first
  const { data: authUser } = useQuery({
    queryKey: ["/auth/user"],
  });

  const isAuthenticated = Boolean((authUser as any)?.success && (authUser as any)?.user);

  // Fetch data for AI analysis only if authenticated
  const { data: entries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const token = localStorage.getItem('parentjourney_token');
      const response = await fetch('/api/journal-entries', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }
      return response.json();
    },
  });

  const { data: childProfiles } = useQuery<ChildProfile[]>({
    queryKey: ["/api/child-profiles"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const token = localStorage.getItem('parentjourney_token');
      const response = await fetch('/api/child-profiles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch child profiles');
      }
      return response.json();
    },
  });

  const { data: parentProfile } = useQuery<ParentProfile>({
    queryKey: ["/api/parent-profile"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const token = localStorage.getItem('parentjourney_token');
      const response = await fetch('/api/parent-profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch parent profile');
      }
      return response.json();
    },
  });

  // Force refresh all data before AI analysis
  const refreshAllData = async () => {
    const token = localStorage.getItem('parentjourney_token');
    if (!token) return;

    // Invalidate and refetch all queries with proper auth
    await queryClient.invalidateQueries({ queryKey: ["/api/child-profiles"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] }); 
    await queryClient.invalidateQueries({ queryKey: ["/api/parent-profile"] });
    
    console.log('🔄 Forced refresh of all data queries');
  };

  const handleInsightClick = async (insightType: string) => {
    setSelectedInsight(insightType);
    setIsLoading(true);
    
    try {
      // Force refresh data first to ensure we have the latest information
      await refreshAllData();
      
      // Get the current auth token and verify authentication
      const token = localStorage.getItem('parentjourney_token');
      const authData = (authUser as any);
      const hasValidAuth = authData?.success && authData?.user && token;
      
      console.log(`🔍 DEBUGGING AI Analysis Request:`);
      console.log(`- Auth user data:`, authData);
      console.log(`- Token present: ${token ? 'YES' : 'NO'}`);
      console.log(`- isAuthenticated: ${isAuthenticated}`);
      console.log(`- hasValidAuth: ${hasValidAuth}`);
      console.log(`- Available data - entries: ${entries?.length || 0}, children: ${childProfiles?.length || 0}, parent: ${parentProfile ? 'present' : 'missing'}`);
      
      // Wait a moment for the queries to refetch
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get fresh data from cache after refresh
      const freshChildProfiles = queryClient.getQueryData(["/api/child-profiles"]) as ChildProfile[] || [];
      const freshEntries = queryClient.getQueryData(["/api/journal-entries"]) as JournalEntry[] || [];
      const freshParentProfile = queryClient.getQueryData(["/api/parent-profile"]) as ParentProfile || null;
      
      // If cached data is empty, try direct fetch as backup
      let finalEntries = freshEntries;
      let finalChildProfiles = freshChildProfiles;
      let finalParentProfile = freshParentProfile;
      
      if ((!finalEntries || finalEntries.length === 0) && token) {
        console.log('🔄 Cache empty, fetching entries directly...');
        try {
          const directEntriesResponse = await fetch('/api/journal-entries', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          if (directEntriesResponse.ok) {
            finalEntries = await directEntriesResponse.json();
            console.log(`✅ Direct fetch got ${finalEntries?.length || 0} entries`);
          }
        } catch (e) {
          console.log('❌ Direct entries fetch failed:', e);
        }
      }
      
      if ((!finalChildProfiles || finalChildProfiles.length === 0) && token) {
        console.log('🔄 Cache empty, fetching child profiles directly...');
        try {
          const directChildResponse = await fetch('/api/child-profiles', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          if (directChildResponse.ok) {
            finalChildProfiles = await directChildResponse.json();
            console.log(`✅ Direct fetch got ${finalChildProfiles?.length || 0} child profiles`);
          }
        } catch (e) {
          console.log('❌ Direct child profiles fetch failed:', e);
        }
      }
      
      if (!finalParentProfile && token) {
        console.log('🔄 Cache empty, fetching parent profile directly...');
        try {
          const directParentResponse = await fetch('/api/parent-profile', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          if (directParentResponse.ok) {
            finalParentProfile = await directParentResponse.json();
            console.log(`✅ Direct fetch got parent profile: ${finalParentProfile?.name || 'unknown'}`);
          }
        } catch (e) {
          console.log('❌ Direct parent profile fetch failed:', e);
        }
      }
      
      console.log(`🔄 FINAL DATA CHECK - entries: ${finalEntries?.length || 0}, children: ${finalChildProfiles?.length || 0} (${finalChildProfiles?.map(c => c.name).join(', ') || 'none'}), parent: ${finalParentProfile?.name || 'missing'}`);
      
      // Force authentication by checking if we have data AND a token
      const hasDataAndToken = token && ((finalEntries?.length ?? 0) > 0 || (finalChildProfiles?.length ?? 0) > 0 || finalParentProfile);
      
      if (!hasDataAndToken) {
        // Show explainer content for unauthenticated users or users without data
        console.log('❌ No token or no data available, showing explainer');
        setAnalysisData(getUnauthenticatedExplainer(insightType));
      } else {
        // We have data and a token - proceed with real AI analysis
        console.log('✅ DATA AND TOKEN FOUND - Proceeding with REAL AI analysis');
        console.log(`- Children found: ${finalChildProfiles?.map(c => c.name).join(', ') || 'none'}`);
        console.log(`- Parent: ${finalParentProfile?.name || 'unknown'}`);
        console.log(`- Journal entries: ${finalEntries?.length || 0}`);
        
        // Make the auth test to validate token
        const authTestResponse = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        const authTest = await authTestResponse.json();
        console.log('🔍 Auth test result:', authTest);
        
        if (!authTest.success) {
          console.log('❌ Auth test failed, using fallback with available data');
          // Use available data for personalized fallback
          const personalizedData = getUserSpecificData(insightType, finalEntries || [], finalChildProfiles || [], finalParentProfile);
          setAnalysisData(personalizedData);
          return;
        }
        // Use actual user data for authenticated users - call real AI API
        console.log(`🚀 Making REAL AI analysis request for: ${insightType}`);
        console.log(`🚀 Children: ${finalChildProfiles?.map(c => c.name).join(', ') || 'none'}`);
        console.log(`🚀 Parent: ${finalParentProfile?.name || 'unknown'}`);
        console.log(`🚀 Journal Entries to send: ${finalEntries?.length || 0} entries`);
        
        // Additional detailed logging of data being sent
        console.log('📝 ENTRIES TO BE SENT:', finalEntries?.map(entry => ({
          title: entry.title || entry.content?.substring(0, 50),
          content: entry.content?.substring(0, 100),
          mood: entry.mood,
          childName: finalChildProfiles?.find(child => child.id === entry.childProfileId)?.name || 'General'
        })));
        
        console.log('👶 CHILD PROFILES TO BE SENT:', finalChildProfiles?.map(child => ({
          name: child.name,
          age: child.dateOfBirth ? Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'unknown'
        })));
        
        console.log('👨‍👩‍👧‍👦 PARENT PROFILE TO BE SENT:', finalParentProfile ? {
          name: finalParentProfile.name,
          parentingStyle: finalParentProfile.parentingStyle
        } : 'null');
        
        const response = await fetch(`/api/ai-analysis/${insightType}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            entries: finalEntries || [],
            childProfiles: finalChildProfiles || [],
            parentProfile: finalParentProfile
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ AI analysis API failed: ${response.status} ${response.statusText} - ${errorText}`);
          throw new Error(`Failed to fetch AI analysis: ${response.statusText}`);
        }
        
        const analysisResult = await response.json();
        console.log(`✅ SUCCESS: Received REAL AI analysis result for ${insightType}:`, analysisResult);
        setAnalysisData(analysisResult);
      }
    } catch (error) {
      console.error('❌ Error fetching AI analysis:', error);
      // Fallback to appropriate content based on auth state
      const token = localStorage.getItem('parentjourney_token');
      const authData = (authUser as any);
      const hasValidAuth = authData?.success && authData?.user && token;
      
      // Always try to use available user data first, even if API failed
      const hasUserData = (entries && entries.length > 0) || (childProfiles && childProfiles.length > 0) || parentProfile;
      
      if (hasUserData || hasValidAuth) {
        // For authenticated users or when we have user data, try backup local processing
        console.log('🔄 API failed, using local fallback processing with user data');
        const userData = getUserSpecificData(insightType, entries || [], childProfiles || [], parentProfile);
        setAnalysisData(userData);
      } else {
        console.log('🔄 No auth and no user data, showing explainer');
        setAnalysisData(getUnauthenticatedExplainer(insightType));
      }
    } finally {
      setIsLoading(false);
    }

    onInsightClick?.(insightType);
  };

  // Helper functions for child development analysis
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

  const getDevelopmentalStage = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    
    if (months < 12) return "Infant Development";
    if (months < 36) return "Toddler Development";
    if (months < 60) return "Preschool Development";
    if (months < 144) return "School-Age Development";
    return "Adolescent Development";
  };

  const getAgeAppropriateeMilestones = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    
    if (months < 12) return [
      "Motor skills and physical coordination",
      "Attachment and bonding development",
      "Communication through crying and gestures",
      "Sensory exploration and recognition"
    ];
    if (months < 36) return [
      "Language explosion and vocabulary growth",
      "Independence and self-assertion",
      "Social play and interaction skills",
      "Emotional regulation development"
    ];
    if (months < 60) return [
      "Social skills and peer interaction",
      "Emotional expression and empathy",
      "Creative play and imagination",
      "Pre-academic skills development"
    ];
    if (months < 144) return [
      "Academic skills and learning abilities",
      "Friendship formation and social dynamics",
      "Self-confidence and identity development",
      "Problem-solving and critical thinking"
    ];
    return [
      "Identity formation and self-discovery",
      "Peer relationships and social belonging",
      "Independence and responsibility",
      "Future planning and goal setting"
    ];
  };

  const getPersonalizedFocusAreas = (child: ChildProfile) => {
    const baseAreas = ["Emotional regulation", "Social skills", "Independence", "Creative expression"];
    const personalityTraits = child.personalityTraits || [];
    
    if (personalityTraits.includes("shy") || personalityTraits.includes("introverted")) {
      baseAreas.push("Building confidence in social situations");
    }
    if (personalityTraits.includes("energetic") || personalityTraits.includes("active")) {
      baseAreas.push("Channeling energy into positive activities");
    }
    if (personalityTraits.includes("sensitive") || personalityTraits.includes("emotional")) {
      baseAreas.push("Emotional processing and coping skills");
    }
    
    return baseAreas.slice(0, 4);
  };

  const getPersonalizedRecommendations = (child: ChildProfile) => {
    const personalityTraits = child.personalityTraits || [];
    let recommendations = "Encourage exploration through play, maintain consistent routines, and provide positive reinforcement. ";
    
    if (personalityTraits.includes("creative") || personalityTraits.includes("imaginative")) {
      recommendations += "Foster their creativity with art, music, and open-ended play activities. ";
    }
    if (personalityTraits.includes("analytical") || personalityTraits.includes("curious")) {
      recommendations += "Provide opportunities for exploration, experiments, and problem-solving challenges. ";
    }
    if (personalityTraits.includes("social") || personalityTraits.includes("outgoing")) {
      recommendations += "Arrange playdates and group activities to support their social nature. ";
    }
    
    return recommendations;
  };

  // Helper function for unauthenticated users - shows explainer text
  const getUnauthenticatedExplainer = (type: string) => {
    switch (type) {
      case "parenting-progress":
        return {
          isExplainer: true,
          title: "Your Parenting Progress Analysis",
          description: "This analysis provides personalized insights into your parenting journey, growth areas, and progress over time.",
          features: [
            "Track your parenting strengths and achievements",
            "Identify areas for continued growth and development", 
            "Receive personalized recommendations based on your journal entries",
            "Monitor your emotional patterns and stress management"
          ],
          callToAction: "Sign up or log in to see your personalized parenting progress analysis based on your journal entries and experiences."
        };
      
      case "child-development":
        return {
          isExplainer: true,
          title: "Child Development Patterns",
          description: "Get comprehensive insights into each child's developmental progress, milestones, and personalized recommendations.",
          features: [
            "Age-appropriate milestone tracking for each child",
            "Personalized development focus areas",
            "Custom recommendations based on personality traits",
            "Family dynamics and sibling interaction insights"
          ],
          callToAction: "Create an account to track your children's development patterns and receive AI-powered insights tailored to their unique needs."
        };
      
      default:
        return {
          isExplainer: true,
          title: "AI-Powered Insights",
          description: "Discover personalized parenting insights based on your unique family situation and journal entries.",
          features: [
            "Personalized analysis of your parenting journey",
            "Child-specific developmental insights",
            "Mood and stress pattern recognition",
            "Customized recommendations and guidance"
          ],
          callToAction: "Join ParentJourney to unlock comprehensive AI insights for your family."
        };
    }
  };

  // Helper function to generate user-specific data for authenticated users
  const getUserSpecificData = (type: string, entries: any[], childProfiles: any[], parentProfile: any) => {
    console.log(`Generating user-specific data for: ${type}`);
    console.log(`Entries count: ${entries?.length || 0}`);
    console.log(`Child profiles count: ${childProfiles?.length || 0}`);
    console.log(`Parent profile exists: ${!!parentProfile}`);

    // Ensure we have actual user data before proceeding
    if (!entries || entries.length === 0) {
      return {
        noDataMessage: "Start journaling to unlock personalized AI insights based on your parenting experiences.",
        isEmptyState: true
      };
    }

    switch (type) {
      case "parenting-progress":
        return generateParentingProgressAnalysis(entries, parentProfile);
      case "child-development":
        return generateChildDevelopmentAnalysis(entries, childProfiles);
      case "personalized-tips":
        return generatePersonalizedTips(entries, childProfiles, parentProfile);
      case "considerations":
        return generateConsiderations(entries, childProfiles, parentProfile);
      default:
        return {
          noDataMessage: "Analysis not available yet. Continue journaling to unlock personalized insights.",
          isEmptyState: true
        };
    }
  };

  // Generate actual user-specific parenting progress analysis
  const generateParentingProgressAnalysis = (entries: any[], parentProfile: any) => {
    const recentEntries = entries.slice(0, 10); // Last 10 entries
    const totalEntries = entries.length;
    
    // Analyze mood patterns from actual user data
    const moods = entries.filter(e => e.mood).map(e => parseFloat(e.mood) || 5);
    const averageMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : "Not tracked";
    
    // Count entries with AI feedback
    const entriesWithFeedback = entries.filter(e => e.aiFeedback && e.aiFeedback.trim() !== '').length;
    
    return {
      progressOverview: `Based on your ${totalEntries} journal entries, you're actively documenting your parenting journey. Your average mood rating is ${averageMood}/10, showing your emotional awareness and commitment to growth.`,
      strengths: [
        `Consistent journaling practice with ${totalEntries} documented experiences`,
        `Active reflection on parenting situations and outcomes`,
        entriesWithFeedback > 0 ? `Engaged with AI feedback on ${entriesWithFeedback} entries` : "Growing awareness through self-reflection",
        "Commitment to understanding and improving your parenting approach"
      ],
      growthAreas: [
        moods.length > 0 && averageMood < "7" ? "Focus on stress management and self-care strategies" : "Continue maintaining emotional balance",
        "Explore new parenting strategies based on your documented experiences",
        "Consider patterns in challenging situations from your journal entries",
        "Celebrate progress and acknowledge your parenting wins"
      ],
      nextSteps: `Continue your journaling practice and focus on patterns you've documented. With ${totalEntries} entries, you have valuable insights to draw from. Consider what themes emerge from your recent experiences.`,
      userStats: {
        totalEntries,
        averageMood,
        entriesWithFeedback,
        recentThemes: recentEntries.slice(0, 3).map(e => e.title || "Untitled entry")
      }
    };
  };

  // Generate actual child development analysis from user data
  const generateChildDevelopmentAnalysis = (entries: any[], childProfiles: any[]) => {
    const childEntries = entries.filter(e => e.childProfileId);
    
    return {
      developmentOverview: `Based on your journal entries about your ${childProfiles?.length || 0} child${childProfiles?.length === 1 ? '' : 'ren'}, you're actively tracking their growth and development. You've documented ${childEntries.length} child-specific experiences.`,
      children: childProfiles?.map(child => {
        const childSpecificEntries = entries.filter(e => e.childProfileId === child.id);
        return {
          name: child.name,
          age: calculateAge(child.dateOfBirth),
          developmentalStage: getDevelopmentalStage(child.dateOfBirth),
          milestones: getAgeAppropriateeMilestones(child.dateOfBirth),
          focusAreas: getPersonalizedFocusAreas(child),
          recommendations: getPersonalizedRecommendations(child),
          entryCount: childSpecificEntries.length,
          recentExperiences: childSpecificEntries.slice(0, 2).map(e => e.title || "Recent experience")
        };
      }) || [],
      familyDynamics: childProfiles && childProfiles.length > 1 ? 
        `With ${childProfiles.length} children, you're managing different developmental needs and personalities. Your journal shows attention to each child's individual journey.` : 
        `You're focused on your child's individual development with ${childEntries.length} documented experiences specific to their growth.`
    };
  };

  // Generate personalized tips from actual user data
  const generatePersonalizedTips = (entries: any[], childProfiles: any[], parentProfile: any) => {
    const parentName = parentProfile?.name || 'Parent';
    const recentChallenges = entries.slice(0, 5).filter(e => 
      e.content && (e.content.toLowerCase().includes('difficult') || 
                   e.content.toLowerCase().includes('challenge') || 
                   e.content.toLowerCase().includes('struggle'))
    );

    return {
      personalizedTips: [
        {
          category: "Based on Your Journal Patterns",
          tip: recentChallenges.length > 0 
            ? `${parentName}, I notice you've documented some challenging moments in your recent entries. Consider creating a simple response plan for similar situations with ${childProfiles?.map(c => c.name).join(' and ') || 'your children'}.`
            : `${parentName}, your recent entries show thoughtful reflection on your parenting journey. Try documenting what worked well with ${childProfiles?.map(c => c.name).join(' and ') || 'your family'} to build on those successes.`,
          reasoning: `Your ${entries.length} journal entries provide valuable insights into what strategies align with your family's specific needs and dynamics.`,
          implementation: "Review your last 3 entries and identify one successful approach you can replicate."
        },
        {
          category: "Child-Specific Strategies",
          tip: childProfiles && childProfiles.length > 0 
            ? `For ${childProfiles[0]?.name || 'your child'} at ${calculateAge(childProfiles[0]?.dateOfBirth)}, ${parentName}, focus on age-appropriate independence activities that match their current developmental stage.`
            : `${parentName}, create simple routines that support your child's current developmental stage based on the experiences you've documented.`,
          reasoning: `Your child profiles and journal entries about ${childProfiles?.map(c => c.name).join(' and ') || 'your children'} show specific developmental needs that can guide your approach.`,
          implementation: "Choose one small independence skill to practice with them this week."
        },
        {
          category: "Self-Care for Parents",
          tip: `${parentName}, with ${entries.length} journal entries, you're clearly committed to growth and reflection. Now prioritize 10 minutes daily for personal relaxation or mindfulness.`,
          reasoning: "Your consistent journaling shows dedication to your family - balancing this with self-care will support your long-term well-being and patience.",
          implementation: "Set a daily 10-minute timer for a personal activity that brings you peace."
        }
      ]
    };
  };

  // Generate considerations from user data
  const generateConsiderations = (entries: any[], childProfiles: any[], parentProfile: any) => {
    const parentName = parentProfile?.name || 'Parent';
    const childNames = childProfiles?.map(c => c.name).join(' and ') || 'your children';
    
    return {
      considerations: [
        {
          concept: "Journal Pattern Recognition",
          description: `${parentName}, with your ${entries.length} documented entries, you might notice recurring themes in your parenting experiences with ${childNames}. What patterns do you see emerging in your most challenging or successful moments?`,
          importance: `Your consistent documentation provides valuable data about what approaches work best for your specific family dynamics. Based on your entries, you can identify what strategies consistently lead to positive outcomes with ${childNames}.`
        },
        {
          concept: "Individual Child Approaches",
          description: childProfiles && childProfiles.length > 0 
            ? `${parentName}, each of your ${childProfiles.length} child${childProfiles.length === 1 ? '' : 'ren'} - ${childNames} - has unique needs and personalities. Are you adapting your parenting style to match each of their individual characteristics?`
            : `${parentName}, consider how your child's unique personality traits, as documented in your journal entries, influence the most effective parenting strategies.`,
          importance: `Your journal entries about ${childNames} provide insights into their individual responses to different approaches. Tailoring your parenting style to each child's personality can lead to more effective communication and stronger relationships.`
        },
        {
          concept: "Emotional Regulation Modeling",
          description: `${parentName}, based on your journal reflections, children learn emotional regulation by observing how you handle stress and challenging moments with ${childNames}. How are you modeling healthy coping strategies?`,
          importance: `Your documented experiences show that when you remain calm during difficult moments, you provide a secure foundation that helps ${childNames} learn to self-regulate over time. Your journal entries can help you identify patterns in your emotional responses.`
        }
      ]
    };
  };

  // Provide proper structured fallback data for each analysis type
  const getProperFallbackData = (type: string) => {
    switch (type) {
      case "parenting-progress":
        return {
          progressOverview: "You're building positive parenting habits through consistent reflection and journaling. Your commitment to growth is evident in your regular documentation of experiences.",
          strengths: [
            "Consistent reflection and self-awareness",
            "Commitment to learning and growth", 
            "Emotional awareness in parenting situations",
            "Dedication to documenting your journey"
          ],
          growthAreas: [
            "Developing patience during challenging moments",
            "Prioritizing self-care and emotional regulation",
            "Building consistent response strategies",
            "Celebrating small wins and progress"
          ],
          nextSteps: "Continue your journaling practice, focus on one growth area at a time, and consider exploring new parenting strategies that align with your values and family needs."
        };
        
      case "child-development":
        return {
          developmentOverview: "Based on your observations, your children are progressing through important developmental stages. Each child has unique patterns and growth areas that deserve individual attention and support.",
          children: childProfiles?.map(child => ({
            name: child.name,
            age: calculateAge(child.dateOfBirth),
            developmentalStage: getDevelopmentalStage(child.dateOfBirth),
            milestones: getAgeAppropriateeMilestones(child.dateOfBirth),
            focusAreas: getPersonalizedFocusAreas(child),
            recommendations: getPersonalizedRecommendations(child)
          })) || [{
            name: "Your Child",
            age: "Age not specified",
            developmentalStage: "General Development",
            milestones: [
              "Social and emotional skill development",
              "Language and communication progress", 
              "Physical and motor skill advancement",
              "Cognitive and problem-solving growth"
            ],
            focusAreas: [
              "Emotional regulation and self-control",
              "Independence and self-help skills",
              "Creative expression and imagination",
              "Social interaction and empathy"
            ],
            recommendations: "Encourage exploration through play, maintain consistent routines, provide plenty of positive reinforcement, and create opportunities for age-appropriate challenges and learning."
          }],
          familyDynamics: childProfiles && childProfiles.length > 1 ? 
            "With multiple children, consider how sibling dynamics, different developmental needs, and individual personalities affect your family interactions." : 
            "Focus on your child's individual developmental journey and creating a nurturing environment for their unique growth."
        };
        
      case "personalized-tips":
        return {
          tips: [
            {
              category: "Communication",
              tip: "Try using more descriptive praise when acknowledging your child's efforts. Instead of 'good job,' specify what they did well.",
              reason: "This builds their understanding of positive behaviors and encourages repetition of specific actions."
            },
            {
              category: "Routine",
              tip: "Consider implementing a visual schedule for daily activities to increase independence and reduce conflicts.",
              reason: "Visual cues help children anticipate transitions and feel more in control of their day."
            },
            {
              category: "Connection", 
              tip: "Schedule 10 minutes of uninterrupted one-on-one time daily, letting your child choose the activity.",
              reason: "This strengthens your bond and gives them a sense of agency while ensuring quality connection time."
            }
          ]
        };
        
      case "considerations":
        return {
          considerations: [
            {
              concept: "Emotional Co-regulation",
              description: "The practice of helping your child manage their emotions by first managing your own emotional state.",
              importance: "When you remain calm during your child's emotional moments, you provide a secure base that helps them learn to self-regulate over time."
            },
            {
              concept: "Growth Mindset Modeling",
              description: "Demonstrating how to approach challenges as learning opportunities rather than fixed abilities.",
              importance: "Children who develop a growth mindset are more resilient, creative, and willing to take on challenges throughout their lives."
            },
            {
              concept: "Play-Based Connection",
              description: "Using unstructured play as a method for building relationship and understanding your child's perspective.",
              importance: "Play is how children naturally process experiences and develop life skills while strengthening your parent-child bond."
            }
          ]
        };
        
      default:
        return { error: "Unknown analysis type" };
    }
  };

  const insights = [
    {
      id: "parenting-progress",
      title: "Your Growth as a Parent",
      description: "AI insights on your parenting strengths, patterns, and growth—based on your journal entries and reflections. We'll highlight key moments, trends, and tips you can use today.",
      tooltip: "Track your parenting journey progress through AI analysis of your journal entries",
      icon: <TrendingUp className="h-5 w-5 stroke-1" />,
      color: "text-blue-700",
      bgColor: "bg-white",
      borderColor: "border-blue-300",
      hoverBorder: "hover:border-blue-500",
      hoverBg: "hover:bg-blue-50"
    },
    {
      id: "child-development",
      title: "Your Children's Development",
      description: "Understand your child's developmental stages and behavior trends with personalized guidance just for your family. We'll highlight key moments, trends, and tips you can use today.",
      tooltip: "Get developmental insights specific to each of your children's ages and personalities",
      icon: <Baby className="h-5 w-5 stroke-1" />,
      color: "text-purple-700",
      bgColor: "bg-white",
      borderColor: "border-purple-300",
      hoverBorder: "hover:border-purple-500",
      hoverBg: "hover:bg-purple-50"
    },
    {
      id: "personalized-tips",
      title: "Personalized Tips",
      description: "Custom recommendations based on your parenting style, child's personality, and recent experiences",
      tooltip: "Receive actionable tips tailored to your family's unique situation and parenting style",
      icon: <Lightbulb className="h-5 w-5 stroke-1" />,
      color: "text-amber-700",
      bgColor: "bg-white",
      borderColor: "border-amber-300",
      hoverBorder: "hover:border-amber-500",
      hoverBg: "hover:bg-amber-50"
    },
    {
      id: "considerations",
      title: "Have You Considered",
      description: "Three thoughtful suggestions to enhance your parenting journey and family dynamics",
      tooltip: "Explore new parenting perspectives and strategies you might not have considered",
      icon: <MessageSquare className="h-5 w-5 stroke-1" />,
      color: "text-pink-700",
      bgColor: "bg-white",
      borderColor: "border-pink-300",
      hoverBorder: "hover:border-pink-500",
      hoverBg: "hover:bg-pink-50"
    }
  ];

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-lg p-4 animate-pop-fade ring-2 ring-blue-100/50">
        <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
          <Sparkles className="mr-2 h-6 w-6 text-blue-600" />
          AI Insights & Guidance
        </h3>
        <p className="text-sm text-blue-700 mb-4 leading-relaxed">
          Personalized insights powered by your journal entries and parenting journey
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              onClick={() => handleInsightClick(insight.id)}
              className={`${insight.bgColor} rounded-lg p-4 border ${insight.borderColor} interactive-card hover-lift button-press cursor-pointer ${insight.hoverBorder} ${insight.hoverBg} hover:shadow-md transition-all duration-200`}
              title={insight.tooltip}
            >
              <div className="flex items-start mb-2">
                <div className={`${insight.color} mr-2`}>
                  {insight.icon}
                </div>
                <h4 className={`font-medium ${insight.color} flex-1`}>
                  {insight.title}
                </h4>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Simplified Modal - Fixed Position Overlay */}
      {selectedInsight && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setSelectedInsight(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '672px',
              width: '100%',
              margin: '0 16px',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              padding: '24px'
            }}
          >
            <button
              onClick={() => setSelectedInsight(null)}
              className="absolute top-4 right-4 z-50 p-2 hover:bg-neutral-100 rounded-full transition-colors"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 50,
                padding: '8px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              <X className="h-4 w-4 text-neutral-500 hover:text-neutral-700" />
            </button>
            
            <div className="pr-12 pb-4" style={{paddingRight: '48px', paddingBottom: '16px'}}>
              <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900" style={{fontSize: '18px', fontWeight: 'bold', color: '#171717', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Sparkles className="h-5 w-5 text-primary" />
                {insights.find(i => i.id === selectedInsight)?.title}
              </h2>
              <p className="text-sm text-neutral-600 mt-2" style={{fontSize: '14px', color: '#525252', marginTop: '8px'}}>
                {insights.find(i => i.id === selectedInsight)?.description}
              </p>
            </div>
            
            <div className="space-y-4" style={{marginTop: '16px'}}>
              {isLoading ? (
                <SparklyStarsLoader 
                  message="AI is analyzing your parenting journey..." 
                  size="lg" 
                />
              ) : (
                <div>
                  {selectedInsight === "parenting-progress" && (
                    <ParentingProgressAnalysis data={analysisData} />
                  )}
                  {selectedInsight === "child-development" && (
                    <ChildDevelopmentAnalysis data={analysisData} />
                  )}
                  {selectedInsight === "personalized-tips" && (
                    <PersonalizedTipsAnalysis data={analysisData} />
                  )}
                  {selectedInsight === "considerations" && (
                    <ConsiderationsAnalysis data={analysisData} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ParentingProgressAnalysis({ data }: { data: any }) {
  console.log("ParentingProgressAnalysis received data:", data);
  
  // Handle empty state for users without journal entries
  if (!data || data.isEmptyState) {
    return (
      <div className="text-center py-8">
        <div className="bg-neutral-50 rounded-lg p-6 mb-4">
          <Target className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="font-medium text-neutral-700 mb-2">No Journal Data Yet</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {data?.noDataMessage || "Start writing journal entries to see your personalized parenting progress analysis."}
          </p>
        </div>
      </div>
    );
  }
  
  if (!data) {
    console.log("ParentingProgressAnalysis: No data provided");
    return <div className="text-center py-6 text-neutral-500">No analysis available yet</div>;
  }
  
  // Handle explainer content for unauthenticated users
  if (data.isExplainer) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-4 flex items-center text-lg">
            <Sparkles className="mr-3 h-5 w-5" />
            {data.title}
          </h4>
          <p className="text-blue-700 leading-relaxed mb-4">
            {data.description}
          </p>
          <div className="space-y-3">
            {data.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-blue-700 leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 text-center">
          <h5 className="font-medium text-amber-800 mb-3">Ready to Get Started?</h5>
          <p className="text-amber-700 leading-relaxed">
            {data.callToAction}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{minHeight: '400px', display: 'block', visibility: 'visible'}}>
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200" style={{backgroundColor: '#eff6ff', border: '1px solid #bfdbfe'}}>
        <h4 className="font-semibold text-blue-800 mb-4 flex items-center text-lg" style={{color: '#1e40af', fontSize: '18px', fontWeight: '600'}}>
          <TrendingUp className="mr-3 h-5 w-5" />
          Your Parenting Journey
        </h4>
        <p className="text-blue-700 leading-relaxed" style={{color: '#1d4ed8', lineHeight: '1.6'}}>
          {data.progressOverview || "Based on your journal entries and reflections, you're developing consistent parenting practices and growing in self-awareness."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-xl p-5 border border-green-200" style={{backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px'}}>
          <h5 className="font-medium text-green-800 mb-4 flex items-center" style={{color: '#166534', fontSize: '16px', fontWeight: '500'}}>
            <CheckCircle className="mr-3 h-5 w-5" />
            Your Strengths
          </h5>
          <div className="space-y-3">
            {(data.strengths || ["Consistent reflection habits", "Emotional awareness", "Growth mindset"]).map((strength: string, index: number) => (
              <div key={index} className="flex items-start" style={{display: 'flex', alignItems: 'flex-start', marginBottom: '12px'}}>
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" style={{width: '8px', height: '8px', backgroundColor: '#16a34a', borderRadius: '50%', marginTop: '8px', marginRight: '12px'}}></div>
                <span className="text-green-700 leading-relaxed" style={{color: '#15803d', lineHeight: '1.6'}}>{strength}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-5 border border-orange-200" style={{backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '20px'}}>
          <h5 className="font-medium text-orange-800 mb-4 flex items-center" style={{color: '#9a3412', fontSize: '16px', fontWeight: '500'}}>
            <Target className="mr-3 h-5 w-5" />
            Growth Opportunities
          </h5>
          <div className="space-y-3">
            {(data.growthAreas || ["Consistency in responses", "Patience during challenges"]).map((area: string, index: number) => (
              <div key={index} className="flex items-start" style={{display: 'flex', alignItems: 'flex-start', marginBottom: '12px'}}>
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0" style={{width: '8px', height: '8px', backgroundColor: '#ea580c', borderRadius: '50%', marginTop: '8px', marginRight: '12px'}}></div>
                <span className="text-orange-700 leading-relaxed" style={{color: '#c2410c', lineHeight: '1.6'}}>{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200" style={{backgroundColor: '#fffbeb', border: '1px solid #fcd34d', padding: '24px'}}>
        <h5 className="font-medium text-amber-800 mb-4 flex items-center" style={{color: '#92400e', fontSize: '16px', fontWeight: '500'}}>
          <Sparkles className="mr-3 h-5 w-5" />
          Next Steps
        </h5>
        <p className="text-amber-700 leading-relaxed" style={{color: '#b45309', lineHeight: '1.6'}}>
          {data.nextSteps || "Continue documenting your experiences, focus on celebrating small wins, and consider exploring new parenting strategies that align with your values."}
        </p>
      </div>

      {/* Detailed Narrative Section */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h5 className="font-medium text-slate-800 mb-4 flex items-center">
          <MessageSquare className="mr-3 h-5 w-5" />
          In-Depth Analysis & Context
        </h5>
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Your parenting journey reflects a thoughtful and intentional approach to raising your children. The patterns in your journal entries reveal someone who values reflection, growth, and emotional awareness. This combination of self-awareness and commitment to improvement creates a strong foundation for effective parenting.
          </p>
          <p>
            Parenting is fundamentally about building relationships while guiding development, and your approach demonstrates understanding of this balance. The challenges you face - from managing difficult moments to maintaining consistency - are universal experiences that every parent navigates. What sets successful parenting apart is not the absence of these challenges, but how we respond to and learn from them.
          </p>
          <p>
            Your emotional awareness, as evidenced by your journaling practice, provides a crucial advantage. Children learn emotional regulation primarily through modeling, and parents who understand their own emotional patterns are better equipped to help their children develop healthy coping strategies. This self-reflection also helps identify triggers and develop proactive strategies for challenging situations.
          </p>
          <p>
            Moving forward, focus on building upon your existing strengths while gradually addressing growth areas. Small, consistent changes often create more lasting impact than dramatic shifts. Remember that parenting is a long-term endeavor where patience with yourself is just as important as patience with your children.
          </p>
        </div>
      </div>
    </div>
  );
}

function ChildDevelopmentAnalysis({ data }: { data: any }) {
  // Handle empty state for users without journal entries
  if (!data || data.isEmptyState) {
    return (
      <div className="text-center py-8">
        <div className="bg-neutral-50 rounded-lg p-6 mb-4">
          <Baby className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="font-medium text-neutral-700 mb-2">No Child Development Data</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {data?.noDataMessage || "Add child profiles and start journaling to see personalized development insights."}
          </p>
        </div>
      </div>
    );
  }
  
  if (!data) return <div className="text-center py-6 text-neutral-500">No analysis available yet</div>;
  
  // Handle explainer content for unauthenticated users
  if (data.isExplainer) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-4 flex items-center text-lg">
            <Baby className="mr-3 h-5 w-5" />
            {data.title}
          </h4>
          <p className="text-purple-700 leading-relaxed mb-4">
            {data.description}
          </p>
          <div className="space-y-3">
            {data.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-purple-700 leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-200 text-center">
          <h5 className="font-medium text-green-800 mb-3">Start Your Journey</h5>
          <p className="text-green-700 leading-relaxed">
            {data.callToAction}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-accent/5 rounded-xl p-6 border border-accent/20">
        <h4 className="font-semibold text-accent mb-4 flex items-center text-lg">
          <Baby className="mr-3 h-5 w-5" />
          Family Development Overview
        </h4>
        <p className="text-neutral-700 leading-relaxed">
          {data.developmentOverview || "Your children are showing healthy developmental patterns across multiple areas. Each child has unique growth needs."}
        </p>
      </div>

      {/* Individual Child Analysis */}
      {data.childrenInsights && data.childrenInsights.map((child: any, index: number) => (
        <div key={index} className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h5 className="font-semibold text-neutral-800 text-lg">{child.childName}</h5>
              <p className="text-sm text-neutral-600">{child.age}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h6 className="font-medium text-purple-800 mb-3 flex items-center text-sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                Key Milestones for {child.childName}
              </h6>
              <div className="space-y-2">
                {child.milestones?.map((milestone: string, idx: number) => (
                  <div key={idx} className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    <span className="text-purple-700 text-sm leading-relaxed">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h6 className="font-medium text-blue-800 mb-3 flex items-center text-sm">
                <Target className="mr-2 h-4 w-4" />
                Focus Areas for {child.childName}
              </h6>
              <div className="space-y-2">
                {child.focusAreas?.map((area: string, idx: number) => (
                  <div key={idx} className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    <span className="text-blue-700 text-sm leading-relaxed">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
            <h6 className="font-medium text-green-800 mb-2 flex items-center text-sm">
              <Lightbulb className="mr-2 h-4 w-4" />
              Personalized Recommendations for {child.childName}
            </h6>
            <p className="text-green-700 text-sm leading-relaxed">
              {child.recommendations}
            </p>
          </div>
        </div>
      ))}

      {/* Family Dynamics Section */}
      {data.familyDynamics && (
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
          <h5 className="font-medium text-amber-800 mb-4 flex items-center">
            <Heart className="mr-3 h-5 w-5" />
            Family Dynamics & Multi-Child Considerations
          </h5>
          <p className="text-amber-700 leading-relaxed">
            {data.familyDynamics}
          </p>
        </div>
      )}

      {/* Detailed Narrative Section for Child Development */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h5 className="font-medium text-slate-800 mb-4 flex items-center">
          <MessageSquare className="mr-3 h-5 w-5" />
          Comprehensive Development Insights
        </h5>
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Child development is a remarkable process that unfolds uniquely for each individual while following predictable patterns. Understanding these patterns helps parents provide appropriate support, set realistic expectations, and celebrate meaningful progress along the way.
          </p>
          <p>
            Every child progresses through developmental stages at their own pace, influenced by their temperament, environment, experiences, and individual neurodevelopment. What appears as a challenge in one developmental phase often becomes a strength in another, as children integrate new skills and capabilities.
          </p>
          <p>
            The key to supporting healthy development lies in offering experiences that match your child's current capabilities while gently challenging them to grow. This means providing emotional support during difficult transitions, celebrating small victories, and maintaining realistic expectations based on developmental science rather than comparisons with other children.
          </p>
          <p>
            Remember that development isn't linear - children often show rapid progress in some areas while consolidating skills in others. Periods of regression or challenging behavior often precede significant developmental leaps. Your consistent presence, patience, and understanding during these times provides the security children need to navigate growth successfully.
          </p>
          <p>
            Focus on building strong emotional connections, fostering your child's natural curiosity, and creating an environment where they feel safe to explore, make mistakes, and learn. These foundations support not just immediate development but also long-term resilience and emotional well-being.
          </p>
        </div>
      </div>
    </div>
  );
}

function PersonalizedTipsAnalysis({ data }: { data: any }) {
  if (!data) return <div className="text-center py-6 text-neutral-500">No analysis available yet</div>;

  // Handle explainer content for unauthenticated users
  if (data.isExplainer) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-4 flex items-center text-lg">
            <Lightbulb className="mr-3 h-5 w-5" />
            {data.title}
          </h4>
          <p className="text-yellow-700 leading-relaxed mb-4">
            {data.description}
          </p>
          <div className="space-y-3">
            {data.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-start">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-yellow-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
            <p className="text-yellow-800 font-medium text-center">
              {data.callToAction}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 rounded-xl p-6 border border-secondary/20">
        <h4 className="font-semibold text-secondary mb-4 flex items-center text-lg">
          <Lightbulb className="mr-3 h-5 w-5" />
          Personalized Tips
        </h4>
        <p className="text-neutral-700 leading-relaxed">
          Based on your parenting style, children's personalities, and recent experiences, here are tailored suggestions for your family.
        </p>
      </div>

      <div className="space-y-4">
        {(data.personalizedTips || []).map((tip: any, index: number) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white font-semibold">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {tip.category}
                  </Badge>
                </div>
                <p className="text-neutral-800 mb-3 font-medium leading-relaxed">
                  {tip.tip}
                </p>
                <p className="text-neutral-600 text-sm leading-relaxed mb-2">
                  <strong>Why this helps:</strong> {tip.reasoning}
                </p>
                {tip.implementation && (
                  <p className="text-neutral-500 text-xs leading-relaxed">
                    <strong>How to implement:</strong> {tip.implementation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsiderationsAnalysis({ data }: { data: any }) {
  if (!data) return <div className="text-center py-6 text-neutral-500">No analysis available yet</div>;

  // Handle explainer content for unauthenticated users
  if (data.isExplainer) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-4 flex items-center text-lg">
            <MessageSquare className="mr-3 h-5 w-5" />
            {data.title}
          </h4>
          <p className="text-purple-700 leading-relaxed mb-4">
            {data.description}
          </p>
          <div className="space-y-3">
            {data.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-start">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-purple-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-purple-100 rounded-lg">
            <p className="text-purple-800 font-medium text-center">
              {data.callToAction}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
        <h4 className="font-semibold text-primary mb-4 flex items-center text-lg">
          <MessageSquare className="mr-3 h-5 w-5" />
          Have You Considered...
        </h4>
        <p className="text-neutral-700 leading-relaxed">
          Research-backed concepts and strategies that could enhance your parenting approach and family dynamics based on your specific situation.
        </p>
      </div>

      <div className="space-y-6">
        {(data.considerations || [
          {
            concept: "Emotional Co-regulation",
            description: "The practice of helping your child manage their emotions by first managing your own emotional state.",
            importance: "When you remain calm during your child's emotional moments, you provide a secure base that helps them learn to self-regulate over time."
          },
          {
            concept: "Growth Mindset Modeling", 
            description: "Demonstrating how to approach challenges as learning opportunities rather than fixed abilities.",
            importance: "Children who develop a growth mindset are more resilient, creative, and willing to take on challenges throughout their lives."
          }
        ]).map((consideration: any, index: number) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
            <div className="mb-4">
              <h5 className="font-semibold text-neutral-800 text-lg mb-3 flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary text-sm font-bold">{index + 1}</span>
                </div>
                {consideration.concept}
              </h5>
              <p className="text-neutral-700 leading-relaxed mb-4">
                {consideration.description}
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <p className="text-blue-800 font-medium mb-2">Why it matters:</p>
              <p className="text-blue-700 leading-relaxed">
                {consideration.importance}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}