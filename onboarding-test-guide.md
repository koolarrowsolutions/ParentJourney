# Onboarding Testing Guide

## How to Test the Complete Flow

### Reset Onboarding (Option 1 - Browser Console)
1. Open browser developer tools (F12)
2. Go to Console tab
3. Run: `localStorage.removeItem('onboarding_e27e4a3f-92ea-40bf-860d-a0f4c469e91b')`
4. Refresh the page

### Reset Onboarding (Option 2 - Manual)
1. Go to browser developer tools (F12)
2. Go to Application tab
3. Expand Local Storage
4. Find and delete the key starting with "onboarding_"
5. Refresh the page

## Test Scenarios

### 1. Initial Welcome Flow
- Should show "Welcome to ParentJourney" modal
- Step 1 of 4 progress indicator
- Next button should advance to step 2
- Back button should be disabled on first step

### 2. Feature Introduction
- Each step should highlight different features
- Progress indicator should update (2 of 4, 3 of 4, etc.)
- Content should be relevant and helpful

### 3. Navigation Testing
- Test Next button functionality
- Test Back button functionality
- Test Skip button (if available)
- Test X close button

### 4. Completion Flow
- Final step should offer completion
- After completion, should progress to feature tour
- Main dashboard should remain visible throughout
- No blank screens should occur

### 5. Tour System Testing
- After initial onboarding, should show feature tour
- Tour should highlight specific UI elements
- Should be able to skip or complete tour
- Final completion should show normal dashboard

## Expected Behavior
- Onboarding appears automatically for new users
- Main content visible behind modal
- Smooth transitions between steps
- Proper progress tracking
- Clean completion without errors
- Normal dashboard functionality after completion

## Reset Command for Testing
```javascript
localStorage.removeItem('onboarding_e27e4a3f-92ea-40bf-860d-a0f4c469e91b')
```