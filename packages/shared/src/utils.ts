export function formatMoney(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

export function formatReputation(reputation: number): string {
  if (reputation > 0) {
    return `+${reputation}`;
  }
  return reputation.toString();
}

export function calculateRiskPercentage(reputation: number): number {
  if (reputation <= -100) return 95;
  if (reputation <= -75) return 70;
  if (reputation <= -50) return 50;
  if (reputation <= -25) return 30;
  if (reputation <= 0) return 20;
  if (reputation <= 25) return 15;
  if (reputation <= 50) return 10;
  if (reputation <= 75) return 5;
  return 2;
}

export function getReputationLabel(reputation: number): string {
  if (reputation <= -100) return 'Criminal';
  if (reputation <= -75) return 'Villain';
  if (reputation <= -50) return 'Hated';
  if (reputation <= -25) return 'Disliked';
  if (reputation <= 25) return 'Neutral';
  if (reputation <= 50) return 'Liked';
  if (reputation <= 75) return 'Respected';
  if (reputation < 100) return 'Admired';
  return 'Hero';
}

export function randomSelect<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}