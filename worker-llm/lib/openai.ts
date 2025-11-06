/**
 * OpenAI API wrapper for generating user insights
 */

import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface InsightPayload {
  themes: string[];
  assumptions: string[];
  mood: string;
  biases: string[];
  summary: string;
}

/**
 * Generate insights using OpenAI's structured output
 */
export async function generateInsights(
  systemPrompt: string,
  userPrompt: string
): Promise<InsightPayload> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const parsed = JSON.parse(content) as InsightPayload;
    
    // Validate structure
    if (!parsed.themes || !parsed.assumptions || !parsed.mood || !parsed.biases || !parsed.summary) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return parsed;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}


