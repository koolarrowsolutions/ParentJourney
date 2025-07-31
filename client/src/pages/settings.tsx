import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NotificationSystem } from "@/components/notification-system";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 animate-fade-in">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover-scale">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Journal
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-neutral-800">⚙️ Settings</h1>
              <p className="text-neutral-600">Customize your ParentJourney experience</p>
            </div>
          </div>
        </div>

        {/* Settings Components */}
        <div className="space-y-8 animate-scale-in">
          <NotificationSystem />
        </div>
      </div>
    </div>
  );
}