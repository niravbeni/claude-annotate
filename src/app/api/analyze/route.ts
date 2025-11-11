import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/lib/claude';
import { ERROR_MESSAGES, LIMITS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    // Validation
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.TEXT_EMPTY },
        { status: 400 }
      );
    }

    if (text.length > LIMITS.maxCharacters) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.TEXT_TOO_LONG },
        { status: 400 }
      );
    }

    // Call Claude
    const annotations = await analyzeText(text);

    return NextResponse.json({ annotations });
  } catch (error: any) {
    console.error('Analysis error:', error);

    // Handle specific errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.API_KEY_MISSING },
        { status: 500 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.RATE_LIMIT },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || ERROR_MESSAGES.UNKNOWN },
      { status: 500 }
    );
  }
}

