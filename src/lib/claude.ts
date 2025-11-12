import Anthropic from '@anthropic-ai/sdk';
import { Annotation } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-5-20250929';

const SYSTEM_PROMPT = `Analyze the text and return annotations in JSON format. Types:
1. "heart" - Strong writing with authentic voice (NO browserReference)
2. "squiggle-correction" - Factual errors that need checking (include browserReference)
3. "squiggle-suggestion" - Creative alternatives/uncertain ideas (include browserReference if helpful)
4. "circle" - Logic/timeline inconsistencies/clear errors (include browserReference with correct fact)

{"annotations":[{"type":"heart|squiggle-correction|squiggle-suggestion|circle","startIndex":0,"endIndex":10,"annotatedText":"text","comment":"**bold** for certainty","certainty":"certain|uncertain","browserReference":{"sourceTitle":"","sourceUrl":"","quoteBefore":"","quoteHighlighted":"","quoteAfter":"","claudeNote":""}}]}

CRITICAL RULES FOR BOUNDARIES (READ CAREFULLY):

1. COMPLETE SENTENCES ONLY:
   - startIndex = START of first word
   - endIndex = AFTER final punctuation (., !, ?)
   - Include the ENTIRE sentence from start to period
   - Example: "Fear lived in her chest then, a hard knot just below her ribs that made breathing deliberate work." (must include period!)

2. NEVER CROSS PARAGRAPHS:
   - Each paragraph = separate unit
   - Stop at paragraph breaks (newlines)
   - If text spans multiple paragraphs, create SEPARATE annotations for each paragraph
   - DO NOT let startIndex and endIndex span across paragraph boundaries

3. EXAMPLES:
   ✓ GOOD: "She was seventeen, barely spoke English, and knew no one." (complete with period)
   ✗ BAD: "She was seventeen, barely spoke English" (missing end)
   ✓ GOOD: One annotation per paragraph
   ✗ BAD: One annotation spanning two paragraphs

Other Rules:
- Use **bold** for certain comments (heart, circle)
- Use "≈ " prefix for uncertain comments (squiggles)
- Include browserReference for squiggle-correction, squiggle-suggestion, and circle types
- NEVER include browserReference for heart type
- Keep comments brief and specific

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

