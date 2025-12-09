
import { NextRequest, NextResponse } from 'next/server';
import { bot } from '@/lib/bot';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const host = searchParams.get('host') || req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    
    // Construct the webhook URL
    // Ensure it's an absolute URL
    const baseUrl = `${protocol}://${host}`;
    const webhookUrl = `${baseUrl}/api/telegram-webhook`;

    console.log(`Setting webhook to: ${webhookUrl}`);

    // Set the webhook
    const result = await bot.telegram.setWebhook(webhookUrl);

    if (result) {
        return NextResponse.json({ 
            ok: true, 
            message: `Webhook set successfully to ${webhookUrl}`,
            webhookUrl 
        });
    } else {
        return NextResponse.json({ 
            ok: false, 
            message: 'Failed to set webhook' 
        }, { status: 500 });
    }
  } catch (error) {
    console.error('Error setting webhook:', error);
    return NextResponse.json({ 
        ok: false, 
        error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
