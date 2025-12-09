
import { bot } from '../lib/bot';

// This script is used for local development with polling.
// For production (Vercel), we use Webhooks.

console.log('Starting Bot in Polling Mode (Local Dev)...');

// Start Bot
bot.launch().then(() => {
  console.log('Bot is running...');
}).catch((err) => {
  console.error('Failed to launch bot:', err);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
