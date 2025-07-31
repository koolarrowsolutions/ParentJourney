import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MilestoneTracking } from "@/components/milestone-tracking";

export default function Milestones() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 animate-fade-in">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" className="hover-scale">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-neutral-800">🎯 Milestone Tracking</h1>
              <p className="text-neutral-600">Track and celebrate your child's developmental achievements</p>
            </div>
          </div>
        </div>

        {/* Milestone Tracking Component */}
        <div className="animate-scale-in">
          <MilestoneTracking />
        </div>
      </div>
    </div>
  );
}