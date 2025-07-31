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
import { FaGoogle, FaFacebook, FaApple, FaGithub } from "react-icons/fa";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
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

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual authentication logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Account Created!",
        description: "Welcome to ParentJourney! Your account has been created successfully.",
      });
      setOpen(false);
      signUpForm.reset();
    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual authentication logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Welcome Back!",
        description: "You've been logged in successfully.",
      });
      setOpen(false);
      loginForm.reset();
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true);
    try {
      // Simulate social auth - replace with actual OAuth implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: `${provider} Authentication`,
        description: `Successfully authenticated with ${provider}!`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: `Failed to authenticate with ${provider}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const socialProviders = [
    { name: "Google", icon: FaGoogle, color: "hover:bg-red-50 border-red-200 hover:border-red-300" },
    { name: "Facebook", icon: FaFacebook, color: "hover:bg-blue-50 border-blue-200 hover:border-blue-300" },
    { name: "Apple", icon: FaApple, color: "hover:bg-gray-50 border-gray-200 hover:border-gray-300" },
    { name: "GitHub", icon: FaGithub, color: "hover:bg-gray-50 border-gray-200 hover:border-gray-300" },
  ];

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
          {/* Social Authentication */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {socialProviders.slice(0, 2).map((provider) => {
                const IconComponent = provider.icon;
                return (
                  <Button
                    key={provider.name}
                    variant="outline"
                    onClick={() => handleSocialAuth(provider.name)}
                    disabled={isLoading}
                    className={`${provider.color} transition-all hover-scale animate-pop-in`}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {provider.name}
                  </Button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {socialProviders.slice(2).map((provider) => {
                const IconComponent = provider.icon;
                return (
                  <Button
                    key={provider.name}
                    variant="outline"
                    onClick={() => handleSocialAuth(provider.name)}
                    disabled={isLoading}
                    className={`${provider.color} transition-all hover-scale animate-pop-in`}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {provider.name}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or use email
              </span>
            </div>
          </div>

          {/* Email Authentication Forms */}
          {mode === 'signup' ? (
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
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
                <FormField
                  control={loginForm.control}
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