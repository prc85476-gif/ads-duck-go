require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { getOrCreateUser } = require('./db-service');

const BOT_TOKEN = process.env.BOT_TOKEN || '8973252938:AAEBNrqQV7On6RHFO7hsaq-YpTlY9KYj3Ns';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://4bc94ql5kitgmhlmlzaobucb.72.62.252.28.sslip.io';

if (!BOT_TOKEN) {
  console.log("No BOT_TOKEN provided in .env");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Sleep helper
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

bot.start(async (ctx) => {
  const userId = ctx.from.id.toString();
  const firstName = ctx.from.first_name || 'Member';
  const username = ctx.from.username || '';
  
  // Parse referral start param: e.g. /start 123456789
  const payload = ctx.startPayload || '';
  const referredBy = (payload && payload !== userId) ? payload : null;

  try {
    // Save/Update user in Neon DB & credit referral if valid
    await getOrCreateUser(userId, {
      name: `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim() || firstName,
      username: username,
      referred_by: referredBy
    });
  } catch (err) {
    console.error("DB error on /start:", err);
  }

  // Animation simulation with Telegram typing & step-by-step interactive message
  await ctx.sendChatAction('typing');
  await sleep(600);

  const welcomeMessage = 
`🛩️ *Welcome to Duck Aviator 1945!* 🦆🎮

👋 Greetings, Cadet *${firstName}*!
Ready to take command of your fighter aircraft, dogfight hostile squadrons, and ascend the Worldwide Ace Leaderboard?

✨ *Flight Features*:
✈️ *Air Combat Sorties* (3D arcade combat, defeat boss armadas & claim loot!)
🎯 *Tactical Flight Operations* (Complete radar reconnaissance & combat briefings!)
📦 *Daily Supply Drops* (Claim +50 Duck Coins every 24 hours!)
👥 *Recruit Wingmen* (+100 Duck Coins for each squadron recruit!)

🏆 *Worldwide Hall of Fame* - Compete with ace pilots across the globe!

👇 *Tap below to launch your fighter jet!*`;

  await ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Launch Fighter Jet (Play)', WEBAPP_URL)],
      [Markup.button.webApp('🎯 Flight Operations Briefings', WEBAPP_URL)],
      [
        Markup.button.url('📢 Official Channel', 'https://t.me/adsduckgobot'),
        Markup.button.callback('👥 Recruit Wingmen', 'get_ref_link')
      ],
      [Markup.button.callback('ℹ️ Flight Manual', 'how_it_works')]
    ])
  });
});

bot.command(['play', 'game', 'flight'], async (ctx) => {
  await ctx.reply(
    `🛩️ *Duck Aviator 1945 - Combat Hangar* 🦆\n\n🎯 Launch air combat sorties, defeat enemy squadrons & collect Duck Coins!\n\nTap below to enter the cockpit:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Launch Sortie', WEBAPP_URL)]
      ])
    }
  );
});

bot.action('get_ref_link', async (ctx) => {
  await ctx.answerCbQuery();
  const userId = ctx.from.id.toString();
  const refLink = `https://t.me/adsduckgobot?start=${userId}`;

  await ctx.reply(
`🔗 *Your Referral Link*:
\`${refLink}\`

💰 Share this link with your friends! When they join and play, you will receive *100 Duck Coins* bonus added directly to your balance!`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('📲 Share to Telegram', `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent('Join AdsDuckGo and play Airplane Crash to earn Duck Coins!')}`)]
      ])
    }
  );
});

bot.action('how_it_works', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
`📖 *AdsDuckGo Game Guide*:

1️⃣ *Airplane Combat*: Dodge bullets, shoot bosses & collect Duck Coins!
2️⃣ *Sponsor Ads*: Watch short video clips to instantly claim +10 Duck Coins.
3️⃣ *Daily Bonus*: Claim 50 free Duck Coins once every 24 hours!
4️⃣ *Leaderboard*: Accumulate Duck Coins to rank #1 on the pilot leaderboard!`,
    { parse_mode: 'Markdown' }
  );
});

bot.launch().then(() => {
  console.log('🤖 @adsduckgobot started successfully with Neon DB!');
}).catch(err => {
  console.error('Error starting bot:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
