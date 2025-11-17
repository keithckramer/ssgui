/**
 * Compute the winning number for a game.
 *
 * Rule: homeScore + awayScore, then take the LAST digit (0–9).
 *
 * Example:
 *   homeScore = 24, awayScore = 21
 *   total = 45 → winningNumber = 5
 */
export function computeWinningNumber(homeScore: number, awayScore: number): number {
  const total = homeScore + awayScore

  // % 10 is just "give me the last digit"
  return Math.abs(total) % 10
}
