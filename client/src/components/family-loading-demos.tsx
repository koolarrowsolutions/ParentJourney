import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function FamilyLoadingDemos() {
  const [activeDemo, setActiveDemo] = useState<string>("family-walk");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 2));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const demos = [
    { id: "family-walk", name: "Family Walk" },
    { id: "building-blocks", name: "Building Blocks" },
    { id: "bedtime-story", name: "Bedtime Story" },
    { id: "heart-connection", name: "Heart Connection" },
    { id: "growth-tree", name: "Growth Tree" }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Family Loading Animations</h2>
        <p className="text-gray-600">Playful loading states that celebrate parenting moments</p>
      </div>

      {/* Demo Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {demos.map((demo) => (
          <Button
            key={demo.id}
            variant={activeDemo === demo.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveDemo(demo.id)}
            className="transition-all hover-scale"
          >
            {demo.name}
          </Button>
        ))}
      </div>

      {/* Animation Display */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-primary/20">
        <CardContent className="p-8 flex items-center justify-center min-h-[300px]">
          {activeDemo === "family-walk" && <FamilyWalkAnimation progress={progress} />}
          {activeDemo === "building-blocks" && <BuildingBlocksAnimation progress={progress} />}
          {activeDemo === "bedtime-story" && <BedtimeStoryAnimation progress={progress} />}
          {activeDemo === "heart-connection" && <HeartConnectionAnimation progress={progress} />}
          {activeDemo === "growth-tree" && <GrowthTreeAnimation progress={progress} />}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-600">
        Progress: {Math.round(progress)}% • Animations restart automatically
      </div>
    </div>
  );
}

