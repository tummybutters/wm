import { stopwords } from './stopwords'

/**
 * Tokenizes text into words by splitting on non-letter characters,
 * converting to lowercase, and filtering out short tokens and stopwords.
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((token) => token.length >= 3 && !stopwords.has(token))
}

/**
 * Counts word frequencies from an array of tokens.
 * Returns an array of [word, count] tuples sorted by count (descending).
 */
export function getWordFrequencies(
  tokens: string[],
  limit: number = 15
): Array<{ word: string; count: number }> {
  const frequencies = new Map<string, number>()

  for (const token of tokens) {
    frequencies.set(token, (frequencies.get(token) || 0) + 1)
  }

  return Array.from(frequencies.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}


