const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_UrtMqoi8QNI9@ep-flat-block-b5o19duu-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize Tables
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) DEFAULT '',
        username VARCHAR(255) DEFAULT '',
        verified BOOLEAN DEFAULT true,
        balance NUMERIC(14, 4) DEFAULT 0.0000,
        pending_balance NUMERIC(14, 4) DEFAULT 0.0000,
        total_earned NUMERIC(14, 4) DEFAULT 0.0000,
        withdrawn NUMERIC(14, 4) DEFAULT 0.0000,
        total_transactions INT DEFAULT 0,
        pending_requests INT DEFAULT 0,
        tasks_completed INT DEFAULT 0,
        all_tasks_completed_at BIGINT DEFAULT NULL,
        last_ad_watched_at BIGINT DEFAULT NULL,
        games_played INT DEFAULT 0,
        plane_plays_today INT DEFAULT 0,
        plane_plays_window_start BIGINT DEFAULT NULL,
        daily_claimed_today BOOLEAN DEFAULT false,
        last_daily_claim TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        referrals_count INT DEFAULT 0,
        referral_code VARCHAR(64) DEFAULT NULL,
        referred_by VARCHAR(64) DEFAULT NULL,
        bot_username VARCHAR(128) DEFAULT 'adsduckgobot',
        per_referral_bonus NUMERIC(10, 4) DEFAULT 0.0100,
        photo_url TEXT DEFAULT '',
        tasks_json JSONB DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(64) DEFAULT NULL;

      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        time_text VARCHAR(64) DEFAULT 'Just now',
        type VARCHAR(64) DEFAULT 'task',
        icon VARCHAR(64) DEFAULT 'dollar',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS withdrawals (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        method VARCHAR(128) NOT NULL,
        amount NUMERIC(14, 4) NOT NULL,
        status VARCHAR(64) DEFAULT 'Pending',
        wallet_address TEXT DEFAULT '',
        date VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bot_stats (
        id INT PRIMARY KEY DEFAULT 1,
        total_impressions BIGINT DEFAULT 0,
        total_ads_watched BIGINT DEFAULT 0,
        total_airplane_plays BIGINT DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      INSERT INTO bot_stats (id, total_impressions, total_ads_watched, total_airplane_plays)
      VALUES (1, 0, 0, 0)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ Neon PostgreSQL Database Initialized Successfully!');
  } catch (err) {
    console.error('❌ Error initializing Neon DB:', err);
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initDB
};
