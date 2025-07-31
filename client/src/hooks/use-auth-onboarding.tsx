import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ParentProfile } from "@shared/schema";

interface AuthOnboardingState {
  isNewUser: boolean;
  hasCompletedOnboarding: boolean;
  shouldShowOnboarding: boolean;
  parentProfile: ParentProfile | undefined;
}

export function useAuthOnboarding() {
  const [authState, setAuthState] = useState({
    isNewUser: false,
    hasJustSignedUp: false,
    hasCompletedOnboarding: false,
    showOnboarding: false,
  });

  const { data: parentProfile, isLoading } = useQuery<ParentProfile>({
    queryKey: ["/api/parent-profile"],
    queryFn: async () => {
      const response = await fetch("/api/parent-profile");
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch parent profile");
      }
      return response.json();
    },
    retry: false,
  });

  // Check localStorage for onboarding state
  useEffect(() => {
    const hasJustSignedUp = localStorage.getItem("hasJustSignedUp") === "true";
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding") === "true";
    const hasDismissedOnboarding = localStorage.getItem("hasDismissedOnboarding") === "true";

    setAuthState(prev => ({
      ...prev,
      hasJustSignedUp,
      hasCompletedOnboarding,
      showOnboarding: hasJustSignedUp && !parentProfile && !hasDismissedOnboarding,
    }));
  }, [parentProfile]);

  const markUserAsSignedUp = () => {
    localStorage.setItem("hasJustSignedUp", "true");
    setAuthState(prev => ({
      ...prev,
      hasJustSignedUp: true,
      showOnboarding: !parentProfile,
    }));
  };

  const completeOnboarding = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    localStorage.removeItem("hasJustSignedUp");
    localStorage.removeItem("hasDismissedOnboarding");
    setAuthState(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
      showOnboarding: false,
    }));
  };

  const dismissOnboarding = () => {
    localStorage.setItem("hasDismissedOnboarding", "true");
    setAuthState(prev => ({
      ...prev,
      showOnboarding: false,
    }));
  };

  const triggerOnboardingForProfileAccess = () => {
    const hasDismissedOnboarding = localStorage.getItem("hasDismissedOnboarding") === "true";
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding") === "true";
    
    // Only trigger if user hasn't completed onboarding and doesn't have a profile
    if (!hasCompletedOnboarding && !parentProfile && !authState.showOnboarding) {
      setAuthState(prev => ({
        ...prev,
        showOnboarding: true,
      }));
      return true; // Indicates onboarding was triggered
    }
    return false; // Profile access allowed
  };

  return {
    isLoading,
    parentProfile,
    shouldShowOnboarding: authState.showOnboarding,
    hasJustSignedUp: authState.hasJustSignedUp,
    hasCompletedOnboarding: authState.hasCompletedOnboarding,
    markUserAsSignedUp,
    completeOnboarding,
    dismissOnboarding,
    triggerOnboardingForProfileAccess,
  };
}