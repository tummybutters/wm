/**
 * Brier score calculation for probability calibration
 */

export interface BrierBet {
  probability: number;
  outcome: boolean | null;
}

/**
 * Compute Brier score: mean squared error between probability and outcome
 * Lower is better (0 = perfect calibration, 1 = worst)
 * Only considers resolved bets (outcome !== null)
 */
export function brierScore(bets: BrierBet[]): number {
  const resolved = bets.filter(b => b.outcome !== null);
  
  if (resolved.length === 0) {
    return 0;
  }
  
  const sum = resolved.reduce((s, b) => {
    const outcomeValue = b.outcome ? 1 : 0;
    return s + Math.pow(b.probability - outcomeValue, 2);
  }, 0);
  
  return sum / resolved.length;
}


