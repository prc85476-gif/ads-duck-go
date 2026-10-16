require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-webapp-url.com';

if (!BOT_TOKEN) {
  console.log("No BOT_TOKEN provided in .env, Telegram bot disabled. You can add BOT_TOKEN in .env anytime.");
  process.exit(0);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  const name = ctx.from.first_name || 'User';
  ctx.reply(
    `👋 Welcome ${name} to *AdEarn Mini App*!\n\n` +
    `💰 Watch Ads, Play Games & Earn Daily Income!\n` +
    `🚀 Fast withdrawals via USDT (TRC20), Binance Pay, and PayPal.`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Open AdEarn App', WEBAPP_URL)],
        [Markup.button.url('📢 Join Community Channel', 'https://t.me/telegram')],
        [Markup.button.callback('ℹ️ How It Works', 'how_it_works')]
      ])
    }
  );
});

bot.action('how_it_works', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    `📖 *How to Earn with AdEarn*:\n\n` +
    `1️⃣ *Daily Reward*: Claim $0.01 free every 24 hours.\n` +
    `2️⃣ *Watch Ads*: Complete up to 10 ad tasks daily for rewards.\n` +
    `3️⃣ *Play Games*: Lucky Spin and Number Challenge.\n` +
    `4️⃣ *Withdraw*: Request payout once you hit minimum balance!`,
    { parse_mode: 'Markdown' }
  );
});

bot.launch().then(() => {
  console.log('Telegram Bot started successfully!');
}).catch(err => {
  console.error('Error starting Telegram bot:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
