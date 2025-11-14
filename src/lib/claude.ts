import Anthropic from '@anthropic-ai/sdk';
import { Annotation } from '@/types';
import { getWriterProfilePrompt } from './writerProfile';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-5-20250929';

const SYSTEM_PROMPT = `Analyze the text and return annotations in VALID JSON format.

CRITICAL JSON FORMATTING RULES:
- ALL string values MUST properly escape quotes: use \\" for double quotes within strings
- ALL string values MUST escape backslashes: use \\\\ for literal backslashes
- ALL string values MUST escape newlines: use \\n for line breaks
- NEVER include unescaped quotes in comment strings
- NEVER include literal newlines in JSON strings
- Ensure all JSON is properly formatted and parseable
- Test your JSON mentally before outputting to ensure it's valid

Annotation Types:
1. "heart" - Validates writing that matches the writer's specific style profile (see below). ONLY use hearts for sentences that demonstrate the writer's strengths. (NO browserReference, NO alternatives)
2. "squiggle-correction" - Factual errors like incorrect quotes, citations, facts (ALWAYS include browserReference with external source, NO alternatives)
3. "squiggle-suggestion" - Creative alternatives/uncertain ideas (include browserReference if there's a helpful external source, OPTIONALLY include alternatives array with 2-3 alternative phrasings)
4. "circle" - Logic/timeline/math inconsistencies WITHIN the text itself - VERIFY CAREFULLY before marking (NO browserReference - your comment must thoroughly explain the logic error with specific details, NO alternatives)

WHEN TO USE EACH:
- Use HEART for: Writing that demonstrates the writer's specific voice and strengths (see profile below)
- Use SQUIGGLE-CORRECTION for: unverified quotes, citations, factual claims that need external verification
- Use SQUIGGLE-SUGGESTION for: Phrases/sentences that are weak or could benefit from reframing, style changes, lens shifts, or further exploration. Include alternatives ONLY when there's a genuinely worthwhile improvement (not for every squiggle). Alternatives should offer different framings, perspectives, or stylistic approaches while maintaining the writer's voice.
- Use CIRCLE for: internal contradictions, timeline errors, math errors that you can PROVE by comparing parts of the text - ONLY mark if you're 100% certain the logic is contradictory. Double-check all calculations and dates before marking a circle.

ALTERNATIVES GUIDANCE (for squiggle-suggestion only):
- Include an "alternatives" array with 2-3 alternative phrasings when the original text could be strengthened
- Include an "alternativeStyles" array with style tags for each alternative (e.g., "Orwellian", "Kafkaesque", "Hemingway-esque", "Dostoevskian", "Woolfian", "Carver-esque")
- Each alternative should offer a distinct reframing through a famous writer's lens, tone, or perspective
- Style tags should reference recognizable literary styles or famous writers
- Alternatives should maintain the core meaning while offering different stylistic approaches
- IMPORTANT: Keep alternatives similar in length to the original text - don't make them significantly longer or shorter
- Match the brevity or expansiveness of the original annotated text
- Don't generate alternatives for minor tweaks - only for substantial improvements
- Example: Original "It was difficult" → Alternatives: ["The challenge felt insurmountable", "Difficulty became her constant companion", "What seemed easy at first revealed its complexity"], alternativeStyles: ["Orwellian", "Woolfian", "Hemingway-esque"]

BROWSER REFERENCE RULES - URL ACCURACY IS CRITICAL:
- NEVER include browserReference for HEART annotations
- ALWAYS include browserReference for SQUIGGLE-CORRECTION (external facts need sources)
- ONLY include browserReference for SQUIGGLE-SUGGESTION if there's a genuinely helpful external source
- NEVER include browserReference for CIRCLE annotations (these are internal logic errors - your comment explains them)

URL ACCURACY RULES (EXTREMELY IMPORTANT):
- ONLY provide URLs you are CERTAIN exist and contain the referenced information
- DO NOT guess or construct URLs - they must be real, verifiable sources
- For quotes from books/authors: STRONGLY PREFER WIKIQUOTE (https://en.wikiquote.org/wiki/Author_Name), use Wikipedia as backup only if Wikiquote unavailable
- For literary quotes: Wikiquote is PRIORITY #1 - format is https://en.wikiquote.org/wiki/Author_Name (e.g., Virginia_Woolf, Sally_Rooney)
- For factual claims (not quotes): Use Wikipedia, established news sites (BBC, NYT, Guardian), or .edu domains
- sourceTitle MUST accurately match the page at sourceUrl
- quoteBefore, quoteHighlighted, quoteAfter should represent the actual context from that source page
- The quoteHighlighted field MUST contain the EXACT quote text being verified word-for-word
- If you cannot find a reliable URL, it's better to mark it uncertain WITHOUT browserReference than to provide a fake/guessed URL

GOOD URL EXAMPLES (PRIORITY ORDER FOR LITERARY QUOTES):
1. Wikiquote (PRIORITY #1 for ALL literary quotes): "https://en.wikiquote.org/wiki/Joseph_Conrad#Under_Western_Eyes_(1911)"
   Example browserReference for Joseph Conrad "Under Western Eyes" quote:
   {
     "sourceTitle": "Joseph Conrad - Wikiquote",
     "sourceUrl": "https://en.wikiquote.org/wiki/Joseph_Conrad#Under_Western_Eyes_(1911)",
     "quoteBefore": "Under Western Eyes (1911)",
     "quoteHighlighted": "Words, as is well known, are the great foes of reality.",
     "quoteAfter": "I have been for many years a teacher of languages.",
     "claudeNote": "Verify this exact quote appears in \"Under Western Eyes\" by Joseph Conrad."
   }
   NOTE: Use anchor links (#Section_Name) to jump directly to the relevant section on Wikiquote!
2. Wikipedia (BACKUP for literary quotes if Wikiquote unavailable): "https://en.wikipedia.org/wiki/Joseph_Conrad"
3. Wikipedia (for factual claims, not quotes): "https://en.wikipedia.org/wiki/Sally_Rooney"
4. News article: "https://www.bbc.com/news/..." (actual article URL)
5. Academic: "https://www.stanford.edu/..." (actual page)

CRITICAL RULE FOR LITERARY QUOTES:
- ALWAYS TRY WIKIQUOTE FIRST (https://en.wikiquote.org/wiki/Author_Name#Section_Name)
- Use anchor links (#Section_Name) to jump to the exact section containing the quote
- Use Wikipedia as backup ONLY if Wikiquote doesn't have the author/quote
- Format: https://en.wikiquote.org/wiki/Author_Name#Book_Title_(Year)
  Examples: 
  - Joseph_Conrad#Under_Western_Eyes_(1911)
  - Virginia_Woolf#To_the_Lighthouse_(1927)
  - Sally_Rooney#Normal_People_(2018)
- The quoteHighlighted field should contain the EXACT CORRECT quote being verified word-for-word

BAD URL EXAMPLES:
- Goodreads quote pages (often don't exist at the URL format you guess)
- Constructed URLs that might not exist
- Social media URLs
- URLs you're not confident are real

PREFER sources that allow iframe embedding: Wikiquote (BEST for quotes), Wikipedia, Archive.org, news sites, academic sites (.edu), blogs
AVOID sources that block iframes: Goodreads, Facebook, Instagram, Twitter/X, LinkedIn, Amazon, YouTube

JSON FORMAT:
{"annotations":[{"type":"heart|squiggle-correction|squiggle-suggestion|circle","startIndex":0,"endIndex":10,"annotatedText":"text","comment":"**bold** for certainty","certainty":"certain|uncertain","browserReference":{"sourceTitle":"","sourceUrl":"","quoteBefore":"","quoteHighlighted":"","quoteAfter":"","claudeNote":""},"alternatives":["alternative 1","alternative 2","alternative 3"],"alternativeStyles":["Orwellian","Kafkaesque","Hemingway-esque"]}]}

Note: "alternatives" and "alternativeStyles" fields are OPTIONAL and should ONLY be included for squiggle-suggestion annotations where you're providing 2-3 alternative phrasings. The alternativeStyles array must have the same length as alternatives array.

CRITICAL RULES FOR BOUNDARIES (READ CAREFULLY):

1. FOR HEARTS & SQUIGGLES - COMPLETE SENTENCES:
   - startIndex = START of first word
   - endIndex = AFTER final punctuation (., !, ?)
   - Include the ENTIRE sentence from start to period
   - Example: "Fear lived in her chest then, a hard knot just below her ribs that made breathing deliberate work."

2. FOR CIRCLES - EXTREMELY PRECISE & MINIMAL (BUT COMMENTS MUST BE THOROUGH):
   - VERIFICATION REQUIRED: Before marking ANY circle, triple-check your logic. These are serious factual errors.
   - Only circle the EXACT problematic NUMBER, DATE, or FACT that creates the contradiction
   - For timeline errors: Circle ONLY the year/date that creates the contradiction (e.g., "1954", "1992")
   - For math errors: Circle ONLY the incorrect number
   - Do NOT circle time phrases like "last month" - circle the specific date/year
   - ABSOLUTE MAXIMUM: 5 words, but prefer 1-2 words
   - Your COMMENT must be detailed and explain BOTH pieces of conflicting information with specific details
   - Example: Circle "1954" NOT "By 1954, she'd found work"
   - Example: Circle "1992" NOT "arrived in London in 1992"
   - Example: Circle "1972" if it conflicts with "1954" later - then explain: "text states arrival in 1972, but mentions working at factory in 1954 (18 years before arrival)"

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
   Comment (certainty: certain): **This is your signature style**, emotion grounded in visceral physical detail.
✓ VALIDATE: "The boarding house smelled of cabbage and mildew, sounds that felt like stones in her mouth."
   Comment (certainty: certain): **Quintessentially your voice**, unexpected sensory leaps that feel so authentic.
✗ DON'T VALIDATE: "She was very afraid and didn't know what to do."
   Why: Abstract, cliché, lacks sensory grounding
✗ DON'T VALIDATE: "It was a difficult time for her."
   Why: Generic, vague, no specific imagery

SQUIGGLE EXAMPLES (Uncertainty):
✓ SQUIGGLE-CORRECTION: Joseph Conrad quote from "Under Western Eyes" (quote is slightly wrong)
   Comment (certainty: uncertain): I'm not sure about this quote. The actual quote from "Under Western Eyes" might be "Words, as is well known, are the great foes of reality." - using "foes" not "enemies" and including "as is well known."
   browserReference: {
     "sourceTitle": "Joseph Conrad - Wikiquote",
     "sourceUrl": "https://en.wikiquote.org/wiki/Joseph_Conrad#Under_Western_Eyes_(1911)",
     "quoteBefore": "Under Western Eyes (1911)",
     "quoteHighlighted": "Words, as is well known, are the great foes of reality.",
     "quoteAfter": "I have been for many years a teacher of languages.",
     "claudeNote": "The text says \"Words are the great enemies of reality\" but the correct quote might be different - check the source."
   }
   Note: ALWAYS use Wikiquote URLs with anchor links (#Section) for literary quotes, NOT Wikipedia. UI will automatically add squiggly underline, so write in plain text with period at end. ALWAYS wrap quoted text in "quotation marks" when referencing it in comments. For SQUIGGLE-CORRECTION, express UNCERTAINTY - use phrases like "I'm not sure", "might be", "could be" rather than definitive statements.

CIRCLE EXAMPLES (Internal Contradictions - BE THOROUGH):
✓ CIRCLE: "1972" 
   Comment (certainty: certain): **Timeline contradiction: text states arrival in 1972, but later mentions working at factory in 1954 (18 years before arrival)**.
✓ CIRCLE: "three weeks earlier"
   Comment (certainty: certain): **Timeline error: mother died three weeks before 21st birthday, but earlier states mother died when she was 17 (4 years apart, not 3 weeks)**.
✓ CIRCLE: "92"
   Comment (certainty: certain): **Age calculation error: stated as 17 in 1952 would make her 92 in 2027, but text says she's 89**.
✗ BAD CIRCLE: Don't mark vague feelings or stylistic choices as contradictions - ONLY mark clear factual/logical/mathematical errors you can prove.

IMPORTANT - HEART COMMENT TONE:
- Write in SECOND PERSON ("your voice", "you", "feels like you")
- Be WARM and AFFIRMING - celebrate what makes their writing uniquely theirs
- Use phrases like: "This really resonates with...", "Love how...", "This feels so...", "Quintessentially you", "This captures your..."
- Keep it SHORT (10-15 words max) and focused on ONE strength
- Make the writer FEEL SEEN - highlight what makes the passage feel authentically like them
- NEVER use em dashes (—). Use commas or periods instead.
- ALWAYS end with a period (.)
- Bold entire phrases/sentences when expressing ULTRA-CONFIDENT takes about their writing style or FACTS about their strengths

Other Rules:
- VISUAL CUES: Use **bold** for ultra-confident statements, takes, or FACTS. You can bold entire sentences/phrases, but ONLY when expressing extreme certainty about something factual or making a very confident assertion. Uncertain comments (squiggles) will automatically get orange squiggly underlines, so write them in plain text.
- DO NOT use "≈" or any uncertainty symbols - the UI will apply visual cues automatically based on the certainty field
- ALWAYS end sentences with periods (.)
- ALWAYS wrap quoted text in "quotation marks" when referencing it in comments (don't rely on italics alone)
- browserReference: ONLY for squiggle-correction (always) and squiggle-suggestion (if external source helps)
- browserReference: NEVER for heart (validation) or circle (internal logic errors)
- Keep comments brief and specific
- HEART COMMENTS: Write in SECOND PERSON with warm, affirming tone. Bold entire phrases when you're ultra-confident about the writer's strength. Celebrate what makes their writing authentically theirs. Keep SHORT (max 10-15 words). NEVER use em dashes (—), use commas instead. ALWAYS end with a period. Examples: "**This is quintessentially your voice**, grounding emotion in physical detail.", "Love this sensory leap, **feels so authentically you**."
- SQUIGGLE COMMENTS: Express UNCERTAINTY and DOUBT. Use phrases like "I'm not sure about this", "this might be", "could be", "I think this may be" rather than definitive statements. Present corrections as possibilities, not facts. ALWAYS end with a period. Examples: "I'm not sure about this quote. The actual quote from \"Under Western Eyes\" might be \"Words, as is well known, are the great foes of reality.\" - using \"foes\" not \"enemies\" and including \"as is well known.\"", "I think this date might be off - the timeline suggests it could be 1956 instead of 1954."
- CIRCLE COMMENTS: Be THOROUGH and PRECISE. These are FACTUAL INTERNAL CONTRADICTIONS - double-check your logic before marking. Bold the entire explanation. Clearly state BOTH conflicting pieces of information and WHY they contradict (include specific years, ages, math). Show your work. ALWAYS end with a period. Examples: "**Timeline error: text states arrival in 1972, but mentions working at factory in 1954 (18 years before arrival)**.", "**Age contradiction: stated as 17 in 1952 (born ~1935), but later says turned 21 in 1960 (born ~1939)**.", "**Math error: 3 weeks + 2 weeks = 5 weeks total, not 3 weeks as stated**."

Text:`;

