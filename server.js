require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, initDB } = require('./db');
const { getOrCreateUser, getGlobalBotStats } = require('./db-service');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database tables on server start
initDB().catch(err => console.error("Database connection warning:", err.message));

// Health check endpoint for Docker & Traefik
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Global Bot & Platform Statistics (Saved in Neon DB)
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getGlobalBotStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Increment Impression counter
app.post('/api/impression', async (req, res) => {
  try {
    await pool.query('UPDATE bot_stats SET total_impressions = total_impressions + 1 WHERE id = 1');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get User (Default / Telegram User ID)
app.get('/api/user', async (req, res) => {
  try {
    const user = await getOrCreateUser("123456789");
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    const userId = req.params.id || "123456789";
    const user = await getOrCreateUser(userId);
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Daily reward claim ($0.01) - 1 time per 24 hours
app.post('/api/daily-claim', async (req, res) => {
  const { userId = "123456789" } = req.body;
  try {
    const user = await getOrCreateUser(userId);

    if (user.dailyClaimedToday) {
      const elapsed = Date.now() - new Date(user.lastDailyClaim).getTime();
      const remainingMs = Math.max(0, (24 * 60 * 60 * 1000) - elapsed);
      return res.status(400).json({ 
        success: false, 
        message: "Daily reward already claimed!", 
        remainingMs,
        nextClaimAt: new Date(new Date(user.lastDailyClaim).getTime() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    const reward = 0.01;
    const newBalance = +(user.balance + reward).toFixed(4);
    const newTotalEarned = +(user.totalEarned + reward).toFixed(2);
    const nowIso = new Date().toISOString();

    await pool.query(`
      UPDATE users SET
        balance = $1,
        total_earned = $2,
        daily_claimed_today = true,
        last_daily_claim = $3,
        updated_at = NOW()
      WHERE id = $4
    `, [newBalance, newTotalEarned, nowIso, userId]);

    await pool.query(`
      INSERT INTO activities (id, user_id, title, description, time_text, type, icon)
      VALUES ($1, $2, 'Daily Reward', $3, 'Just now', 'daily', 'gift')
    `, ['act_' + Date.now(), userId, `Claimed daily $${reward.toFixed(2)}`]);

    const updatedUser = await getOrCreateUser(userId);
    res.json({ success: true, message: "Daily reward claimed!", reward, newBalance, user: updatedUser });
  } catch (err) {
    console.error("Daily claim error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Airplane Game Play Record (Max 2 times per 24 hours)
app.post('/api/airplane-claim', async (req, res) => {
  const { userId = "123456789", earned = 0.03, usdt = 0, btc = 0 } = req.body;
  try {
    const user = await getOrCreateUser(userId);

    if (user.planePlaysToday >= 2) {
      const elapsed = Date.now() - user.planePlaysWindowStart;
      const remainingMs = Math.max(0, (24 * 60 * 60 * 1000) - elapsed);
      return res.status(400).json({
        success: false,
        message: "Daily limit reached! You can play Airplane Game 2 times every 24 hours.",
        remainingMs,
        planePlaysToday: user.planePlaysToday
      });
    }

    const earnedAmount = Number(earned) || 0.03;
    const newPlanePlaysToday = (user.planePlaysToday || 0) + 1;
    const newBalance = +(user.balance + earnedAmount).toFixed(4);
    const newTotalEarned = +(user.totalEarned + earnedAmount).toFixed(2);
    const newGamesPlayed = (user.gamesPlayed || 0) + 1;

    await pool.query(`
      UPDATE users SET
        plane_plays_today = $1,
        balance = $2,
        total_earned = $3,
        games_played = $4,
        updated_at = NOW()
      WHERE id = $5
    `, [newPlanePlaysToday, newBalance, newTotalEarned, newGamesPlayed, userId]);

    // Update global airplane plays counter
    await pool.query('UPDATE bot_stats SET total_airplane_plays = total_airplane_plays + 1 WHERE id = 1');

    await pool.query(`
      INSERT INTO activities (id, user_id, title, description, time_text, type, icon)
      VALUES ($1, $2, 'Airplane Game Reward', $3, 'Just now', 'game', 'game')
    `, [
      'act_' + Date.now(), 
      userId, 
      `Won $${earnedAmount.toFixed(4)} (${usdt} USDT, ${btc} BTC)`
    ]);

    const updatedUser = await getOrCreateUser(userId);
    res.json({
      success: true,
      message: `Earned $${earnedAmount.toFixed(4)}! (${newPlanePlaysToday}/2 plays today)`,
      user: updatedUser
    });
  } catch (err) {
    console.error("Airplane claim error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Watch Ad & Complete Task
app.post('/api/complete-task', async (req, res) => {
  const { userId = "123456789", taskId } = req.body;
  try {
    const user = await getOrCreateUser(userId);

    const task = user.tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.completed) {
      return res.status(400).json({ success: false, message: "Task already completed today!" });
    }

    task.completed = true;
    task.tag = "Completed";
    const newBalance = +(user.balance + task.reward).toFixed(4);
    const newTotalEarned = +(user.totalEarned + task.reward).toFixed(2);
    const newTasksCompleted = user.tasksCompleted + 1;
    const nowTimestamp = Date.now();

    const remainingIncomplete = user.tasks.filter(t => !t.completed);
    let allCompletedAt = user.allTasksCompletedAt;
    if (remainingIncomplete.length === 0) {
      allCompletedAt = nowTimestamp;
    }

    await pool.query(`
      UPDATE users SET
        balance = $1,
        total_earned = $2,
        tasks_completed = $3,
        tasks_json = $4,
        last_ad_watched_at = $5,
        all_tasks_completed_at = $6,
        updated_at = NOW()
      WHERE id = $7
    `, [
      newBalance,
      newTotalEarned,
      newTasksCompleted,
      JSON.stringify(user.tasks),
      nowTimestamp,
      allCompletedAt,
      userId
    ]);

    // Update global ads watched counter
    await pool.query('UPDATE bot_stats SET total_ads_watched = total_ads_watched + 1 WHERE id = 1');

    await pool.query(`
      INSERT INTO activities (id, user_id, title, description, time_text, type, icon)
      VALUES ($1, $2, $3, $4, 'Just now', 'task', 'dollar')
    `, [
      'act_' + Date.now(),
      userId,
      `${task.name} Ad Reward`,
      `You earned $${Number(task.reward).toString()}`
    ]);

    const updatedUser = await getOrCreateUser(userId);
    res.json({ success: true, message: `Watched ad from ${task.name}! Earned $${task.reward}`, user: updatedUser });
  } catch (err) {
    console.error("Complete task error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Adsgram Webhook Reward Endpoint (Called by Adsgram server on reward complete)
app.get('/api/adsgram/reward', async (req, res) => {
  const userId = req.query.userid || req.query.userId || "123456789";
  const rewardAmount = parseFloat(req.query.reward) || 0.005;

  try {
    const user = await getOrCreateUser(userId);
    const newBalance = +(user.balance + rewardAmount).toFixed(4);
    const newTotalEarned = +(user.totalEarned + rewardAmount).toFixed(2);
    const newTasksCompleted = user.tasksCompleted + 1;

    await pool.query(`
      UPDATE users SET
        balance = $1,
        total_earned = $2,
        tasks_completed = $3,
        last_ad_watched_at = $4,
        updated_at = NOW()
      WHERE id = $5
    `, [newBalance, newTotalEarned, newTasksCompleted, Date.now(), userId]);

    await pool.query('UPDATE bot_stats SET total_ads_watched = total_ads_watched + 1 WHERE id = 1');

    await pool.query(`
      INSERT INTO activities (id, user_id, title, description, time_text, type, icon)
      VALUES ($1, $2, $3, $4, 'Just now', 'task', 'dollar')
    `, [
      'act_' + Date.now(),
      userId,
      'Adsgram Video Ad Reward',
      `You earned $${rewardAmount}`
    ]);

    res.json({ ok: true, message: "Reward credited successfully" });
  } catch (err) {
    console.error("Adsgram reward webhook error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Play Game (Lucky Spin or Number Challenge)
app.post('/api/play-game', async (req, res) => {
  const { userId = "123456789", gameType, wonAmount = 0.02 } = req.body;
  try {
    const user = await getOrCreateUser(userId);
    const newBalance = +(user.balance + wonAmount).toFixed(4);
    const newTotalEarned = +(user.totalEarned + wonAmount).toFixed(2);
    const newGamesPlayed = user.gamesPlayed + 1;

    await pool.query(`
      UPDATE users SET
        balance = $1,
        total_earned = $2,
        games_played = $3,
        updated_at = NOW()
      WHERE id = $4
    `, [newBalance, newTotalEarned, newGamesPlayed, userId]);

    await pool.query(`
      INSERT INTO activities (id, user_id, title, description, time_text, type, icon)
      VALUES ($1, $2, $3, $4, 'Just now', 'game', 'game')
    `, [
      'act_' + Date.now(),
      userId,
      `${gameType === 'spin' ? 'Lucky Spin' : 'Number Challenge'} Reward`,
      `Won $${wonAmount.toFixed(2)}`
    ]);

    const updatedUser = await getOrCreateUser(userId);
    res.json({ success: true, message: `Game played! Won $${wonAmount}`, user: updatedUser });
  } catch (err) {
    console.error("Play game error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Request Withdrawal
app.post('/api/withdraw', async (req, res) => {
  const { userId = "123456789", method, amount, walletAddress } = req.body;
  try {
    const user = await getOrCreateUser(userId);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const min = 0.10;
    if (parsedAmount < min) {
      return res.status(400).json({ success: false, message: `Minimum withdrawal is $${min.toFixed(2)}` });
    }

    if (user.balance < parsedAmount) {
      return res.status(400).json({ success: false, message: "Insufficient available balance" });
    }

    const newBalance = +(user.balance - parsedAmount).toFixed(4);
    const newPendingBalance = +(user.pendingBalance + parsedAmount).toFixed(4);
    const newPendingRequests = user.pendingRequests + 1;
    const newTotalTransactions = user.totalTransactions + 1;

    const newWithdrawalId = 'w' + Date.now();
    const dateToday = new Date().toISOString().split('T')[0];

    await pool.query(`
      UPDATE users SET
        balance = $1,
        pending_balance = $2,
        pending_requests = $3,
        total_transactions = $4,
        updated_at = NOW()
      WHERE id = $5
    `, [newBalance, newPendingBalance, newPendingRequests, newTotalTransactions, userId]);

    await clientInsertWithdrawal(newWithdrawalId, userId, method, parsedAmount, walletAddress, dateToday);

    const updatedUser = await getOrCreateUser(userId);
    res.json({ success: true, message: "Withdrawal request submitted successfully!", user: updatedUser });
  } catch (err) {
    console.error("Withdraw error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

async function clientInsertWithdrawal(id, userId, method, amount, walletAddress, date) {
  await pool.query(`
    INSERT INTO withdrawals (id, user_id, method, amount, status, wallet_address, date)
    VALUES ($1, $2, $3, $4, 'Pending', $5, $6)
  `, [id, userId, method, amount, walletAddress || '', date]);
}

// Serve static frontend
const clientDist = path.join(__dirname, 'client/dist');
const fs = require('fs');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  // Start Telegram bot alongside server
  if (process.env.BOT_TOKEN) {
    try {
      require('./bot');
    } catch (botErr) {
      console.error("Bot launch notice:", botErr.message);
    }
  }
});
