/**
 * Text processing utilities for analytics worker
 */

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just',
  'me', 'might', 'more', 'most', 'must', 'my', 'myself',
  'no', 'nor', 'not', 'now',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  's', 'same', 'she', 'should', 'so', 'some', 'such',
  't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up',
  'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with',
  'would',
  'you', 'your', 'yours', 'yourself', 'yourselves'
]);

export interface WordCount {
  word: string;
  count: number;
}

/**
 * Tokenizes text into words: lowercase, letters only, remove stopwords
 */
export function tokenize(text: string): string[] {
  // Convert to lowercase and extract letter sequences
  const words = text
    .toLowerCase()
    .match(/[a-z]+/g) || [];
  
  // Filter out stopwords and very short words
  return words.filter(word => word.length > 2 && !STOPWORDS.has(word));
}

/**
 * Count word frequency and return top N words
 */
export function getTopWords(texts: string[], topN: number = 20): WordCount[] {
  const frequency = new Map<string, number>();
  
  // Tokenize all texts and count
  for (const text of texts) {
    const tokens = tokenize(text);
    for (const word of tokens) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }
  }
  
  // Sort by count descending and take top N
  return Array.from(frequency.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}