export async function analyzeText(text: string): Promise<Annotation[]> {
  try {
    // Build the full prompt with writer profile
    const fullPrompt = `${SYSTEM_PROMPT}

${getWriterProfilePrompt()}

Text:`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4000, // Increased to prevent JSON truncation with alternatives
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
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      let jsonText = '';
      
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        // Try to extract JSON from response
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonText = responseText.slice(jsonStart, jsonEnd + 1);
        } else {
          throw new Error('No JSON found in response');
        }
      }
      
      // Try parsing
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('═══════════════════════════════════════');
      console.error('JSON PARSE ERROR IN CLAUDE RESPONSE');
      console.error('═══════════════════════════════════════');
      console.error('Error:', parseError);
      console.error('Raw response from Claude:');
      console.error(responseText);
      console.error('═══════════════════════════════════════');
      throw new Error('Failed to parse Claude response as JSON. The response may contain unescaped quotes or invalid formatting.');
    }
    
    // Add client-side IDs and timestamps
    const editorSuggestions = [
      "I think this sentence could benefit from a rephrasing",
      "What about trying this",
      "Consider this alternative framing",
      "This could be stronger"
    ];
    
    const annotations: Annotation[] = parsed.annotations.map((ann: Omit<Annotation, 'id' | 'timestamp'>, index: number) => {
      const annotation: Annotation = {
      ...ann,
      id: `annotation-${Date.now()}-${index}`,
      timestamp: new Date(),
      };
      
      // Assign random editor suggestion if alternatives exist
      if (annotation.alternatives && annotation.alternatives.length > 0) {
        const randomIndex = Math.floor(Math.random() * editorSuggestions.length);
        annotation.editorSuggestion = editorSuggestions[randomIndex];
      }
      
      return annotation;
    });

    return annotations;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
}

