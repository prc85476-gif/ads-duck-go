const { pool } = require('./db');

function getRandomTaskReward() {
  const min = 0.002;
  const max = 0.005;
  return Number((Math.random() * (max - min) + min).toFixed(3));
}

function generateInitialTasks() {
  const baseTasks = [
    { id: 1, name: "AdGem", color: "#8b5cf6", icon: "video" },
    { id: 2, name: "BitLabs", color: "#3b82f6", icon: "monitor" },
    { id: 3, name: "Tapjoy", color: "#ef4444", icon: "flame" },
    { id: 4, name: "AdColony", color: "#1e293b", icon: "film" },
    { id: 5, name: "Fyber", color: "#10b981", icon: "zap" },
    { id: 6, name: "InMobi", color: "#0284c7", icon: "play" },
    { id: 7, name: "ironSource", color: "#0f172a", icon: "tv" },
    { id: 8, name: "Chartboost", color: "#16a34a", icon: "trophy" },
    { id: 9, name: "Vungle", color: "#9333ea", icon: "clapper" },
    { id: 10, name: "Unity Ads", color: "#09090b", icon: "star" }
  ];

  return baseTasks.map((t) => ({
    id: t.id,
    name: t.name,
    reward: 10,
    completed: false,
    tag: "Available",
    logo: t.name,
    color: t.color,
    icon: t.icon
  }));
}

// Format DB User model to Client JSON model
function formatUser(row, activities = [], withdrawals = []) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || 'User',
    username: row.username || '',
    verified: row.verified,
    balance: parseFloat(row.balance || 0),
    usdtRate: 100,
    pendingBalance: parseFloat(row.pending_balance || 0),
    totalEarned: parseFloat(row.total_earned || 0),
    withdrawn: parseFloat(row.withdrawn || 0),
    totalTransactions: parseInt(row.total_transactions || 0),
    pendingRequests: parseInt(row.pending_requests || 0),
    tasksCompleted: parseInt(row.tasks_completed || 0),
    allTasksCompletedAt: row.all_tasks_completed_at ? Number(row.all_tasks_completed_at) : null,
    lastAdWatchedAt: row.last_ad_watched_at ? Number(row.last_ad_watched_at) : null,
    gamesPlayed: parseInt(row.games_played || 0),
    planePlaysToday: parseInt(row.plane_plays_today || 0),
    planePlaysWindowStart: row.plane_plays_window_start ? Number(row.plane_plays_window_start) : Date.now(),
    dailyClaimedToday: Boolean(row.daily_claimed_today),
    lastDailyClaim: row.last_daily_claim ? new Date(row.last_daily_claim).toISOString() : null,
    referralsCount: parseInt(row.referrals_count || 0),
    referralEarnings: parseFloat(row.referral_earnings || 0),
    referralCode: row.referral_code || row.id,
    botUsername: 'adsduckgobot',
    perReferralBonus: parseFloat(row.per_referral_bonus || 0.01),
    photoUrl: row.photo_url || '',
    tasks: row.tasks_json || generateInitialTasks(),
    recentActivity: activities.map(a => ({
      id: a.id,
      title: a.title,
      desc: a.description,
      time: a.time_text || 'Just now',
      type: a.type || 'task',
      icon: a.icon || 'dollar'
    })),
    withdrawals: withdrawals.map(w => ({
      id: w.id,
      method: w.method,
      amount: parseFloat(w.amount),
      status: w.status,
      date: w.date,
      address: w.wallet_address
    }))
  };
}

