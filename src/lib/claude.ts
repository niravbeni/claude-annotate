import Anthropic from '@anthropic-ai/sdk';
import { Annotation } from '@/types';
import { getWriterProfilePrompt } from './writerProfile';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-5-20250929';

const SYSTEM_PROMPT = `Analyze the text and return annotations in JSON format. Types:
1. "heart" - Validates writing that matches the writer's specific style profile (see below). ONLY use hearts for sentences that demonstrate the writer's strengths. (NO browserReference)
2. "squiggle-correction" - Factual errors like incorrect quotes, citations, facts (ALWAYS include browserReference)
3. "squiggle-suggestion" - Creative alternatives/uncertain ideas (include browserReference if helpful)
4. "circle" - Logic/timeline/math inconsistencies (include browserReference with correct fact)

WHEN TO USE EACH:
- Use HEART for: Writing that demonstrates the writer's specific voice and strengths (see profile below)
- Use SQUIGGLE-CORRECTION for: unverified quotes, citations, factual claims that might be wrong
- Use CIRCLE for: internal contradictions, timeline errors, math errors within the text itself

{"annotations":[{"type":"heart|squiggle-correction|squiggle-suggestion|circle","startIndex":0,"endIndex":10,"annotatedText":"text","comment":"**bold** for certainty","certainty":"certain|uncertain","browserReference":{"sourceTitle":"","sourceUrl":"","quoteBefore":"","quoteHighlighted":"","quoteAfter":"","claudeNote":""}}]}

CRITICAL RULES FOR BOUNDARIES (READ CAREFULLY):

1. FOR HEARTS & SQUIGGLES - COMPLETE SENTENCES:
   - startIndex = START of first word
   - endIndex = AFTER final punctuation (., !, ?)
   - Include the ENTIRE sentence from start to period
   - Example: "Fear lived in her chest then, a hard knot just below her ribs that made breathing deliberate work."

2. FOR CIRCLES - EXTREMELY PRECISE & MINIMAL:
   - Only circle the EXACT problematic NUMBER, DATE, or FACT
   - For timeline errors: Circle ONLY the year/date that creates the contradiction (e.g., "1954", "1992")
   - For math errors: Circle ONLY the incorrect number
   - Do NOT circle time phrases like "last month" - circle the specific date/year
   - ABSOLUTE MAXIMUM: 5 words, but prefer 1-2 words
   - Example: Circle "1954" NOT "By 1954, she'd found work"
   - Example: Circle "1992" NOT "arrived in London in 1992"
   - Example: Circle "1972" if it conflicts with "1954" later

3. NEVER CROSS PARAGRAPHS:
   - Each paragraph = separate unit
   - Stop at paragraph breaks (newlines)
   - If text spans multiple paragraphs, create SEPARATE annotations for each paragraph

4. EXAMPLES:
   ✓ GOOD Heart: "She was seventeen, barely spoke English, and knew no one." (complete sentence)
   ✓ GOOD Squiggle: "Fear isn't something you think about. It's something that thinks you." (the quote itself)
   ✓ GOOD Circle: "1954" or "1992" (just the date/number causing the error)
   ✗ BAD Heart: "She was seventeen, barely spoke English" (missing end)
   ✗ BAD Circle: "By 1954, she'd found work at a textile factory in Hackney" (too much - just need "1954")

HEART VALIDATION EXAMPLES (Writer's Style):
✓ VALIDATE: "Fear lived in her chest then, a hard knot just below her ribs that made breathing deliberate work."
   Comment: **Embodied, sensory-rich description grounds emotion in physical experience**
✓ VALIDATE: "The boarding house smelled of cabbage and mildew, sounds that felt like stones in her mouth."
   Comment: **Specific sensory details create unexpected metaphor**
✗ DON'T VALIDATE: "She was very afraid and didn't know what to do."
   Why: Abstract, cliché, lacks sensory grounding
✗ DON'T VALIDATE: "It was a difficult time for her."
   Why: Generic, vague, no specific imagery

NOTE: Heart comments should be SHORT (10-15 words max), stating ONE clear strength.

Other Rules:
- Use **bold** for certain comments (heart, circle)
- Use "≈ " prefix for uncertain comments (squiggles)
- Include browserReference for squiggle-correction, squiggle-suggestion, and circle types
- NEVER include browserReference for heart type
- Keep comments brief and specific
- HEART COMMENTS: Keep validation comments SHORT (max 1 sentence, ~10-15 words). Focus on ONE key strength, not multiple reasons.

Text:`;

export async function analyzeText(text: string): Promise<Annotation[]> {
  try {
    // Build the full prompt with writer profile
    const fullPrompt = `${SYSTEM_PROMPT}

${getWriterProfilePrompt()}

Text:`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1500, // Further reduced for speed
      temperature: 0.7, // Lower temperature for more focused output
      messages: [
        {
          role: 'user',
          content: `${fullPrompt}\n\n${text}`,
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

