import Anthropic from '@anthropic-ai/sdk';
import { Annotation } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-5-20250929';

const SYSTEM_PROMPT = `Analyze the text and return annotations in JSON format. Types:
1. "heart" - Strong writing with authentic voice
2. "squiggle-correction" - Factual errors (include browserReference if found)
3. "squiggle-suggestion" - Creative alternatives
4. "circle" - Logic/timeline inconsistencies

{"annotations":[{"type":"heart|squiggle-correction|squiggle-suggestion|circle","startIndex":0,"endIndex":10,"annotatedText":"text","comment":"**bold** for certainty","certainty":"certain|uncertain","browserReference":{"sourceTitle":"","sourceUrl":"","quoteBefore":"","quoteHighlighted":"","quoteAfter":"","claudeNote":""}}]}

Rules: Use **bold** for certainty. Add "≈ " for uncertain. Include browserReference only for squiggle-correction. Keep comments brief.

Text:`;

export async function analyzeText(text: string): Promise<Annotation[]> {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1500, // Further reduced for speed
      temperature: 0.7, // Lower temperature for more focused output
      messages: [
        {
          role: 'user',
          content: `${SYSTEM_PROMPT}\n\n${text}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to parse JSON with or without code blocks
    let parsed;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1]);
    } else {
      // Try direct parse if no code blocks
      const jsonStart = responseText.indexOf('{');
      if (jsonStart !== -1) {
        parsed = JSON.parse(responseText.slice(jsonStart));
      } else {
        throw new Error('No JSON found in response');
      }
    }
    
    // Add client-side IDs and timestamps
    const annotations: Annotation[] = parsed.annotations.map((ann: any, index: number) => ({
      ...ann,
      id: `annotation-${Date.now()}-${index}`,
      timestamp: new Date(),
    }));

    return annotations;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
}

