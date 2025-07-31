import { Heart, Settings, User, BarChart3, Trophy, Archive, LogIn, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./auth-dialog";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50 animate-pop-fade">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <Link href="/">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-primary/90 transition-colors hover-scale button-press animate-gentle-bounce">
                <Heart className="text-white h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <Link href="/">
                <h1 className="text-lg sm:text-xl font-semibold text-neutral-800 truncate cursor-pointer hover:text-primary transition-colors">
                  <span className="hidden sm:inline">ParentJourney 🌱</span>
                  <span className="sm:hidden">ParentJourney</span>
                </h1>
              </Link>
              <p className="text-xs text-neutral-500 hidden sm:block truncate">✨ Reflect. Grow. Thrive. ✨</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <div className="hidden sm:flex items-center space-x-1">
              <Link href="/journal-history">
                <button className="text-neutral-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm button-press hover-scale">
                  <Archive className="h-4 w-4 mr-1 inline" />
                  History
                </button>
              </Link>
              <Link href="/analytics">
                <button className="text-neutral-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm button-press hover-scale">
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
              <Link href="/settings">
                <button className="text-neutral-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm button-press hover-scale">
                  <Settings className="h-4 w-4 mr-1 inline" />
                  Settings
                </button>
              </Link>
            </div>
            
            {/* Mobile Navigation */}
            <div className="sm:hidden flex items-center space-x-1">
              <Link href="/journal-history">
                <button className="text-neutral-600 hover:text-primary transition-colors p-2 rounded-lg hover:bg-neutral-100 button-press hover-scale">
                  <Archive className="h-5 w-5" />
                </button>
              </Link>
              <Link href="/analytics">
                <button className="text-neutral-600 hover:text-primary transition-colors p-2 rounded-lg hover:bg-neutral-100 button-press hover-scale">
                  <BarChart3 className="h-5 w-5" />
                </button>
              </Link>
              <Link href="/milestones">
                <button className="text-neutral-600 hover:text-primary transition-colors p-2 rounded-lg hover:bg-neutral-100 button-press hover-scale">
                  <Trophy className="h-5 w-5" />
                </button>
              </Link>
              <Link href="/settings">
                <button className="text-neutral-600 hover:text-primary transition-colors p-2 rounded-lg hover:bg-neutral-100 button-press hover-scale">
                  <Settings className="h-5 w-5" />
                </button>
              </Link>
            </div>
            
            {/* Authentication Buttons */}
            <div className="flex items-center space-x-2 ml-4 border-l border-neutral-200 pl-4">
              <AuthDialog 
                mode="login"
                trigger={
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-neutral-600 hover:text-primary hover:bg-neutral-100 hidden sm:flex"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Log In
                  </Button>
                }
              />
              <AuthDialog 
                mode="signup"
                trigger={
                  <Button 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2 sm:mr-2" />
                    <span className="hidden sm:inline">Sign Up</span>
                    <span className="sm:hidden">Join</span>
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
