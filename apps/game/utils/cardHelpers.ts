import { CardOption } from '@repo/shared';

// Remove parameter hints from option text for players without boosters
export function hideOptionParameters(text: string): string {
  // Remove content in parentheses that contains monetary values or costs
  const cleanedText = text
    .replace(/\s*\(costs\s+\d+g\)/gi, '') // Remove (costs 20g), (costs 2000g), etc.
    .replace(/\s*\(\d+g\s+per\s+turn\)/gi, '') // Remove (100g per turn), etc.
    .replace(/\s*\([^)]*\d+g[^)]*\)/gi, '') // Remove any other parentheses with gold amounts
    .replace(/\s*\(free\)/gi, '') // Remove (free)
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