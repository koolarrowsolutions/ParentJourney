import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Clock, Heart, Star, Brain, Baby, Users, Home } from "lucide-react";

interface Template {
  id: string;
  title: string;
  category: string;
  icon: string;
  prompt: string;
  questions: string[];
  color: string;
}

const QUICK_TEMPLATES: Template[] = [
  {
    id: "daily-highlight",
    title: "Daily Highlight",
    category: "daily",
    icon: "🌟",
    color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    prompt: "Today's highlight with my child was...",
    questions: [
      "What was the best moment with your child today?",
      "What made you smile or laugh together?",
      "What are you grateful for from today?",
      "How did your child surprise you today?"
    ]
  },
  {
    id: "challenge-moment",
    title: "Challenge Overcome",
    category: "challenges",
    icon: "💪",
    color: "bg-blue-50 border-blue-200 text-blue-800",
    prompt: "Today we faced a challenge when...",
    questions: [
      "What challenge did you encounter today?",
      "How did you handle the situation?",
      "What did you learn from this experience?",
      "How might you approach this differently next time?"
    ]
  },
  {
    id: "proud-moment",
    title: "Proud Parent Moment",
    category: "achievements",
    icon: "🏆",
    color: "bg-green-50 border-green-200 text-green-800",
    prompt: "I felt so proud when my child...",
    questions: [
      "What did your child do that made you proud?",
      "How did you celebrate this achievement?",
      "What progress have you noticed recently?",
      "How did this moment make you feel as a parent?"
    ]
  },
  {
    id: "bedtime-routine",
    title: "Bedtime Reflection",
    category: "routines",
    icon: "🌙",
    color: "bg-purple-50 border-purple-200 text-purple-800",
    prompt: "Tonight's bedtime routine was...",
    questions: [
      "How did bedtime go tonight?",
      "What stories or songs did you share?",
      "What did your child talk about before sleep?",
      "How are you feeling as you end the day?"
    ]
  },
  {
    id: "learning-together",
    title: "Learning Adventure",
    category: "development",
    icon: "📚",
    color: "bg-indigo-50 border-indigo-200 text-indigo-800",
    prompt: "Today we learned something new together...",
    questions: [
      "What new skill or concept did your child explore?",
      "How did you support their learning?",
      "What questions did they ask?",
      "What do you want to explore together next?"
    ]
  },
  {
    id: "emotional-moment",
    title: "Emotional Check-in",
    category: "emotions",
    icon: "💗",
    color: "bg-pink-50 border-pink-200 text-pink-800",
    prompt: "Today my child's emotions were...",
    questions: [
      "What emotions did your child express today?",
      "How did you help them process their feelings?",
      "What triggered strong emotions?",
      "How are you managing your own emotions as a parent?"
    ]
  },
  {
    id: "social-interaction",
    title: "Social Moments",
    category: "social",
    icon: "👥",
    color: "bg-cyan-50 border-cyan-200 text-cyan-800",
    prompt: "Today's social interactions included...",
    questions: [
      "Who did your child interact with today?",
      "How did they behave in social situations?",
      "What social skills are they developing?",
      "How do they handle sharing and cooperation?"
    ]
  },
  {
    id: "milestone-tracking",
    title: "Development Check",
    category: "milestones",
    icon: "📈",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    prompt: "I noticed my child's development in...",
    questions: [
      "What new skills or abilities have you noticed?",
      "How is their physical development progressing?",
      "What changes in communication have you observed?",
      "What milestones are you working toward together?"
    ]
  },
  {
    id: "family-time",
    title: "Family Bonding",
    category: "family",
    icon: "🏠",
    color: "bg-orange-50 border-orange-200 text-orange-800",
    prompt: "Our family time today included...",
    questions: [
      "What activities did you do as a family?",
      "How did everyone participate and contribute?",
      "What traditions or routines brought you closer?",
      "What made this time special for your family?"
    ]
  },
  {
    id: "self-care",
    title: "Parent Self-Care",
    category: "wellness",
    icon: "🧘",
    color: "bg-violet-50 border-violet-200 text-violet-800",
    prompt: "Taking care of myself today meant...",
    questions: [
      "How did you take care of yourself today?",
      "What recharged your energy as a parent?",
      "What support did you receive or give?",
      "How are you balancing parenting with personal needs?"
    ]
  }
];

interface QuickTemplatesProps {
  onTemplateSelect: (content: string) => void;
}

export function QuickTemplates({ onTemplateSelect }: QuickTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customContent, setCustomContent] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { value: "all", label: "All Templates", icon: "📝" },
    { value: "daily", label: "Daily Moments", icon: "☀️" },
    { value: "challenges", label: "Challenges", icon: "💪" },
    { value: "achievements", label: "Achievements", icon: "🏆" },
    { value: "development", label: "Development", icon: "📚" },
    { value: "emotions", label: "Emotions", icon: "💗" },
    { value: "family", label: "Family", icon: "🏠" },
    { value: "wellness", label: "Self-Care", icon: "🧘" }
  ];

  const filteredTemplates = activeCategory === "all" 
    ? QUICK_TEMPLATES 
    : QUICK_TEMPLATES.filter(t => t.category === activeCategory);

  const useTemplate = (template: Template) => {
    const content = `${template.prompt}

${template.questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}

---
💭 My thoughts:
`;
    onTemplateSelect(content);
  };

  const useCustomTemplate = () => {
    if (selectedTemplate && customContent.trim()) {
      const content = `${selectedTemplate.prompt}

${customContent}`;
      onTemplateSelect(content);
      setCustomContent("");
      setSelectedTemplate(null);
    }
  };

  return (
    <Card className="shadow-sm border border-neutral-200 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5 text-primary" />
          ⚡ Quick Entry Templates
        </CardTitle>
        <div className="text-sm text-neutral-600">
          Start your journal with guided prompts and questions
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.value}
              variant={activeCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.value)}
              className="text-xs hover-scale"
            >
              {category.icon} {category.label}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover-lift ${template.color}`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{template.icon}</span>
                  <span className="font-medium text-sm">{template.title}</span>
                </div>
                <Clock className="h-4 w-4 opacity-60" />
              </div>
              
              <p className="text-xs opacity-80 mb-3">
                {template.prompt}
              </p>
              
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  {template.questions.length} prompts
                </Badge>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    useTemplate(template);
                  }}
                  className="text-xs h-6 px-2 hover-scale"
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Template Detail Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <span className="text-2xl mr-3">{selectedTemplate.icon}</span>
                  {selectedTemplate.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${selectedTemplate.color}`}>
                  <p className="font-medium mb-3">{selectedTemplate.prompt}</p>
                  <div className="space-y-2">
                    {selectedTemplate.questions.map((question, index) => (
                      <div key={index} className="text-sm opacity-90">
                        <strong>{index + 1}.</strong> {question}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    💭 Your thoughts (optional - you can also use the full template):
                  </label>
                  <Textarea
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Start writing your thoughts here, or click 'Use Full Template' to get all the prompts..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => useTemplate(selectedTemplate)}
                    className="flex-1"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Use Full Template
                  </Button>
                  {customContent.trim() && (
                    <Button
                      onClick={useCustomTemplate}
                      variant="outline"
                      className="flex-1"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Use Custom Entry
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <h4 className="font-medium text-neutral-800 mb-2 flex items-center">
            <Brain className="mr-2 h-4 w-4" />
            💡 Template Tips
          </h4>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• Templates provide structured prompts to get you started</li>
            <li>• Feel free to modify or expand on any template</li>
            <li>• Use templates consistently to track patterns over time</li>
            <li>• Mix templates with free-form entries for variety</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}