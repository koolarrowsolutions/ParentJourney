import { Heart, Settings, User, BarChart3, Trophy, Archive, LogIn, UserPlus, MessageCircle, LogOut, Leaf, Menu } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./auth-dialog";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50 animate-pop-fade">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-primary/90 transition-colors hover-scale button-press">
                <Heart className="text-white h-5 w-5" />
              </div>
            </Link>
            <div>
              <Link href="/">
                <h1 className="text-xl font-semibold text-neutral-800 cursor-pointer hover:text-primary transition-colors">
                  ParentJourney 🌱
                </h1>
              </Link>
              <p className="text-xs text-neutral-500 truncate">✨ Reflect. Grow. Thrive. ✨</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/journal-history">
              <button className="text-neutral-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm button-press hover-scale">
                <Archive className="h-4 w-4 mr-1 inline" />
                History
              </button>
            </Link>
            <Link href="/analytics">
              <button 
                data-onboarding="analytics-link"
                className="text-neutral-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm button-press hover-scale">
                <BarChart3 className="h-4 w-4 mr-1 inline" />
                Analytics
              </button>
            </Link>
            <Link href="/milestones">
              <button className="text-neutral-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm button-press hover-scale">
                <Trophy className="h-4 w-4 mr-1 inline" />
                Goals
              </button>
            </Link>
            <Link href="/community">
              <button className="text-neutral-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm button-press hover-scale">
                <MessageCircle className="h-4 w-4 mr-1 inline" />
                Community
              </button>
            </Link>
            <Link href="/wellness">
              <button className="text-neutral-600 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-primary text-sm button-press hover-scale">
                <Leaf className="h-4 w-4 mr-1 inline" />
                Wellness
              </button>
            </Link>
            <Link href="/settings">
              <button 
                data-onboarding="profile-link"
                className="text-neutral-600 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-primary text-sm button-press hover-scale">
                <Settings className="h-4 w-4 mr-1 inline" />
                Settings
              </button>
            </Link>
          </div>

          {/* Right side - Authentication and Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Desktop Authentication */}
            <div className="hidden md:flex items-center">
              {isLoading ? (
                <div className="h-8 w-20 bg-neutral-200 rounded animate-pulse"></div>
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-neutral-700 hover:text-white hover:bg-primary transition-colors hover-scale button-press"
                    >
                      <User className="h-4 w-4 mr-2" />
                      @{user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <AuthDialog
                    trigger={
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-neutral-700 hover:text-white hover:bg-primary transition-colors hover-scale button-press"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    }
                  />
                  <AuthDialog
                    defaultTab="signup"
                    trigger={
                      <Button 
                        size="sm" 
                        className="bg-primary text-white hover:bg-primary/90 hover-scale button-press"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Get Started
                      </Button>
                    }
                  />
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden p-2 hover-scale button-press"
                  data-testid="mobile-menu-button"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                      <Heart className="text-white h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-lg font-semibold">ParentJourney 🌱</span>
                      <p className="text-xs text-neutral-500">✨ Reflect. Grow. Thrive. ✨</p>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-8 space-y-4">
                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Link href="/journal-history">
                      <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-left text-neutral-600 hover:text-white hover:bg-primary rounded-lg transition-colors button-press"
                      >
                        <Archive className="h-5 w-5" />
                        <span>History</span>
                      </button>
                    </Link>
                    <Link href="/analytics">
                      <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-left text-neutral-600 hover:text-white hover:bg-primary rounded-lg transition-colors button-press"
                      >
                        <BarChart3 className="h-5 w-5" />
                        <span>Analytics</span>
                      </button>
                    </Link>
                    <Link href="/milestones">
                      <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-left text-neutral-600 hover:text-white hover:bg-primary rounded-lg transition-colors button-press"
                      >
                        <Trophy className="h-5 w-5" />
                        <span>Goals</span>
                      </button>
                    </Link>
                    <Link href="/community">
                      <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-left text-neutral-600 hover:text-white hover:bg-primary rounded-lg transition-colors button-press"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>Community</span>
                      </button>
                    </Link>
                    <Link href="/wellness">
                      <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-left text-neutral-600 hover:text-white hover:bg-primary rounded-lg transition-colors button-press"
                      >
                        <Leaf className="h-5 w-5" />
                        <span>Wellness</span>
                      </button>
                    </Link>
                    <Link href="/settings">
                      <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-left text-neutral-600 hover:text-white hover:bg-primary rounded-lg transition-colors button-press"
                      >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </button>
                    </Link>
                  </div>

                  {/* Authentication Section */}
                  <div className="pt-4 border-t border-neutral-200">
                    {isAuthenticated && user ? (
                      <div className="space-y-2">
                        <div className="px-3 py-2 bg-neutral-50 rounded-lg">
                          <p className="text-sm font-medium text-neutral-800">@{user.username}</p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                        </div>
                        <button 
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors button-press"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <AuthDialog
                          trigger={
                            <button className="w-full flex items-center space-x-3 px-3 py-3 text-left text-neutral-600 hover:text-white hover:bg-primary rounded-lg transition-colors button-press">
                              <LogIn className="h-5 w-5" />
                              <span>Sign In</span>
                            </button>
                          }
                        />
                        <AuthDialog
                          defaultTab="signup"
                          trigger={
                            <button className="w-full bg-primary text-white px-3 py-3 rounded-lg hover:bg-primary/90 transition-colors button-press flex items-center justify-center space-x-3">
                              <UserPlus className="h-5 w-5" />
                              <span>Get Started</span>
                            </button>
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}