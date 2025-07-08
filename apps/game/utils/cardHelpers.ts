import { CardOption } from '@repo/shared';

// Remove parameter hints from option text for players without boosters
export function hideOptionParameters(text: string): string {
  // Remove content in parentheses that contains numbers with 'g' (gold) or mentions costs/gains
  const cleanedText = text
    .replace(/\s*\([^)]*\d+g[^)]*\)/gi, '') // Remove (costs 200g), (gain 100g), etc.
    .replace(/\s*\([^)]*cost[^)]*\)/gi, '') // Remove (costs X), (no cost), etc.
    .replace(/\s*\([^)]*gain[^)]*\)/gi, '') // Remove (gain X), etc.
    .replace(/\s*\([^)]*pay[^)]*\)/gi, '') // Remove (pay X), etc.
    .replace(/\s*\([^)]*free[^)]*\)/gi, '') // Remove (free), etc.
    .replace(/\s*\([^)]*per turn[^)]*\)/gi, '') // Remove (X per turn), etc.
    .trim();
  
  return cleanedText;
}

// Check if user has parameter visibility booster (future implementation)
export function hasParameterBooster(userId: string): boolean {
  // TODO: Implement booster check when booster system is added
  // For now, always return false to hide parameters
  return false;
}

// Process card options based on user's boosters
export function processCardOptions(
  options: CardOption[], 
  userId: string
): CardOption[] {
  const showParameters = hasParameterBooster(userId);
  
  if (showParameters) {
    return options;
  }
  
  // Hide parameters from option text
  return options.map(option => ({
    ...option,
    text: hideOptionParameters(option.text)
  }));
}

// Get hint text for hidden parameters
export function getParameterHint(): string {
  return "?";
}

// Format hidden consequence display
export function formatHiddenConsequence(type: 'money' | 'reputation'): string {
  switch (type) {
    case 'money':
      return "? gold";
    case 'reputation':
      return "? reputation";
    default:
      return "?";
  }
}