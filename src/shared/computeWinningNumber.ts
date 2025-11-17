export function computeWinningNumber(homeScore: number, awayScore: number): number {
  // Total points scored in the game
  const total = homeScore + awayScore

  // Last digit of the total (0–9). The % 10 is just “give me the last digit”.
  // Example: 24 + 21 = 45 → 45 % 10 = 5
  return Math.abs(total) % 10
}
