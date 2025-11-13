import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ChatContext } from '@/types/chat';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = 'claude-sonnet-4-5-20250929';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { annotationId, message, context } = body as {
      annotationId: string;
      message: string;
      context: ChatContext;
    };

    // Validation
    if (!annotationId || !message || !context) {
      return NextResponse.json(
        { error: 'Missing required fields: annotationId, message, context' },
        { status: 400 }
      );
    }

    // Build conversation history for Claude
    const conversationHistory = context.previousMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Build context prompt
    const contextPrompt = `You are Claude, an AI assistant helping a writer discuss their work. You're currently discussing a specific annotation on their writing.

ANNOTATION CONTEXT:
- Type: ${context.annotation.type} (${getTypeDescription(context.annotation.type)})
- Annotated text: "${context.annotation.annotatedText}"
- Comment: ${context.annotation.comment}

FULL TEXT CONTEXT:
"${context.fullText.substring(0, 2000)}${context.fullText.length > 2000 ? '...' : ''}"

${context.edits.length > 0 ? `RECENT EDITS:\nThe writer has made ${context.edits.length} edit(s) to the text.` : ''}

INSTRUCTIONS:
- Answer the writer's questions about this specific annotation
- Be EXTREMELY concise - aim for 1-2 sentences, 3 max
- Keep responses short, direct, and conversational
- No lengthy explanations or multiple paragraphs
- Get straight to the point

Writer's question: ${message}`;

    // Call Claude API
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        ...conversationHistory,
        {
          role: 'user',
          content: contextPrompt,
        },
      ],
    });

    const assistantMessage = response.content[0]?.type === 'text' 
      ? response.content[0].text 
      : 'Sorry, I could not generate a response.';

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function getTypeDescription(type: string): string {
  switch (type) {
    case 'heart':
      return 'Authenticity - writing that matches your style';
    case 'squiggle-correction':
      return 'Uncertainty - factual claim that needs verification';
    case 'squiggle-suggestion':
      return 'Uncertainty - creative alternative or suggestion';
    case 'circle':
      return 'Discrepancy - internal logic or timeline error';
    default:
      return type;
  }
}

