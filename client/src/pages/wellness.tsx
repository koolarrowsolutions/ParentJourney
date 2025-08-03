import { WellnessSuggestions } from '@/components/wellness-suggestions';
import { Header } from '@/components/header';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Sparkles, ArrowLeft } from 'lucide-react';

export function Wellness() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-neutral-100 animate-pop-in hover-scale button-press"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Wellness Suggestions</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Personalized wellness suggestions tailored to your parenting journey. 
              Take small steps toward better self-care and emotional well-being.
            </p>
          </div>
          
          <WellnessSuggestions />
        </div>
      </div>
    </div>
  );
}