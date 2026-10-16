import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  CheckSquare, 
  Wallet as WalletIcon, 
  User as UserIcon,
  Bell, 
  ChevronRight, 
  Play, 
  ArrowRight, 
  Gift, 
  DollarSign, 
  Gamepad2, 
  Settings, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Info, 
  LogOut,
  X,
  CreditCard,
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  Users,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  Plane
} from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://localhost:5000/api'
  : '/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'tasks' | 'wallet' | 'profile'
  
  // User State
  const [user, setUser] = useState({
    id: "123456789",
    name: "Md. Rakib",
    username: "rakib_pro",
    verified: true,
    balance: 0.2500,
    usdtRate: 100,
    pendingBalance: 0.0000,
    totalEarned: 12.50,
    withdrawn: 8.00,
    totalTransactions: 15,
    pendingRequests: 1,
    tasksCompleted: 0,
    gamesPlayed: 2,
    dailyClaimedToday: false,
    referralsCount: 8,
    referralEarnings: 0.08,
    referralCode: "RAKIB789",
    botUsername: "AdEarn_Income_Bot",
    perReferralBonus: 0.01,
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    recentActivity: [
      { id: '1', title: 'Task Reward', desc: 'You earned $0.05', time: '2h ago', type: 'task' },
      { id: '2', title: 'Game Reward', desc: 'Lucky Spin bonus', time: '5h ago', type: 'game' }
    ],
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
  });

  // Modals
  const [adModal, setAdModal] = useState({ open: false, task: null, countdown: 5 });
  const [withdrawModal, setWithdrawModal] = useState({ open: false, method: 'USDT (TRC20)', min: 5.00 });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [gameModal, setGameModal] = useState({ open: false, type: 'spin', playing: false, result: null });
  const [toastMessage, setToastMessage] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);
  const [planeGameOpen, setPlaneGameOpen] = useState(false);

  // Listen to messages from Airplane Game iframe
  useEffect(() => {
    const handleGameMessage = (e) => {
      if (!e.data) return;
      if (e.data.type === 'AIRPLANE_GAME_EXIT') {
        setPlaneGameOpen(false);
      } else if (e.data.type === 'AIRPLANE_GAME_CLAIM') {
        const earned = e.data.earned || 0.03;
        setPlaneGameOpen(false);
        setUser(prev => ({
          ...prev,
          balance: +(prev.balance + earned).toFixed(4),
          totalEarned: +(prev.totalEarned + earned).toFixed(2),
          gamesPlayed: prev.gamesPlayed + 1,
          recentActivity: [
            { 
              id: Date.now().toString(), 
              title: 'Airplane Crash Game', 
              desc: `Won $${earned.toFixed(4)} (${e.data.usdt || 0} USDT, ${e.data.btc || 0} BTC)`, 
              time: 'Just now', 
              type: 'game' 
            },
            ...prev.recentActivity
          ]
        }));
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        showToast(`🛩️ Game Rewards: +$${earned.toFixed(4)} credited to wallet!`);
      }
    };
    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, []);

  // Fetch initial user data from server if available
  useEffect(() => {
    // Detect Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser) {
        setUser(prev => ({
          ...prev,
          id: tgUser.id?.toString() || prev.id,
          name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || prev.name,
          username: tgUser.username || prev.username,
          photoUrl: tgUser.photo_url || prev.photoUrl
        }));
      }
    }

    fetch(`${API_BASE}/user/123456789`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setUser(prev => ({
            ...prev,
            ...data.data,
            referralEarnings: data.data.referralEarnings ?? prev.referralEarnings ?? 0.08,
            referralsCount: data.data.referralsCount ?? prev.referralsCount ?? 8,
            referralCode: data.data.referralCode || prev.referralCode || "RAKIB789",
            botUsername: data.data.botUsername || prev.botUsername || "AdEarn_Income_Bot"
          }));
        }
      })
      .catch(err => console.log('Offline/Local standalone mode active'));
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Claim Daily Reward ($0.01)
  const handleClaimDaily = async () => {
    if (user.dailyClaimedToday) return;

    try {
      const res = await fetch(`${API_BASE}/daily-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        showToast("🎉 Daily reward of $0.01 added!");
      } else {
        showToast(data.message);
      }
    } catch {
      // Offline fallback
      setUser(prev => ({
        ...prev,
        balance: +(prev.balance + 0.01).toFixed(4),
        totalEarned: +(prev.totalEarned + 0.01).toFixed(2),
        dailyClaimedToday: true,
        recentActivity: [
          { id: Date.now().toString(), title: 'Daily Reward', desc: 'Claimed daily $0.01', time: 'Just now', type: 'daily' },
          ...prev.recentActivity
        ]
      }));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      showToast("🎉 Daily reward of $0.01 added!");
    }
  };

  // Watch Ad & Earn
  const startWatchingAd = (task) => {
    if (task.completed) {
      showToast("Task already completed today!");
      return;
    }
    setAdModal({ open: true, task, countdown: 5 });
  };

  useEffect(() => {
    let timer;
    if (adModal.open && adModal.countdown > 0) {
      timer = setTimeout(() => {
        setAdModal(prev => ({ ...prev, countdown: prev.countdown - 1 }));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [adModal.open, adModal.countdown]);

  const handleFinishAd = async () => {
    const task = adModal.task;
    setAdModal({ open: false, task: null, countdown: 5 });

    try {
      const res = await fetch(`${API_BASE}/complete-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, taskId: task.id })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        throw new Error(data.message);
      }
    } catch {
      // Local fallback
      setUser(prev => {
        const updatedTasks = prev.tasks.map(t => t.id === task.id ? { ...t, completed: true, tag: "Completed" } : t);
        return {
          ...prev,
          tasks: updatedTasks,
          balance: +(prev.balance + task.reward).toFixed(4),
          totalEarned: +(prev.totalEarned + task.reward).toFixed(2),
          tasksCompleted: prev.tasksCompleted + 1,
          recentActivity: [
            { id: Date.now().toString(), title: `${task.name} Ad Reward`, desc: `You earned $${task.reward.toFixed(2)}`, time: 'Just now', type: 'task' },
            ...prev.recentActivity
          ]
        };
      });
    }

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showToast(`💰 Successfully earned $${task.reward.toFixed(2)}!`);
  };

  // Play Game Handler
  const handlePlayGame = (type) => {
    setGameModal({ open: true, type, playing: false, result: null });
  };

  const executeGameRound = async () => {
    setGameModal(prev => ({ ...prev, playing: true }));
    setTimeout(async () => {
      const prize = gameModal.type === 'spin' ? 0.02 : 0.03;
      setGameModal(prev => ({ ...prev, playing: false, result: prize }));

      try {
        const res = await fetch(`${API_BASE}/play-game`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, gameType: gameModal.type, wonAmount: prize })
        });
        const data = await res.json();
        if (data.success) setUser(data.user);
      } catch {
        setUser(prev => ({
          ...prev,
          balance: +(prev.balance + prize).toFixed(4),
          totalEarned: +(prev.totalEarned + prize).toFixed(2),
          gamesPlayed: prev.gamesPlayed + 1,
          recentActivity: [
            { id: Date.now().toString(), title: `${gameModal.type === 'spin' ? 'Lucky Spin' : 'Number Challenge'}`, desc: `Won $${prize.toFixed(2)}`, time: 'Just now', type: 'game' },
            ...prev.recentActivity
          ]
        }));
      }

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      showToast(`🎯 You won $${prize.toFixed(2)}!`);
    }, 1500);
  };

  // Withdraw Handler (Opens bottom sheet window)
  const openWithdrawModal = (method = 'USDT (TRC20)', min = 0.10) => {
    setWithdrawModal({ open: true, method, min });
    setWithdrawAmount(min.toString());
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);

    if (isNaN(amt) || amt < withdrawModal.min) {
      showToast(`Minimum withdrawal is $${withdrawModal.min.toFixed(2)}`);
      return;
    }
    if (user.balance < amt) {
      showToast("Insufficient available balance!");
      return;
    }
    if (!withdrawAddress.trim()) {
      showToast("Please enter your payout address / account");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          method: withdrawModal.method,
          amount: amt,
          walletAddress: withdrawAddress
        })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        throw new Error(data.message);
      }
    } catch {
      setUser(prev => ({
        ...prev,
        balance: +(prev.balance - amt).toFixed(4),
        pendingBalance: +(prev.pendingBalance + amt).toFixed(4),
        pendingRequests: prev.pendingRequests + 1,
        totalTransactions: prev.totalTransactions + 1,
        withdrawals: [
          { id: 'w' + Date.now(), method: withdrawModal.method, amount: amt, status: 'Pending', date: new Date().toISOString().split('T')[0], address: withdrawAddress },
          ...prev.withdrawals
        ]
      }));
    }

    setWithdrawModal({ open: false, method: '', min: 0 });
    setWithdrawAddress('');
    showToast("✅ Withdrawal request submitted!");
  };

  // Header Brand & Top Area
  const renderTopBar = () => (
    <div className="top-nav">
      <div className="brand-section">
        {/* Real User Profile Picture in place of generic logo */}
        <div style={{ position: 'relative' }}>
          <img 
            src={user.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
            alt="Profile" 
            className="user-avatar-mini"
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px',
              border: '2px solid #1e6bf5',
              objectFit: 'cover'
            }}
            onClick={() => showToast(`User: ${user.name} | ID: ${user.id}`)}
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="brand-title">AdEarn</span>
            <ShieldCheck size={14} color="#1e6bf5" />
          </div>
          <div className="brand-tagline" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
            <span style={{ color: '#1e6bf5', fontWeight: 700 }}>ID:</span>
            <span style={{ color: '#0f172a', fontWeight: 700 }}>{user.id}</span>
          </div>
        </div>
      </div>

      <div className="top-actions">
        <div className="bell-btn" onClick={() => showToast("No new notifications")}>
          <Bell size={18} />
          <span className="bell-badge">2</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0f172a',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 700,
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Top Bar for Home Page */}
      {activeTab === 'home' && renderTopBar()}

      {/* ======================= TAB 1: HOME ======================= */}
      {activeTab === 'home' && (
        <div className="main-view">
          {/* Main Blue Balance Card (With subtle transparent growth chart graph matching 2nd image) */}
          <div className="balance-hero-card" style={{ cursor: 'default', position: 'relative', overflow: 'hidden' }}>
            {/* Subtle Watermarked Chart Graphic (Larger & More Faded/Japsha) matching 2nd image */}
            <div style={{
              position: 'absolute',
              right: 6,
              bottom: 0,
              width: 175,
              height: 105,
              pointerEvents: 'none',
              opacity: 0.16,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end'
            }}>
              <svg width="170" height="100" viewBox="0 0 170 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Vertical Rounded Bars */}
                <rect x="15" y="55" width="14" height="45" rx="5" fill="#ffffff" />
                <rect x="42" y="65" width="14" height="35" rx="5" fill="#ffffff" />
                <rect x="69" y="48" width="14" height="52" rx="5" fill="#ffffff" />
                <rect x="96" y="34" width="14" height="66" rx="5" fill="#ffffff" />
                <rect x="123" y="16" width="14" height="84" rx="5" fill="#ffffff" />
                
                {/* Growth Trend Line connecting tops and pointing upwards to top-right */}
                <path 
                  d="M5 70 L22 55 L49 65 L76 48 L103 34 L130 16 L165 4" 
                  stroke="#ffffff" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>

            <div className="balance-card-header" style={{ position: 'relative', zIndex: 2 }}>
              <div className="wallet-icon-box">
                <WalletIcon size={18} color="#fff" />
              </div>
              <span className="balance-label">Available Balance</span>
              
              {/* Right Side Pill Badge */}
              <div style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.18)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)'
              }}>
                <Sparkles size={13} color="#fde047" />
                <span>Active Earning</span>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px' }}>
              <div>
                <div className="balance-amount">${user.balance.toFixed(4)}</div>
                <div className="balance-usdt-approx">≈ {(user.balance * user.usdtRate).toFixed(2)} USDT</div>
              </div>
            </div>
          </div>

          {/* Action Dual Buttons (Matching 2nd pic style) */}
          <div className="hero-dual-actions">
            <button className="action-pill-btn withdraw" onClick={() => openWithdrawModal('USDT (TRC20)', 5.00)}>
              <div className="action-icon-circle withdraw">
                <ArrowDownLeft size={20} />
              </div>
              <div className="action-texts">
                <span className="action-subtext">Instant Payout</span>
                <span className="action-maintext withdraw">Withdraw</span>
              </div>
            </button>

            <button className="action-pill-btn earning" onClick={() => setActiveTab('tasks')}>
              <div className="action-icon-circle earning">
                <Play size={18} fill="#2563eb" color="#2563eb" />
              </div>
              <div className="action-texts">
                <span className="action-subtext">Watch & Earn</span>
                <span className="action-maintext earning">Watching Ads</span>
              </div>
            </button>
          </div>

          {/* Games Section */}
          <div className="section-header">
            <span className="section-title">Play Games & Earn More</span>
          </div>

          <div className="games-grid">
            {/* Box 1: Airplane Crash (Matching Left Green/Teal Card with Border Glow & Watermark) */}
            <div className="game-card lucky-spin" onClick={() => setPlaneGameOpen(true)}>
              {/* Subtle Watermarked Coin Rings Graphic */}
              <div style={{
                position: 'absolute',
                right: -6,
                bottom: -8,
                width: 60,
                height: 60,
                opacity: 0.18,
                pointerEvents: 'none'
              }}>
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <circle cx="36" cy="36" r="22" stroke="#10b981" strokeWidth="3" />
                  <circle cx="20" cy="20" r="14" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
                </svg>
              </div>

              <div className="game-card-top-row">
                <div>
                  <div className="game-title">Airplane</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Crypto 1945</div>
                </div>
                <div className="game-circle-glow-icon green">
                  <Plane size={18} color="#fff" />
                </div>
              </div>

              <div className="game-bottom-pill-wrap">
                <span className="game-badge-pill green">
                  Play & Earn
                </span>
              </div>
            </div>

            {/* Box 2: Number Challenge (Matching Right Blue Card with Border Glow & Watermark) */}
            <div className="game-card number-challenge" onClick={() => handlePlayGame('number')}>
              {/* Subtle Watermarked Growth Graphic */}
              <div style={{
                position: 'absolute',
                right: -4,
                bottom: -6,
                width: 60,
                height: 60,
                opacity: 0.18,
                pointerEvents: 'none'
              }}>
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <rect x="20" y="32" width="6" height="24" rx="2" fill="#0284c7" />
                  <rect x="30" y="24" width="6" height="32" rx="2" fill="#0284c7" />
                  <rect x="40" y="14" width="6" height="42" rx="2" fill="#0284c7" />
                  <path d="M12 40 L24 32 L34 24 L44 14 L56 6" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div className="game-card-top-row">
                <div>
                  <div className="game-title">Challenge</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Number Test</div>
                </div>
                <div className="game-circle-glow-icon blue">
                  <Sparkles size={18} color="#fff" />
                </div>
              </div>

              <div className="game-bottom-pill-wrap">
                <span className="game-badge-pill blue">
                  {user.dailyClaimedToday ? 'Claimed' : 'Daily $0.01'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="section-header">
            <span className="section-title">Recent Activity</span>
            <span className="section-link" onClick={() => setActiveTab('wallet')}>View All</span>
          </div>

          <div className="activity-list">
            {user.recentActivity.slice(0, 3).map(act => {
              // Extract or format amount
              const match = act.desc ? act.desc.match(/\$([0-9.]+)/) : null;
              const displayAmt = act.amount ? `+$${Number(act.amount).toFixed(2)}` : match ? `+${match[0]}` : '+$0.02';

              return (
                <div key={act.id} className="activity-item">
                  <div className={`activity-icon ${act.type}`}>
                    {act.type === 'task' ? <DollarSign size={20} /> : act.type === 'game' ? <Gamepad2 size={20} /> : <Gift size={20} />}
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">{act.title}</div>
                    <div className="activity-sub">{act.desc}</div>
                  </div>
                  <div className="activity-right-col">
                    <span className="activity-amount-large">{displayAmt}</span>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: TASKS ======================= */}
      {activeTab === 'tasks' && (
        <div className="main-view">
          <div className="tasks-header">
            <div className="header-back-title" onClick={() => setActiveTab('home')}>
              <span>‹</span> Tasks
            </div>
          </div>

          {/* Top Banner with Progress Bar */}
          <div className="tasks-banner">
            <div>
              <div className="tasks-banner-title">Complete Tasks & Earn</div>
              <div className="tasks-banner-sub">Watch ads, complete tasks and get rewards</div>
            </div>

            <div className="progress-row">
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(user.tasksCompleted / user.tasks.length) * 100}%` }}
                ></div>
              </div>
              <span className="progress-count">{user.tasksCompleted}/{user.tasks.length} Completed</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="task-stats-bar">
            <div className="task-stat-item">
              <span className="task-stat-label">All Tasks</span>
              <span className="task-stat-num">{user.tasks.length}</span>
            </div>
            <div className="task-stat-item">
              <span className="task-stat-label">Completed</span>
              <span className="task-stat-num">{user.tasksCompleted}</span>
            </div>
            <div className="task-stat-item">
              <span className="task-stat-label">In Progress</span>
              <span className="task-stat-num">{user.tasks.length - user.tasksCompleted}</span>
            </div>
          </div>

          {/* 10 Tasks List - Styled cleanly matching 2nd image box structure */}
          <div className="tasks-list">
            {user.tasks.map((task, idx) => (
              <div 
                key={task.id} 
                className="task-box-card"
                onClick={() => !task.completed && startWatchingAd(task)}
              >
                {/* Colorful Square Box with First Letter of Brand (Replacing round Play icon) */}
                <div 
                  className="task-square-box" 
                  style={{ 
                    background: task.color, 
                    color: '#ffffff',
                    boxShadow: `0 3px 8px ${task.color}40`
                  }}
                >
                  {task.name.charAt(0)}
                </div>

                <div className="task-content-area">
                  <span className="task-sub-label">Sponsor Video Ad #{idx + 1}</span>
                  <div className="task-brand-name">{task.name}</div>
                </div>

                <div className="task-action-pill-wrap">
                  <div className="task-reward-badge" style={{ color: task.completed ? '#64748b' : task.color }}>
                    +${task.reward.toFixed(2)}
                  </div>
                  <button 
                    className={`btn-ad-pill ${task.completed ? 'completed' : ''}`}
                    disabled={task.completed}
                    onClick={(e) => {
                      e.stopPropagation();
                      startWatchingAd(task);
                    }}
                    style={{
                      background: task.completed ? '#f1f5f9' : task.color,
                      color: task.completed ? '#94a3b8' : '#ffffff'
                    }}
                  >
                    {task.completed ? 'Watched' : 'Watch'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: REFERRAL ======================= */}
      {activeTab === 'referral' && (
        <div className="main-view">
          <div className="wallet-header">
            <div className="wallet-title">
              <Users size={22} color="#1e6bf5" />
              <span>Refer & Earn</span>
            </div>
            <div className="bell-btn" onClick={() => showToast("Share your referral link to earn $0.01 per user!")}>
              <Info size={18} />
            </div>
          </div>

          {/* Referral Hero Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1e6bf5 0%, #1557d0 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '22px 20px',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(30, 107, 245, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
              <Users size={18} color="#fff" />
              <span>Invite Friends & Earn $0.01 Per Refer</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800 }}>+${(user.referralEarnings || 0.08).toFixed(2)}</div>
            <div style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.4' }}>
              When your invited friend joins and plays <b>1 round of Airplane Crash game</b>, your referral is activated and <b>$0.01</b> is instantly credited to your wallet!
            </div>
          </div>

          {/* Referral Bot Username & Link Box */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #dce4ee',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Bot Username</span>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 700, 
                color: '#1e6bf5', 
                background: '#eff6ff', 
                padding: '3px 8px', 
                borderRadius: '6px' 
              }}>
                @{user.botUsername}
              </span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              Your Telegram Referral Link
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 12px',
              gap: '8px'
            }}>
              <input 
                type="text" 
                readOnly 
                value={`https://t.me/${user.botUsername}?start=${user.referralCode}`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  flex: 1,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  outline: 'none'
                }}
              />
              <button 
                onClick={() => {
                  navigator.clipboard?.writeText(`https://t.me/${user.botUsername}?start=${user.referralCode}`);
                  setReferralCopied(true);
                  showToast("📋 Referral link copied!");
                  setTimeout(() => setReferralCopied(false), 2000);
                }}
                style={{
                  background: referralCopied ? '#10b981' : '#1e6bf5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {referralCopied ? <Check size={14} /> : <Copy size={14} />}
                {referralCopied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button 
              onClick={() => {
                const shareLink = `https://t.me/${user.botUsername}?start=${user.referralCode}`;
                const shareText = `🚀 Join AdEarn Mini App and earn daily income watching ads! Use my referral link: ${shareLink}`;
                if (window.Telegram && window.Telegram.WebApp) {
                  window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent('🚀 Earn daily income watching ads!')}`);
                } else if (navigator.share) {
                  navigator.share({ title: 'AdEarn Referral', text: shareText, url: shareLink });
                } else {
                  navigator.clipboard?.writeText(shareText);
                  showToast("📋 Referral share message copied!");
                }
              }}
              className="btn-primary-action"
              style={{ 
                background: '#10b981', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                borderRadius: 'var(--radius-md)',
                padding: '13px'
              }}
            >
              <Users size={18} />
              Share on Telegram (+0.01$)
            </button>
          </div>

          {/* Referral Statistics */}
          <div className="section-header">
            <span className="section-title">Referral Statistics</span>
          </div>

          <div className="quick-stats-grid">
            <div className="stat-card">
              <div className="stat-icon earned">
                <Users size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Referrals</span>
                <span className="stat-number">{user.referralsCount || 8} users</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon withdrawn">
                <DollarSign size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Referral Income</span>
                <span className="stat-number">${(user.referralEarnings || 0.08).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Referral Benefits matching 2nd image style */}
          <div className="section-header">
            <span className="section-title">How It Works</span>
          </div>

          <div className="activity-list">
            <div className="activity-item" style={{ border: '1.5px solid #dce4ee', borderRadius: 'var(--radius-lg)' }}>
              <div className="activity-icon daily" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <Users size={20} />
              </div>
              <div className="activity-details">
                <div className="activity-title">1. Share Referral Link</div>
                <div className="activity-sub">Invite your friends to open the bot via your unique link</div>
              </div>
            </div>

            <div className="activity-item" style={{ border: '1.5px solid #dce4ee', borderRadius: 'var(--radius-lg)' }}>
              <div className="activity-icon task" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Play size={20} />
              </div>
              <div className="activity-details">
                <div className="activity-title">2. Play 1 Airplane Game</div>
                <div className="activity-sub">Friend must play at least 1 round of Airplane Crash game to activate</div>
              </div>
            </div>

            <div className="activity-item" style={{ border: '1.5px solid #dce4ee', borderRadius: 'var(--radius-lg)' }}>
              <div className="activity-icon task" style={{ background: '#eff6ff', color: '#1e6bf5' }}>
                <DollarSign size={20} />
              </div>
              <div className="activity-details">
                <div className="activity-title">3. Instant $0.01 Bonus</div>
                <div className="activity-sub">Upon successful activation, $0.01 is instantly credited to your wallet</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 4: WALLET (Replaced Profile page) ======================= */}
      {activeTab === 'wallet' && (
        <div className="main-view">
          <div className="wallet-header">
            <div className="wallet-title">
              <WalletIcon size={24} color="#1e6bf5" />
              <span>Wallet</span>
            </div>
            <div className="bell-btn" onClick={() => showToast("Settings updated")}>
              <Settings size={18} />
            </div>
          </div>

          {/* Available Balance Box */}
          <div className="balance-hero-card">
            <div className="balance-card-header">
              <div className="wallet-icon-box">
                <WalletIcon size={18} color="#fff" />
              </div>
              <span className="balance-label">Available Balance</span>
            </div>
            <div>
              <div className="balance-amount">${user.balance.toFixed(4)}</div>
              <div className="balance-usdt-approx">≈ {(user.balance * user.usdtRate).toFixed(2)} USDT</div>
            </div>
          </div>

          {/* Pending Balance Row */}
          <div className="pending-balance-box">
            <div>
              <div className="pending-title">Pending Balance</div>
              <div className="pending-value">${user.pendingBalance.toFixed(4)}</div>
            </div>
            <Info size={18} color="#94a3b8" />
          </div>

          {/* Withdraw Green Action Button */}
          <button className="btn-withdraw-big" onClick={() => openWithdrawModal('USDT (TRC20)', 5.00)}>
            Withdraw
          </button>

          {/* Quick Stats Grid */}
          <div className="section-header">
            <span className="section-title">Quick Stats</span>
          </div>

          <div className="quick-stats-grid">
            <div className="stat-card">
              <div className="stat-icon earned">
                <DollarSign size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Earned</span>
                <span className="stat-number">${user.totalEarned.toFixed(2)}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon withdrawn">
                <CreditCard size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Withdrawn</span>
                <span className="stat-number">${user.withdrawn.toFixed(2)}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon transactions">
                <TrendingUp size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Transactions</span>
                <span className="stat-number">{user.totalTransactions}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pending">
                <Clock size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Pending Requests</span>
                <span className="stat-number">{user.pendingRequests}</span>
              </div>
            </div>
          </div>

          {/* Withdrawal Methods */}
          <div className="section-header">
            <span className="section-title">Withdrawal Methods</span>
          </div>

          <div className="method-list">
            <div className="method-item" onClick={() => openWithdrawModal('USDT (TRC20)', 0.10)}>
              <div className="method-icon usdt">₮</div>
              <div className="method-info">
                <div className="method-name">USDT (TRC20)</div>
                <div className="method-min">Min. $0.10</div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>

            <div className="method-item" onClick={() => openWithdrawModal('Binance Pay', 0.10)}>
              <div className="method-icon binance">⬡</div>
              <div className="method-info">
                <div className="method-name">Binance Pay</div>
                <div className="method-min">Min. $0.10</div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>

            <div className="method-item" onClick={() => openWithdrawModal('PayPal', 0.10)}>
              <div className="method-icon paypal">P</div>
              <div className="method-info">
                <div className="method-name">PayPal</div>
                <div className="method-min">Min. $0.10</div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          </div>
        </div>
      )}

      {/* ======================= BOTTOM TAB BAR ======================= */}
      <div className="bottom-nav">
        <button 
          className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <HomeIcon size={20} />
          <span>Home</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={20} />
          <span>Tasks</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'referral' ? 'active' : ''}`}
          onClick={() => setActiveTab('referral')}
        >
          <Users size={20} />
          <span>Referral</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          <WalletIcon size={20} />
          <span>Wallet</span>
        </button>
      </div>

      {/* ======================= MODAL: AD PLAYER ======================= */}
      {adModal.open && (
        <div className="modal-overlay">
          <div className="modal-sheet">
            <button className="modal-close-btn" onClick={() => setAdModal({ open: false, task: null, countdown: 5 })}>
              <X size={16} />
            </button>

            <div className="modal-title">Watching Sponsor Ad</div>

            <div className="modal-ad-player">
              <span className="ad-countdown-pill">
                <Clock size={12} /> {adModal.countdown}s
              </span>
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <Sparkles size={36} color="#f59e0b" style={{ marginBottom: 10 }} />
                <div style={{ fontWeight: 800, fontSize: 16 }}>{adModal.task?.name} Video Ad</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  Stay on this screen to claim your ${adModal.task?.reward.toFixed(2)} reward
                </div>
              </div>
            </div>

            {adModal.countdown === 0 ? (
              <button className="btn-primary-action" onClick={handleFinishAd}>
                Claim ${adModal.task?.reward.toFixed(2)} Reward
              </button>
            ) : (
              <button className="btn-primary-action" disabled style={{ background: '#94a3b8' }}>
                Reward available in {adModal.countdown}s...
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================= MODAL: WITHDRAW (Bottom Sheet Window) ======================= */}
      {withdrawModal.open && (
        <div className="modal-overlay" onClick={() => setWithdrawModal({ open: false, method: '', min: 0 })}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-drag-handle"></div>
            <button className="modal-close-btn" onClick={() => setWithdrawModal({ open: false, method: '', min: 0 })}>
              <X size={16} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div className="modal-title">Withdraw Funds</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Select payout method and enter amount (Min: $0.10)
              </div>
            </div>

            {/* Method Selector Pills */}
            <div className="withdraw-method-grid">
              <div 
                className={`withdraw-method-card ${withdrawModal.method === 'USDT (TRC20)' ? 'selected' : ''}`}
                onClick={() => setWithdrawModal(prev => ({ ...prev, method: 'USDT (TRC20)', min: 0.10 }))}
              >
                <div className="withdraw-method-card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>₮</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>USDT</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>TRC20</div>
              </div>

              <div 
                className={`withdraw-method-card ${withdrawModal.method === 'Binance Pay' ? 'selected' : ''}`}
                onClick={() => setWithdrawModal(prev => ({ ...prev, method: 'Binance Pay', min: 0.10 }))}
              >
                <div className="withdraw-method-card-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>⬡</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Binance</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Pay ID</div>
              </div>

              <div 
                className={`withdraw-method-card ${withdrawModal.method === 'PayPal' ? 'selected' : ''}`}
                onClick={() => setWithdrawModal(prev => ({ ...prev, method: 'PayPal', min: 0.10 }))}
              >
                <div className="withdraw-method-card-icon" style={{ background: '#eff6ff', color: '#1e6bf5' }}>P</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>PayPal</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Email</div>
              </div>
            </div>

            <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Withdraw Amount ($)</label>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1e6bf5', cursor: 'pointer' }} onClick={() => setWithdrawAmount(user.balance.toFixed(4))}>
                    Max: ${user.balance.toFixed(4)}
                  </span>
                </div>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.10"
                  className="form-input" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Min $0.10"
                  required 
                />
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Available Balance: ${user.balance.toFixed(4)} • Minimum: $0.10
                </span>
              </div>

              <div className="form-input-group">
                <label className="form-label">
                  {withdrawModal.method === 'PayPal' ? 'PayPal Email' : `${withdrawModal.method} Address / Pay ID`}
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder={
                    withdrawModal.method === 'PayPal' ? 'example@gmail.com' : 
                    withdrawModal.method === 'Binance Pay' ? 'Enter Binance Pay ID' : 
                    'Enter TRC20 Wallet Address (T...)'
                  }
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary-action"
                style={{ 
                  background: '#10b981', 
                  padding: '14px', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 15
                }}
              >
                Submit Withdrawal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: GAMES ======================= */}
      {gameModal.open && (
        <div className="modal-overlay">
          <div className="modal-sheet">
            <button className="modal-close-btn" onClick={() => setGameModal({ open: false, type: 'spin', playing: false, result: null })}>
              <X size={16} />
            </button>

            <div className="modal-title">
              {gameModal.type === 'spin' ? '🎡 Lucky Spin' : '🔢 Number Challenge'}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Test your luck to win bonus wallet balance!
            </div>

            {/* Daily Reward Direct Claim Section Inside Number Challenge */}
            <div style={{
              background: '#fff7ed',
              border: '1.5px solid #fed7aa',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#f97316',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Gift size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Daily Free Reward</div>
                  <div style={{ fontSize: '11px', color: '#c2410c', fontWeight: 600 }}>Claim your daily $0.01</div>
                </div>
              </div>
              <button
                disabled={user.dailyClaimedToday}
                onClick={handleClaimDaily}
                style={{
                  background: user.dailyClaimedToday ? '#cbd5e1' : '#f97316',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: user.dailyClaimedToday ? 'not-allowed' : 'pointer'
                }}
              >
                {user.dailyClaimedToday ? 'Claimed' : 'Claim $0.01'}
              </button>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: 14,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 140
            }}>
              {gameModal.playing ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, animation: 'spin 1s infinite linear' }}>
                    {gameModal.type === 'spin' ? '🎡' : '🎲'}
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 700, fontSize: 14 }}>Rolling lucky outcome...</div>
                </div>
              ) : gameModal.result ? (
                <div style={{ textAlign: 'center' }}>
                  <Award size={40} color="#10b981" />
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', marginTop: 6 }}>
                    Won +${gameModal.result.toFixed(2)}!
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Credited directly to wallet</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 44 }}>{gameModal.type === 'spin' ? '🎡' : '🎯'}</div>
                  <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>Ready for round 1</div>
                </div>
              )}
            </div>

            <button 
              className="btn-primary-action"
              disabled={gameModal.playing}
              onClick={executeGameRound}
            >
              {gameModal.playing ? 'Playing...' : 'Play Now'}
            </button>
          </div>
        </div>
      )}

      {/* ======================= MODAL: AIRPLANE CRASH GAME (Crypto Air Force 1945) ======================= */}
      {planeGameOpen && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 300,
          background: '#060d14',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <iframe 
            src="/airforce_game.html" 
            title="Crypto Air Force 1945"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block'
            }}
          />
        </div>
      )}
    </div>
  );
}