function FamilyWalkAnimation({ progress }: { progress: number }) {
  const walkCycle = Math.sin(progress * 0.2) * 5;
  
  return (
    <div className="relative w-64 h-32 flex items-end justify-center">
      {/* Walking Path */}
      <div className="absolute bottom-4 w-full h-1 bg-green-200 rounded-full"></div>
      
      {/* Parent Figure */}
      <div 
        className="absolute bottom-4 transition-all duration-100"
        style={{ 
          left: `${20 + (progress * 0.6)}%`,
          transform: `translateY(${walkCycle}px)` 
        }}
      >
        <svg width="40" height="60" viewBox="0 0 40 60" className="text-blue-600">
          {/* Head */}
          <circle cx="20" cy="10" r="8" fill="currentColor" />
          {/* Body */}
          <rect x="15" y="18" width="10" height="25" rx="5" fill="currentColor" />
          {/* Arms */}
          <rect 
            x="8" y="22" width="6" height="2" rx="1" fill="currentColor"
            style={{ transform: `rotate(${walkCycle * 2}deg)`, transformOrigin: '11px 23px' }}
          />
          <rect 
            x="26" y="22" width="6" height="2" rx="1" fill="currentColor"
            style={{ transform: `rotate(${-walkCycle * 2}deg)`, transformOrigin: '29px 23px' }}
          />
          {/* Legs */}
          <rect 
            x="16" y="43" width="3" height="15" rx="1.5" fill="currentColor"
            style={{ transform: `rotate(${walkCycle}deg)`, transformOrigin: '17.5px 43px' }}
          />
          <rect 
            x="21" y="43" width="3" height="15" rx="1.5" fill="currentColor"
            style={{ transform: `rotate(${-walkCycle}deg)`, transformOrigin: '22.5px 43px' }}
          />
        </svg>
      </div>

      {/* Child Figure */}
      <div 
        className="absolute bottom-4 transition-all duration-100"
        style={{ 
          left: `${35 + (progress * 0.6)}%`,
          transform: `translateY(${walkCycle * 0.8}px)` 
        }}
      >
        <svg width="25" height="40" viewBox="0 0 25 40" className="text-pink-500">
          {/* Head */}
          <circle cx="12.5" cy="7" r="6" fill="currentColor" />
          {/* Body */}
          <rect x="9" y="13" width="7" height="15" rx="3.5" fill="currentColor" />
          {/* Arms */}
          <rect 
            x="4" y="16" width="4" height="1.5" rx="0.75" fill="currentColor"
            style={{ transform: `rotate(${walkCycle * 3}deg)`, transformOrigin: '6px 16.75px' }}
          />
          <rect 
            x="17" y="16" width="4" height="1.5" rx="0.75" fill="currentColor"
            style={{ transform: `rotate(${-walkCycle * 3}deg)`, transformOrigin: '19px 16.75px' }}
          />
          {/* Legs */}
          <rect 
            x="10" y="28" width="2" height="10" rx="1" fill="currentColor"
            style={{ transform: `rotate(${walkCycle * 1.5}deg)`, transformOrigin: '11px 28px' }}
          />
          <rect 
            x="13" y="28" width="2" height="10" rx="1" fill="currentColor"
            style={{ transform: `rotate(${-walkCycle * 1.5}deg)`, transformOrigin: '14px 28px' }}
          />
        </svg>
      </div>

      {/* Loading Text */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <p className="text-sm font-medium text-gray-700">Taking a family walk...</p>
      </div>
    </div>
  );
}

function BuildingBlocksAnimation({ progress }: { progress: number }) {
  const blockHeight = Math.min(progress / 20, 5);
  
  return (
    <div className="relative w-64 h-32 flex items-end justify-center">
      {/* Parent Figure */}
      <div className="absolute bottom-8 left-16">
        <svg width="30" height="45" viewBox="0 0 30 45" className="text-blue-600">
          <circle cx="15" cy="8" r="6" fill="currentColor" />
          <rect x="12" y="14" width="6" height="20" rx="3" fill="currentColor" />
          <rect x="6" y="18" width="4" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="20" y="18" width="4" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="13" y="34" width="2" height="10" rx="1" fill="currentColor" />
          <rect x="15" y="34" width="2" height="10" rx="1" fill="currentColor" />
        </svg>
      </div>

      {/* Child Figure */}
      <div className="absolute bottom-8 right-16">
        <svg width="20" height="30" viewBox="0 0 20 30" className="text-pink-500">
          <circle cx="10" cy="5" r="4" fill="currentColor" />
          <rect x="8" y="9" width="4" height="12" rx="2" fill="currentColor" />
          <rect x="4" y="12" width="3" height="1" rx="0.5" fill="currentColor" />
          <rect x="13" y="12" width="3" height="1" rx="0.5" fill="currentColor" />
          <rect x="8.5" y="21" width="1.5" height="8" rx="0.75" fill="currentColor" />
          <rect x="10" y="21" width="1.5" height="8" rx="0.75" fill="currentColor" />
        </svg>
      </div>

      {/* Building Blocks */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        {[...Array(Math.floor(blockHeight))].map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 border-2 border-white animate-bounce-in`}
            style={{
              backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 5],
              animationDelay: `${i * 200}ms`,
              marginBottom: i === 0 ? '0' : '-2px'
            }}
          />
        ))}
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <p className="text-sm font-medium text-gray-700">Building memories together...</p>
      </div>
    </div>
  );
}

function BedtimeStoryAnimation({ progress }: { progress: number }) {
  const bookOpen = (progress % 40) > 20;
  
  return (
    <div className="relative w-64 h-32 flex items-center justify-center">
      {/* Parent Reading */}
      <div className="absolute left-8 bottom-4">
        <svg width="35" height="50" viewBox="0 0 35 50" className="text-purple-600">
          <circle cx="17.5" cy="10" r="7" fill="currentColor" />
          <rect x="14" y="17" width="7" height="22" rx="3.5" fill="currentColor" />
          <rect x="8" y="21" width="5" height="2" rx="1" fill="currentColor" />
          <rect x="22" y="21" width="5" height="2" rx="1" fill="currentColor" />
          <rect x="15" y="39" width="2" height="10" rx="1" fill="currentColor" />
          <rect x="18" y="39" width="2" height="10" rx="1" fill="currentColor" />
        </svg>
      </div>

      {/* Child Listening */}
      <div className="absolute right-8 bottom-4">
        <svg width="25" height="35" viewBox="0 0 25 35" className="text-orange-500">
          <circle cx="12.5" cy="7" r="5" fill="currentColor" />
          <rect x="10" y="12" width="5" height="15" rx="2.5" fill="currentColor" />
          <rect x="6" y="15" width="3" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="16" y="15" width="3" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="11" y="27" width="1.5" height="7" rx="0.75" fill="currentColor" />
          <rect x="12.5" y="27" width="1.5" height="7" rx="0.75" fill="currentColor" />
        </svg>
      </div>

      {/* Book */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div 
          className={`w-12 h-8 bg-yellow-400 border-2 border-yellow-600 rounded transition-all duration-300 ${
            bookOpen ? 'transform rotate-12' : ''
          }`}
        >
          <div className="w-full h-1 bg-yellow-600 mt-1"></div>
          <div className="w-3/4 h-1 bg-yellow-600 mt-1 ml-1"></div>
          <div className="w-2/3 h-1 bg-yellow-600 mt-1 ml-1"></div>
        </div>
      </div>

      {/* Story Elements */}
      {bookOpen && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          {['⭐', '🌙', '✨'].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-lg animate-bounce"
              style={{
                left: `${i * 30 - 30}px`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '2s'
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <p className="text-sm font-medium text-gray-700">Reading bedtime stories...</p>
      </div>
    </div>
  );
}

function HeartConnectionAnimation({ progress }: { progress: number }) {
  const heartBeat = Math.sin(progress * 0.3) * 0.1 + 1;
  
  return (
    <div className="relative w-64 h-32 flex items-center justify-center">
      {/* Parent */}
      <div className="absolute left-8">
        <svg width="30" height="45" viewBox="0 0 30 45" className="text-blue-600">
          <circle cx="15" cy="8" r="6" fill="currentColor" />
          <rect x="12" y="14" width="6" height="20" rx="3" fill="currentColor" />
          <rect x="6" y="18" width="4" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="20" y="18" width="4" height="1.5" rx="0.75" fill="currentColor" />
          <rect x="13" y="34" width="2" height="10" rx="1" fill="currentColor" />
          <rect x="15" y="34" width="2" height="10" rx="1" fill="currentColor" />
        </svg>
      </div>

      {/* Child */}
      <div className="absolute right-8">
        <svg width="20" height="30" viewBox="0 0 20 30" className="text-pink-500">
          <circle cx="10" cy="5" r="4" fill="currentColor" />
          <rect x="8" y="9" width="4" height="12" rx="2" fill="currentColor" />
          <rect x="4" y="12" width="3" height="1" rx="0.5" fill="currentColor" />
          <rect x="13" y="12" width="3" height="1" rx="0.5" fill="currentColor" />
          <rect x="8.5" y="21" width="1.5" height="8" rx="0.75" fill="currentColor" />
          <rect x="10" y="21" width="1.5" height="8" rx="0.75" fill="currentColor" />
        </svg>
      </div>

      {/* Floating Hearts */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-red-400 animate-bounce"
            style={{
              left: `${30 + i * 20}%`,
              top: `${20 + (i % 3) * 15}%`,
              fontSize: `${12 + i * 2}px`,
              animationDelay: `${i * 300}ms`,
              animationDuration: '2s',
              transform: `scale(${heartBeat})`
            }}
          >
            💕
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <p className="text-sm font-medium text-gray-700">Connecting hearts...</p>
      </div>
    </div>
  );
}

function GrowthTreeAnimation({ progress }: { progress: number }) {
  const treeHeight = Math.min(progress / 100 * 60, 60);
  const leafCount = Math.floor(progress / 20);
  
  return (
    <div className="relative w-64 h-32 flex items-end justify-center">
      {/* Tree Trunk */}
      <div 
        className="absolute bottom-0 w-4 bg-amber-700 rounded-t-lg transition-all duration-300"
        style={{ height: `${treeHeight * 0.6}px` }}
      ></div>

      {/* Tree Crown */}
      {treeHeight > 20 && (
        <div 
          className="absolute bg-green-500 rounded-full transition-all duration-300"
          style={{ 
            width: `${Math.min(treeHeight * 0.8, 40)}px`,
            height: `${Math.min(treeHeight * 0.8, 40)}px`,
            bottom: `${treeHeight * 0.5}px`,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        ></div>
      )}

      {/* Family Members as Leaves */}
      {[...Array(leafCount)].map((_, i) => (
        <div
          key={i}
          className="absolute text-xs animate-bounce-in"
          style={{
            left: `${45 + (i % 3) * 5}%`,
            bottom: `${treeHeight * 0.7 + (i % 2) * 10}px`,
            animationDelay: `${i * 400}ms`
          }}
        >
          {i % 2 === 0 ? '👨‍👩‍👧‍👦' : '🌿'}
        </div>
      ))}

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <p className="text-sm font-medium text-gray-700">Growing together...</p>
      </div>
    </div>
  );
}