// Get or create user in Neon DB with automatic 24h & 20h window refresh and Referral tracking
async function getOrCreateUser(userId = "123456789", extraData = {}) {
  const client = await pool.connect();
  try {
    let res = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (res.rows.length === 0) {
      const initialTasks = generateInitialTasks();
      const referrerId = extraData.referred_by || null;

      const insertQuery = `
        INSERT INTO users (
          id, name, username, balance, pending_balance, total_earned,
          tasks_json, plane_plays_window_start, photo_url, referral_code,
          referred_by, bot_username
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING *;
      `;
      const initialValues = [
        userId,
        extraData.name || 'User',
        extraData.username || '',
        100,
        0,
        100,
        JSON.stringify(initialTasks),
        Date.now(),
        extraData.photo_url || '',
        userId,
        referrerId,
        'adsduckgobot'
      ];
      res = await client.query(insertQuery, initialValues);

      // If referred by someone, credit referrer 100 Duck Coins bonus instantly
      if (referrerId && referrerId !== userId) {
        try {
          const refUserRes = await client.query('SELECT * FROM users WHERE id = $1', [referrerId]);
          if (refUserRes.rows.length > 0) {
            const bonus = 100;
            await client.query(`
              UPDATE users SET
                balance = balance + $1,
                total_earned = total_earned + $1,
                referrals_count = referrals_count + 1,
                referral_earnings = referral_earnings + $1,
                updated_at = NOW()
              WHERE id = $2
            `, [bonus, referrerId]);

            await client.query(`
              INSERT INTO activities (id, user_id, title, description, time_text, type, icon)
              VALUES ($1, $2, 'Referral Bonus', $3, 'Just now', 'referral', 'users')
            `, ['act_ref_' + Date.now(), referrerId, `Earned +100 Duck Coins from @${extraData.username || extraData.name || 'pilot'}`]);
          }
        } catch (refErr) {
          console.error("Error crediting referral bonus:", refErr);
        }
      }
    }

    let userRow = res.rows[0];

    // Check 24-hour and 20-hour limits in DB
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const TWENTY_HOURS = 20 * 60 * 60 * 1000;
    let needsUpdate = false;
    let newPlanePlaysToday = userRow.plane_plays_today;
    let newPlaneWindowStart = userRow.plane_plays_window_start;
    let newDailyClaimedToday = userRow.daily_claimed_today;
    let newTasksJson = userRow.tasks_json;
    let newTasksCompleted = userRow.tasks_completed;
    let newAllTasksCompletedAt = userRow.all_tasks_completed_at;

    // Plane game 24h reset
    if (!newPlaneWindowStart || (now - Number(newPlaneWindowStart) > TWENTY_FOUR_HOURS)) {
      newPlanePlaysToday = 0;
      newPlaneWindowStart = now;
      needsUpdate = true;
    }

    // Daily claim 24h reset
    if (userRow.last_daily_claim) {
      const elapsed = now - new Date(userRow.last_daily_claim).getTime();
      if (elapsed >= TWENTY_FOUR_HOURS && newDailyClaimedToday) {
        newDailyClaimedToday = false;
        needsUpdate = true;
      }
    }

    // Tasks 20h reset (if all completed)
    if (userRow.all_tasks_completed_at) {
      const elapsed = now - Number(userRow.all_tasks_completed_at);
      if (elapsed >= TWENTY_HOURS) {
        newTasksJson = generateInitialTasks();
        newTasksCompleted = 0;
        newAllTasksCompletedAt = null;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      const updateRes = await client.query(`
        UPDATE users SET
          plane_plays_today = $1,
          plane_plays_window_start = $2,
          daily_claimed_today = $3,
          tasks_json = $4,
          tasks_completed = $5,
          all_tasks_completed_at = $6,
          updated_at = NOW()
        WHERE id = $7
        RETURNING *;
      `, [
        newPlanePlaysToday,
        newPlaneWindowStart,
        newDailyClaimedToday,
        JSON.stringify(newTasksJson),
        newTasksCompleted,
        newAllTasksCompletedAt,
        userId
      ]);
      userRow = updateRes.rows[0];
    }

    // Fetch user recent activities
    const actRes = await client.query(
      'SELECT * FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    // Fetch user withdrawals
    const withRes = await client.query(
      'SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return formatUser(userRow, actRes.rows, withRes.rows);
  } finally {
    client.release();
  }
}

// Get global statistics across all users
async function getGlobalBotStats() {
  const client = await pool.connect();
  try {
    const userStats = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COALESCE(SUM(balance), 0) as total_user_balance,
        COALESCE(SUM(total_earned), 0) as total_earned,
        COALESCE(SUM(withdrawn), 0) as total_withdrawn,
        COALESCE(SUM(tasks_completed), 0) as total_tasks_completed
      FROM users;
    `);

    const withStats = await client.query(`
      SELECT 
        COUNT(*) as total_withdrawals,
        COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) as pending_withdrawal_amount,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN amount ELSE 0 END), 0) as completed_withdrawal_amount
      FROM withdrawals;
    `);

    const botStatsRow = await client.query('SELECT * FROM bot_stats WHERE id = 1');
    const bStats = botStatsRow.rows[0] || {};

    return {
      totalUsers: parseInt(userStats.rows[0].total_users || 0),
      totalUserBalance: parseFloat(userStats.rows[0].total_user_balance || 0),
      totalEarned: parseFloat(userStats.rows[0].total_earned || 0),
      totalWithdrawn: parseFloat(userStats.rows[0].total_withdrawn || 0),
      totalTasksCompleted: parseInt(userStats.rows[0].total_tasks_completed || 0),
      totalImpressions: parseInt(bStats.total_impressions || 0),
      totalAdsWatched: parseInt(bStats.total_ads_watched || 0),
      totalAirplanePlays: parseInt(bStats.total_airplane_plays || 0),
      totalWithdrawalRequests: parseInt(withStats.rows[0].total_withdrawals || 0),
      pendingWithdrawalAmount: parseFloat(withStats.rows[0].pending_withdrawal_amount || 0),
      completedWithdrawalAmount: parseFloat(withStats.rows[0].completed_withdrawal_amount || 0)
    };
  } finally {
    client.release();
  }
}

module.exports = {
  getOrCreateUser,
  getGlobalBotStats,
  generateInitialTasks
};
