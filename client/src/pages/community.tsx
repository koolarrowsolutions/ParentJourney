import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { VoiceInput } from "@/components/voice-input";
import { MessageCircle, Heart, Users, Plus, Filter, Search, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { CommunityPost, CommunityComment, InsertCommunityPost, InsertCommunityComment } from "@shared/schema";

export function Community() {
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newPost, setNewPost] = useState<InsertCommunityPost>({
    parentId: "", // Will be set from auth
    title: "",
    content: "",
    category: "General",
    isAnonymous: "false"
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch community posts
  const { data: posts = [], isLoading } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts"],
    queryFn: async () => {
      const token = localStorage.getItem('parentjourney_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/community/posts", {
        headers,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    enabled: !!localStorage.getItem('parentjourney_token'), // Only fetch when authenticated
    staleTime: 30000, // Cache for 30 seconds
    retry: false // Don't retry on auth failures
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: InsertCommunityPost) => {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setIsNewPostOpen(false);
      setNewPost({
        parentId: "",
        title: "",
        content: "",
        category: "General",
        isAnonymous: "false"
      });
      toast({
        title: "Post Created!",
        description: "Your post has been shared with the community.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "all", label: "All Posts" },
    { value: "General", label: "General Discussion" },
    { value: "Advice", label: "Seeking Advice" },
    { value: "Milestone", label: "Milestones & Celebrations" },
    { value: "Support", label: "Support & Encouragement" },
    { value: "Tips", label: "Tips & Resources" }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch = searchTerm === "" || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreatePost = () => {
    if (newPost.title.trim() && newPost.content.trim()) {
      createPostMutation.mutate(newPost);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "Advice": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Milestone": return "bg-green-100 text-green-800 border-green-200";
      case "Support": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Tips": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <Link href="/">
            <Button variant="outline" className="hover-scale">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main
            </Button>
          </Link>
        </div>
        <div className="text-center mt-4">
          <h1 className="text-3xl font-bold text-neutral-800">💬 Community</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Connect with other parents, share experiences, seek advice, and celebrate milestones together. 
            You're not alone in this parenting journey.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
          <DialogTrigger asChild>
            <Button className="interactive-card hover-lift button-press">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Share with the Community</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="pr-12"
                />
                <VoiceInput 
                  onTranscription={(text) => setNewPost(prev => ({ ...prev, title: prev.title + ' ' + text }))}
                  isInline 
                />
              </div>
              
              <div className="relative">
                <Textarea
                  placeholder="Share your thoughts, ask for advice, or celebrate a milestone..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[120px] pr-12"
                />
                <VoiceInput 
                  onTranscription={(text) => setNewPost(prev => ({ ...prev, content: prev.content + ' ' + text }))}
                  isInline
                  className="bottom-2"
                />
              </div>

              <Select 
                value={newPost.category} 
                onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.value !== "all").map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newPost.isAnonymous === "true"}
                  onChange={(e) => setNewPost(prev => ({ ...prev, isAnonymous: e.target.checked ? "true" : "false" }))}
                  className="rounded"
                />
                <label htmlFor="anonymous" className="text-sm text-neutral-700">
                  Post anonymously
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewPostOpen(false)}
                  disabled={createPostMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPost.title.trim() || !newPost.content.trim() || createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? "Posting..." : "Share Post"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading community posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 mb-2">No Posts Yet</h3>
              <p className="text-neutral-600 mb-4">
                {searchTerm || selectedCategory !== "all" 
                  ? "No posts match your current filters." 
                  : "Be the first to start a conversation in the community!"}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="interactive-card hover-lift animate-pop-fade">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getCategoryColor(post.category)}>
                        {post.category}
                      </Badge>
                      <span className="text-xs text-neutral-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-neutral-800">{post.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-neutral-700 leading-relaxed mb-4">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{Array.isArray(post.likes) ? post.likes.length : 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                  <span className="text-xs">
                    {post.isAnonymous === "true" ? "Anonymous Parent" : "Community Member"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}