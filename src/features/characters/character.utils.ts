export function getTierFromLevel(level: number): number {
  if (level >= 21) return 5;
  if (level >= 16) return 4;
  if (level >= 11) return 3;
  if (level >= 6) return 2;
  return 1;
}
