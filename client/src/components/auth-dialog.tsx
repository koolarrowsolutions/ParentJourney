import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Mail, Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";


const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

interface AuthDialogProps {
  mode: 'login' | 'signup';
  trigger: React.ReactNode;
}

export function AuthDialog({ mode: initialMode, trigger }: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      console.log('Attempting signup with:', { username: data.username, email: data.email }); // Debug log
      
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are included
        body: JSON.stringify({
          username: data.username,
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      console.log('Signup response:', { status: response.status, result }); // Debug log

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      toast({
        title: "Account Created!",
        description: "Welcome to ParentJourney! Your account has been created successfully.",
      });
      signUpForm.reset();
      
      // Close dialog first to avoid visual issues
      setOpen(false);
      
      // Invalidate auth queries and wait for refetch to ensure state is properly updated
      await queryClient.invalidateQueries({ queryKey: ['/auth/user'] });
      
      // Force immediate refetch to update auth state
      await queryClient.refetchQueries({ queryKey: ['/auth/user'] });
    } catch (error) {
      console.error('Signup error:', error); // Debug log
      toast({
        title: "Sign Up Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { performLogin } = await import('@/utils/auth-persistence');
      const result = await performLogin(data.identifier, data.password);

      if (result.success) {
        // Note: Login success feedback is now handled by LoginConfirmationModal
        // which appears at the top center with rotating parenting quotes
        loginForm.reset();
        
        // Close dialog first to avoid visual issues
        setOpen(false);
        
        // Invalidate all queries to force fresh data with new token
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
        queryClient.invalidateQueries({ queryKey: ['/api/child-profiles'] });
        queryClient.invalidateQueries({ queryKey: ['/api/parent-profile'] });
        queryClient.invalidateQueries({ queryKey: ['/api/journal-stats'] });
        
        // Clear all cache to ensure fresh state
        console.log('Login successful - clearing cache to reload with new token');
        queryClient.clear();
        
        // Force immediate refetch of all data with new token
        console.log('Login successful - refetching all queries with new authentication');
        setTimeout(async () => {
          // Refetch all critical queries
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ['/api/auth/user'] }),
            queryClient.refetchQueries({ queryKey: ['/api/journal-entries'] }),
            queryClient.refetchQueries({ queryKey: ['/api/child-profiles'] }),
            queryClient.refetchQueries({ queryKey: ['/api/parent-profile'] }),
            queryClient.refetchQueries({ queryKey: ['/api/journal-stats'] })
          ]);
          console.log('All queries refetched after login');
        }, 300);
      } else {
        throw new Error(result.error || 'Failed to log in');
      }
    } catch (error) {
      console.error('Login error:', error); // Debug log
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            {mode === 'login' ? (
              <>
                <LogIn className="mr-2 h-5 w-5 text-primary" />
                Welcome Back to ParentJourney
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-5 w-5 text-primary" />
                Join ParentJourney
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? "Sign in to continue your parenting journey and access your entries"
              : "Create your account to start documenting your parenting journey with AI insights"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Authentication Forms */}
          {mode === 'signup' ? (
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <FormField
                  control={signUpForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a unique username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Create a password" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="Confirm your password" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating your account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                {/* Demo Login Helper */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 mb-2">
                    <strong>Quick Demo Access:</strong>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        loginForm.setValue('identifier', 'esanjosechicano');
                        loginForm.setValue('password', '123456');
                      }}
                    >
                      Fill Demo User
                    </Button>
                  </div>
                </div>
                
                <FormField
                  control={loginForm.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username or Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username or email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter your password" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <Button variant="link" className="px-0 text-sm">
                    Forgot password?
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing you in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          )}

          {/* Switch between login/signup */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account yet? " : "Already have an account? "}
              <Button
                variant="link"
                className="px-0 font-medium hover:text-primary animate-pop-in"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? 'Create one here' : 'Sign in here'}
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}