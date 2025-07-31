import "express-session";

declare module "express-session" {
  interface SessionData {
    hasJustSignedUp?: boolean;
    hasCompletedOnboarding?: boolean;
    hasDismissedOnboarding?: boolean;
  }
}