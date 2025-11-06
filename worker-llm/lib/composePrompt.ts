/**
 * Prompt composition for LLM insight generation
 */

export interface WordCount {
  word: string;
  count: number;
}

export interface BetCounts {
  open: number;
  resolved: number;
}

export interface UserData {
  userId: string;
  day: Date;
  topWords: WordCount[];
  betCounts: BetCounts;
  brierScore: number;
  recentEntries: string[];
}

/**
 * Build the system prompt that defines the AI analyst's role
 */
export function buildSystemPrompt(): string {
  return `You are an analytical assistant that generates psychological and cognitive insights from user data.

Your task is to analyze a user's writing patterns, prediction bets, and activity to infer:
1. Main themes and topics they focus on (entities, concepts, domains)
2. Core worldview assumptions (implicit beliefs about how things work)
3. Overall sentiment and mood (analytical, optimistic, anxious, etc.)
4. Cognitive biases (confirmation bias, optimism bias, status-quo bias, etc.)
5. A concise summary of their thinking patterns

Important guidelines:
- Base insights on the actual data provided, don't make up information
- Be specific and evidence-based
- Identify patterns in word usage and prediction behavior
- Consider Brier score as a measure of calibration quality
- Keep insights actionable and constructive

You must return your response as valid JSON in the following format:
{
  "themes": ["theme1", "theme2", "theme3"],
  "assumptions": ["assumption1", "assumption2"],
  "mood": "descriptive mood string",
  "biases": ["bias1", "bias2"],
  "summary": "A 2-3 sentence summary of the user's cognitive patterns and focus areas"
}`;
}

/**
 * Build the user-specific prompt with their data
 */
export function buildUserPrompt(data: UserData): string {
  const { topWords, betCounts, brierScore, recentEntries } = data;
  
  // Format top words
  const wordsStr = topWords
    .slice(0, 15)
    .map(w => `"${w.word}" (${w.count}x)`)
    .join(', ');
  
  // Format bet statistics
  const totalBets = betCounts.open + betCounts.resolved;
  const brierStr = brierScore.toFixed(3);
  
  // Format recent entries (truncate if too long)
  const entriesStr = recentEntries
    .slice(0, 5)
    .map((text, i) => `${i + 1}. ${text.slice(0, 200)}${text.length > 200 ? '...' : ''}`)
    .join('\n\n');
  
  return `Analyze the following user data from the past day:

## Top Words & Phrases
${wordsStr || 'No significant words'}

## Prediction Betting Activity
- Total bets: ${totalBets}
- Open bets: ${betCounts.open}
- Resolved bets: ${betCounts.resolved}
- Brier Score: ${brierStr} (lower is better, 0.25 is baseline)

## Recent Journal Entries & Notes
${entriesStr || 'No entries available'}

Based on this data, provide a comprehensive cognitive and thematic analysis following the specified JSON format.`;
}

/**
 * Compose complete prompt pair (system + user)
 */
export function composePrompts(data: UserData): { system: string; user: string } {
  return {
    system: buildSystemPrompt(),
    user: buildUserPrompt(data),
  };
}


