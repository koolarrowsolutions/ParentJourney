import { Heart, Settings, User } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Heart className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-800">ParentJourney 🌱</h1>
              <p className="text-xs text-neutral-500">✨ Reflect. Grow. Thrive. ✨</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-neutral-600 hover:text-primary transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <User className="text-white h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
