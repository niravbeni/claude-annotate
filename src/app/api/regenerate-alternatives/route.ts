import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-5-20250929';

export async function POST(request: NextRequest) {
  try {
    const { annotatedText, currentAlternatives, currentAlternativeStyles, currentIndex } = await request.json();

    if (!annotatedText) {
      return NextResponse.json(
        { error: 'Missing annotatedText' },
        { status: 400 }
      );
    }

    const originalLength = annotatedText.length;
    const wordCount = annotatedText.split(/\s+/).length;
    
    const prompt = `Generate 1 NEW alternative phrasing for this text. The alternative should be different from the ones provided.

CRITICAL JSON FORMATTING RULES:
- ALL string values MUST properly escape quotes: use \\" for double quotes within strings
- ALL string values MUST escape backslashes: use \\\\ for literal backslashes
- NEVER include unescaped quotes in strings
- Ensure all JSON is properly formatted and parseable

Original text: "${annotatedText}"
Original length: ${originalLength} characters, approximately ${wordCount} words

Current alternatives (DO NOT repeat these):
${currentAlternatives ? currentAlternatives.map((alt: string, i: number) => `${i + 1}. "${alt}"`).join('\n') : 'None'}

Current styles already used (DO NOT use these styles):
${currentAlternativeStyles ? currentAlternativeStyles.filter((_: any, i: number) => i !== currentIndex).join(', ') : 'None'}

Generate 1 completely DIFFERENT alternative that:
- Maintains the core meaning
- Offers a distinct stylistic approach (e.g., through a famous writer's lens)
- Is more engaging or powerful than the original
- Has a recognizable literary style that is DIFFERENT from the styles already used (listed above)
- Use a fresh literary style that hasn't been used yet (e.g., Orwellian, Kafkaesque, Hemingway-esque, Dostoevskian, Woolfian, Carver-esque, Dickensian, Joycean, Faulknerian, etc.)
- CRITICAL LENGTH REQUIREMENT: Your alternative can be slightly longer but MUST NOT exceed 1.5x the original length
- Original: ${originalLength} characters (~${wordCount} words) → Maximum allowed: ${Math.round(originalLength * 1.5)} characters (~${Math.round(wordCount * 1.5)} words)
- It's okay to add some detail, but do NOT double the length or make it significantly longer

Return ONLY a JSON object with this format (no markdown, no code blocks):
{
  "alternative": "the new alternative text",
  "alternativeStyle": "Style Name"
}

REMEMBER: Escape all quotes within strings with \\" to ensure valid JSON!`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      temperature: 0.9, // Higher temperature for more creative alternatives
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to parse JSON
    let parsed;
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        const jsonStart = responseText.indexOf('{');
        if (jsonStart !== -1) {
          parsed = JSON.parse(responseText.slice(jsonStart));
        } else {
          throw new Error('No JSON found in response');
        }
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response from Claude:', responseText);
      throw new Error('Failed to parse Claude response as JSON');
    }

    // Validate response
    if (!parsed.alternative || !parsed.alternativeStyle) {
      throw new Error('Claude did not return a valid alternative');
    }

    return NextResponse.json({
      alternative: parsed.alternative,
      alternativeStyle: parsed.alternativeStyle,
    });
  } catch (error: any) {
    console.error('Regenerate alternatives error:', error);

    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to regenerate alternatives' },
      { status: 500 }
    );
  }
}

