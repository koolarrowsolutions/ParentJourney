import { Heart, Settings, User, BarChart3, Trophy } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <Link href="/">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-primary/90 transition-colors">
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
          <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
            <Link href="/analytics">
              <button className="text-neutral-600 hover:text-primary transition-colors p-1 sm:p-2 rounded-lg hover:bg-neutral-100">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Analytics</span>
              </button>
            </Link>
            <Link href="/milestones">
              <button className="text-neutral-600 hover:text-primary transition-colors p-1 sm:p-2 rounded-lg hover:bg-neutral-100">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Milestones</span>
              </button>
            </Link>
            <Link href="/settings">
              <button className="text-neutral-600 hover:text-primary transition-colors p-1 sm:p-2 rounded-lg hover:bg-neutral-100">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Settings</span>
              </button>
            </Link>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <User className="text-white h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
