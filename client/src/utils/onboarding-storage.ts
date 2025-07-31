// Onboarding and user state management
export interface OnboardingState {
  hasVisited: boolean;
  hasSignedUp: boolean;
  hasCompletedTour: boolean;
  skipTourRequested: boolean;
  lastVisitDate: string;
}

const ONBOARDING_STORAGE_KEY = 'parent-journey-onboarding';

export function getOnboardingState(): OnboardingState {
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading onboarding state:', error);
  }
  
  return {
    hasVisited: false,
    hasSignedUp: false,
    hasCompletedTour: false,
    skipTourRequested: false,
    lastVisitDate: new Date().toISOString(),
  };
}

export function saveOnboardingState(state: Partial<OnboardingState>) {
  try {
    const current = getOnboardingState();
    const updated = { ...current, ...state };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving onboarding state:', error);
  }
}

export function markFirstVisit() {
  saveOnboardingState({ 
    hasVisited: true, 
    lastVisitDate: new Date().toISOString() 
  });
}

export function markSignedUp() {
  saveOnboardingState({ 
    hasSignedUp: true,
    lastVisitDate: new Date().toISOString() 
  });
}

export function markTourCompleted() {
  saveOnboardingState({ 
    hasCompletedTour: true,
    lastVisitDate: new Date().toISOString() 
  });
}

export function markTourSkipped() {
  saveOnboardingState({ 
    skipTourRequested: true,
    hasCompletedTour: true,
    lastVisitDate: new Date().toISOString() 
  });
}

export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export function shouldShowSignUpPrompt(): boolean {
  const state = getOnboardingState();
  return state.hasVisited && !state.hasSignedUp;
}

export function shouldShowTour(): boolean {
  const state = getOnboardingState();
  return state.hasSignedUp && !state.hasCompletedTour && !state.skipTourRequested;
}

export function isFirstTimeVisitor(): boolean {
  const state = getOnboardingState();
  return !state.hasVisited;
}