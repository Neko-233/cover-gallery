
import { NextRequest, NextResponse } from 'next/server';
import { bot } from '@/lib/bot';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Process the update
    // Note: handleUpdate returns a promise, we should await it
    // Use type assertion if necessary as handleUpdate expects a specific Update type
    await bot.handleUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling telegram webhook:', error);
    // Return 200 even on error to prevent Telegram from retrying endlessly
    return NextResponse.json({ ok: true, error: 'Failed to process update' });
  }
}

export async function GET() {
    return NextResponse.json({ status: 'Telegram Webhook API is running' });
}
