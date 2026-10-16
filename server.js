require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory mock database for users
const usersDB = {
  // default user for browser demo / mini app
  "123456789": {
    id: "123456789",
    name: "Md. Rakib",
    username: "rakib_pro",
    verified: true,
    balance: 0.2500,
    usdtRate: 100, // $0.2500 ≈ 25.00 USDT
    pendingBalance: 0.0000,
    totalEarned: 12.50,
    withdrawn: 8.00,
    totalTransactions: 15,
    pendingRequests: 1,
    tasksCompleted: 0,
    gamesPlayed: 2,
    dailyClaimedToday: false,
    lastDailyClaim: null,
    referralsCount: 8,
    referralEarnings: 0.08,
    referralCode: "RAKIB789",
    botUsername: "AdEarn_Income_Bot",
    perReferralBonus: 0.01,
    recentActivity: [
      { id: '1', title: 'Task Reward', desc: 'You earned $0.05', time: '2h ago', type: 'task', icon: 'dollar' },
      { id: '2', title: 'Game Reward', desc: 'Lucky Spin bonus', time: '5h ago', type: 'game', icon: 'game' }
    ],
    // 10 predefined ad tasks
    tasks: [
      { id: 1, name: "AdGem", reward: 0.02, completed: false, tag: "Available", logo: "AdGem", color: "#8b5cf6" },
      { id: 2, name: "BitLabs", reward: 0.03, completed: false, tag: "Available", logo: "BitLabs", color: "#3b82f6" },
      { id: 3, name: "Tapjoy", reward: 0.02, completed: false, tag: "Available", logo: "Tapjoy", color: "#ef4444" },
      { id: 4, name: "AdColony", reward: 0.04, completed: false, tag: "Available", logo: "AdColony", color: "#1e293b" },
      { id: 5, name: "Fyber", reward: 0.03, completed: false, tag: "Available", logo: "Fyber", color: "#10b981" },
      { id: 6, name: "InMobi", reward: 0.02, completed: false, tag: "Available", logo: "InMobi", color: "#0284c7" },
      { id: 7, name: "ironSource", reward: 0.03, completed: false, tag: "Available", logo: "ironSource", color: "#0f172a" },
      { id: 8, name: "Chartboost", reward: 0.04, completed: false, tag: "Available", logo: "Chartboost", color: "#16a34a" },
      { id: 9, name: "Vungle", reward: 0.02, completed: false, tag: "Available", logo: "Vungle", color: "#9333ea" },
      { id: 10, name: "Unity Ads", reward: 0.03, completed: false, tag: "Available", logo: "Unity Ads", color: "#09090b" }
    ],
    withdrawals: [
      { id: 'w1', method: 'USDT (TRC20)', amount: 5.00, status: 'Completed', date: '2026-10-15' },
      { id: 'w2', method: 'Binance Pay', amount: 3.00, status: 'Completed', date: '2026-10-12' },
      { id: 'w3', method: 'USDT (TRC20)', amount: 2.00, status: 'Pending', date: '2026-10-16' }
    ]
  }
};

function getUser(userId = "123456789") {
  if (!usersDB[userId]) {
    usersDB[userId] = JSON.parse(JSON.stringify(usersDB["123456789"]));
    usersDB[userId].id = userId;
  }
  return usersDB[userId];
}

// Routes
app.get('/api/user', (req, res) => {
  const user = getUser("123456789");
  res.json({ success: true, data: user });
});

app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id || "123456789";
  const user = getUser(userId);
  res.json({ success: true, data: user });
});

// Daily reward claim ($0.01)
app.post('/api/daily-claim', (req, res) => {
  const { userId = "123456789" } = req.body;
  const user = getUser(userId);

  if (user.dailyClaimedToday) {
    return res.status(400).json({ success: false, message: "Daily reward already claimed today!" });
  }

  const reward = 0.01;
  user.balance = +(user.balance + reward).toFixed(4);
  user.totalEarned = +(user.totalEarned + reward).toFixed(2);
  user.dailyClaimedToday = true;
  user.lastDailyClaim = new Date().toISOString();

  user.recentActivity.unshift({
    id: Date.now().toString(),
    title: 'Daily Reward',
    desc: `Claimed daily $${reward.toFixed(2)}`,
    time: 'Just now',
    type: 'daily',
    icon: 'gift'
  });

  res.json({ success: true, message: "Daily reward claimed!", reward, newBalance: user.balance, user });
});

// Watch Ad & Complete Task
app.post('/api/complete-task', (req, res) => {
  const { userId = "123456789", taskId } = req.body;
  const user = getUser(userId);

  const task = user.tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }

  if (task.completed) {
    return res.status(400).json({ success: false, message: "Task already completed today!" });
  }

  task.completed = true;
  task.tag = "Completed";
  user.balance = +(user.balance + task.reward).toFixed(4);
  user.totalEarned = +(user.totalEarned + task.reward).toFixed(2);
  user.tasksCompleted += 1;

  user.recentActivity.unshift({
    id: Date.now().toString(),
    title: `${task.name} Ad Reward`,
    desc: `You earned $${task.reward.toFixed(2)}`,
    time: 'Just now',
    type: 'task',
    icon: 'dollar'
  });

  res.json({ success: true, message: `Watched ad from ${task.name}! Earned $${task.reward}`, user });
});

// Play Game (Lucky Spin or Number Challenge)
app.post('/api/play-game', (req, res) => {
  const { userId = "123456789", gameType, wonAmount = 0.02 } = req.body;
  const user = getUser(userId);

  user.balance = +(user.balance + wonAmount).toFixed(4);
  user.totalEarned = +(user.totalEarned + wonAmount).toFixed(2);
  user.gamesPlayed += 1;

  user.recentActivity.unshift({
    id: Date.now().toString(),
    title: `${gameType === 'spin' ? 'Lucky Spin' : 'Number Challenge'} Reward`,
    desc: `Won $${wonAmount.toFixed(2)}`,
    time: 'Just now',
    type: 'game',
    icon: 'game'
  });

  res.json({ success: true, message: `Game played! Won $${wonAmount}`, user });
});

// Request Withdrawal
app.post('/api/withdraw', (req, res) => {
  const { userId = "123456789", method, amount, walletAddress } = req.body;
  const user = getUser(userId);

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

  user.balance = +(user.balance - parsedAmount).toFixed(4);
  user.pendingBalance = +(user.pendingBalance + parsedAmount).toFixed(4);
  user.pendingRequests += 1;
  user.totalTransactions += 1;

  const newWithdrawal = {
    id: 'w' + Date.now(),
    method,
    amount: parsedAmount,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    address: walletAddress
  };

  user.withdrawals.unshift(newWithdrawal);

  res.json({ success: true, message: "Withdrawal request submitted successfully!", user });
});

// Serve static frontend
const clientDist = path.join(__dirname, 'client/dist');
const fs = require('fs');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
