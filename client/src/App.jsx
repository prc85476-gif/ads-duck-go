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
  Plane,
  Video,
  Tv,
  Film,
  PlayCircle,
  Clapperboard,
  MonitorPlay,
  Zap,
  Flame,
  Star,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://localhost:5000/api'
  : '/api';

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

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'tasks' | 'referral' | 'leaderboard'
  
  // User State
  const [user, setUser] = useState({
    id: "123456789",
    name: "Md. Rakib",
    username: "rakib_pro",
    verified: true,
    balance: 150,
    totalEarned: 350,
    tasksCompleted: 0,
    gamesPlayed: 2,
    planePlaysToday: 0,
    planePlaysWindowStart: Date.now(),
    dailyClaimedToday: false,
    lastDailyClaim: null,
    referralsCount: 8,
    referralEarnings: 800,
    referralCode: "123456789",
    botUsername: "adsduckgobot",
    perReferralBonus: 100,
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    recentActivity: [
      { id: '1', title: 'Ad Clip Reward', desc: 'You earned +10 Duck Coins', time: '2h ago', type: 'task' },
      { id: '2', title: 'Airplane Combat', desc: 'Won +25 Duck Coins', time: '5h ago', type: 'game' }
    ],
    tasks: generateInitialTasks()
  });

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState([
    { id: '1', name: 'CyberDuck_99', username: 'cyber_duck', balance: 14250, badge: '🥇 ACE' },
    { id: '2', name: 'SkyMaster_Pro', username: 'skymaster', balance: 11800, badge: '🥈 PRO' },
    { id: '3', name: 'CryptoAviator', username: 'aviator77', balance: 9400, badge: '🥉 ELITE' },
    { id: '4', name: 'DuckVader', username: 'duckvader', balance: 7650, badge: '🎖️ TOP' },
    { id: '5', name: 'TonFighter', username: 'tonfighter', balance: 6200, badge: '🎖️ TOP' },
    { id: '6', name: 'FlightOfficer', username: 'flightoff', balance: 5100, badge: '🎖️ TOP' },
    { id: '7', name: 'AeroBlast', username: 'aeroblast', balance: 4350, badge: '🎖️ TOP' }
  ]);

  // Modals & Timers
  const [adModal, setAdModal] = useState({ open: false, task: null, countdown: 5 });
  const [gameModal, setGameModal] = useState({ open: false, type: 'spin', playing: false, result: null });
  const [toastMessage, setToastMessage] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);
  const [planeGameOpen, setPlaneGameOpen] = useState(false);

  // Live Real-Time Timers (Updates every second)
  const [planeTimeRemaining, setPlaneTimeRemaining] = useState('');
  const [dailyTimeRemaining, setDailyTimeRemaining] = useState('');
  const [adCooldownRemaining, setAdCooldownRemaining] = useState(0); // 10s anti-spam cooldown
  const [tasksResetTimeRemaining, setTasksResetTimeRemaining] = useState('');

  // 1-second interval to update remaining countdowns
  useEffect(() => {
    const updateCountdowns = () => {
      const now = Date.now();
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      const TWENTY_HOURS = 20 * 60 * 60 * 1000;

      // Anti-spam Ad Cooldown (10 seconds between ads)
      if (user.lastAdWatchedAt) {
        const elapsedSinceAd = now - user.lastAdWatchedAt;
        const cooldownDiff = 10000 - elapsedSinceAd;
        if (cooldownDiff > 0) {
          setAdCooldownRemaining(Math.ceil(cooldownDiff / 1000));
        } else {
          setAdCooldownRemaining(0);
        }
      } else {
        setAdCooldownRemaining(0);
      }

      // 20-Hours Tasks Reset timer (when all 10 tasks completed)
      if (user.allTasksCompletedAt) {
        const elapsed = now - user.allTasksCompletedAt;
        const diff = TWENTY_HOURS - elapsed;
        if (diff > 0) {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTasksResetTimeRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        } else {
          setTasksResetTimeRemaining('');
          setUser(prev => ({
            ...prev,
            tasks: generateInitialTasks(),
            tasksCompleted: 0,
            allTasksCompletedAt: null
          }));
        }
      } else {
        setTasksResetTimeRemaining('');
      }

      // Plane Game timer (if 2/2 used)
      if (user.planePlaysToday >= 2 && user.planePlaysWindowStart) {
        const elapsed = now - user.planePlaysWindowStart;
        const diff = TWENTY_FOUR_HOURS - elapsed;
        if (diff > 0) {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setPlaneTimeRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        } else {
          setPlaneTimeRemaining('');
          setUser(prev => ({ ...prev, planePlaysToday: 0, planePlaysWindowStart: now }));
        }
      } else {
        setPlaneTimeRemaining('');
      }

      // Daily Claim timer (if claimed today)
      if (user.dailyClaimedToday && user.lastDailyClaim) {
        const elapsed = now - new Date(user.lastDailyClaim).getTime();
        const diff = TWENTY_FOUR_HOURS - elapsed;
        if (diff > 0) {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setDailyTimeRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        } else {
          setDailyTimeRemaining('');
          setUser(prev => ({ ...prev, dailyClaimedToday: false }));
        }
      } else {
        setDailyTimeRemaining('');
      }
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [user.planePlaysToday, user.planePlaysWindowStart, user.dailyClaimedToday, user.lastDailyClaim, user.lastAdWatchedAt, user.allTasksCompletedAt]);

  // Open Airplane Game (with 2 plays/24h limit)
  const handleOpenPlaneGame = () => {
    if (user.planePlaysToday >= 2) {
      showToast(`⏳ Limit reached: 2/2 plays used. Next play in ${planeTimeRemaining || 'a few hours'}`);
      return;
    }
    setPlaneGameOpen(true);
  };

  // Listen to messages from Airplane Game iframe
  useEffect(() => {
    const handleGameMessage = async (e) => {
      if (!e.data) return;
      if (e.data.type === 'AIRPLANE_GAME_EXIT') {
        setPlaneGameOpen(false);
      } else if (e.data.type === 'AIRPLANE_GAME_CLAIM') {
        const earnedCoins = Math.max(15, Math.round(Number(e.data.earned || e.data.coins || 25)));
        setPlaneGameOpen(false);

        try {
          const res = await fetch(`${API_BASE}/airplane-claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, earned: earnedCoins })
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
          } else {
            throw new Error(data.message);
          }
        } catch {
          // Offline fallback
          setUser(prev => ({
            ...prev,
            planePlaysToday: (prev.planePlaysToday || 0) + 1,
            planePlaysWindowStart: prev.planePlaysToday === 0 ? Date.now() : prev.planePlaysWindowStart,
            balance: Math.round(prev.balance + earnedCoins),
            totalEarned: Math.round(prev.totalEarned + earnedCoins),
            gamesPlayed: prev.gamesPlayed + 1,
            recentActivity: [
              { 
                id: Date.now().toString(), 
                title: 'Airplane Combat', 
                desc: `Won +${earnedCoins} Duck Coins`, 
                time: 'Just now', 
                type: 'game' 
              },
              ...prev.recentActivity
            ]
          }));
        }

        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        showToast(`🛩️ Combat Rewards: +${earnedCoins} Duck Coins credited!`);
      }
    };
    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, []);

  // Fetch initial user data from server if available
  useEffect(() => {
    // Detect Telegram WebApp
    let currentUserId = "123456789";
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser && tgUser.id) {
        currentUserId = tgUser.id.toString();
        setUser(prev => ({
          ...prev,
          id: currentUserId,
          name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || prev.name,
          username: tgUser.username || prev.username,
          photoUrl: tgUser.photo_url || prev.photoUrl
        }));
      }
    }

    // Ping impression
    fetch(`${API_BASE}/impression`, { method: 'POST' }).catch(() => {});

    // Fetch user details from Neon DB
    fetch(`${API_BASE}/user/${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setUser(prev => ({
            ...prev,
            ...data.data,
            balance: Math.round(data.data.balance || 150),
            totalEarned: Math.round(data.data.totalEarned || 350),
            referralEarnings: data.data.referralEarnings ?? 800,
            referralsCount: data.data.referralsCount ?? 8,
            referralCode: data.data.referralCode || currentUserId,
            botUsername: "adsduckgobot"
          }));
        }
      })
      .catch(err => console.log('Offline/Local standalone mode active'));

    // Fetch leaderboard
    fetch(`${API_BASE}/leaderboard`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.leaderboard && data.leaderboard.length > 0) {
          setLeaderboard(data.leaderboard.map((u, idx) => ({
            id: u.id,
            name: u.name || 'Pilot',
            username: u.username || 'pilot',
            balance: Math.round(u.balance || 0),
            badge: idx === 0 ? '🥇 ACE' : idx === 1 ? '🥈 PRO' : idx === 2 ? '🥉 ELITE' : '🎖️ TOP'
          })));
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Claim Daily Reward (50 Duck Coins)
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
        showToast("🎉 Daily reward of 50 Duck Coins added!");
      } else {
        showToast(data.message);
      }
    } catch {
      // Offline fallback
      setUser(prev => ({
        ...prev,
        balance: prev.balance + 50,
        totalEarned: prev.totalEarned + 50,
        dailyClaimedToday: true,
        recentActivity: [
          { id: Date.now().toString(), title: 'Daily Check-in', desc: 'Claimed +50 Duck Coins', time: 'Just now', type: 'daily' },
          ...prev.recentActivity
        ]
      }));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      showToast("🎉 Daily reward of 50 Duck Coins added!");
    }
  };

  const ADSGRAM_BLOCK_ID = "54502";

  // Watch Ad & Earn with Real Adsgram Integration (Block ID: 54502)
  const startWatchingAd = (task) => {
    if (adCooldownRemaining > 0) {
      showToast(`⏳ Please wait ${adCooldownRemaining}s for next ad watching to prevent spam!`);
      return;
    }
    if (task.completed) {
      showToast("Task already completed today!");
      return;
    }

    // Check if Adsgram SDK is loaded in Telegram Mini App
    if (window.Adsgram) {
      try {
        const AdController = window.Adsgram.init({
          blockId: ADSGRAM_BLOCK_ID,
          debug: false
        });

        AdController.show().then((result) => {
          // User watched the full video ad
          handleFinishAdReward(task);
        }).catch((result) => {
          console.warn("Adsgram notice / fallback:", result);
          // If no ads available yet or still under approval, fallback smoothly to built-in ad player
          setAdModal({ open: true, task, countdown: 5 });
        });
        return;
      } catch (err) {
        console.error("Adsgram init error:", err);
      }
    }

    // Fallback built-in interactive ad player
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

  const handleFinishAd = () => {
    const task = adModal.task;
    setAdModal({ open: false, task: null, countdown: 5 });
    if (task) {
      handleFinishAdReward(task);
    }
  };

  const handleFinishAdReward = async (task) => {
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
        const remainingIncomplete = updatedTasks.filter(t => !t.completed);
        const allCompletedNow = remainingIncomplete.length === 0;

        return {
          ...prev,
          tasks: updatedTasks,
          balance: prev.balance + task.reward,
          totalEarned: prev.totalEarned + task.reward,
          tasksCompleted: prev.tasksCompleted + 1,
          lastAdWatchedAt: Date.now(),
          allTasksCompletedAt: allCompletedNow ? Date.now() : prev.allTasksCompletedAt,
          recentActivity: [
            { id: Date.now().toString(), title: `${task.name} Clip Reward`, desc: `You earned +${task.reward} Duck Coins`, time: 'Just now', type: 'task' },
            ...prev.recentActivity
          ]
        };
      });
    }

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showToast(`🦆 Successfully earned +${task.reward} Duck Coins!`);
  };

  // Play Game Handler
  const handlePlayGame = (type) => {
    setGameModal({ open: true, type, playing: false, result: null });
  };

  const executeGameRound = async () => {
    setGameModal(prev => ({ ...prev, playing: true }));
    setTimeout(async () => {
      const prize = gameModal.type === 'spin' ? 20 : 30;
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
          balance: prev.balance + prize,
          totalEarned: prev.totalEarned + prize,
          gamesPlayed: prev.gamesPlayed + 1,
          recentActivity: [
            { id: Date.now().toString(), title: `${gameModal.type === 'spin' ? 'Lucky Spin' : 'Number Challenge'}`, desc: `Won +${prize} Duck Coins`, time: 'Just now', type: 'game' },
            ...prev.recentActivity
          ]
        }));
      }

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      showToast(`🎯 You won +${prize} Duck Coins!`);
    }, 1500);
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
              <div className="wallet-icon-box" style={{ background: '#f59e0b' }}>
                <Trophy size={18} color="#fff" />
              </div>
              <span className="balance-label">Duck Coin Balance</span>
              
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
                <span>Pilot Cadet</span>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px' }}>
              <div>
                <div className="balance-amount">{Math.round(user.balance).toLocaleString()} <span style={{ fontSize: 18, color: '#fde047' }}>DUCK 🦆</span></div>
                <div className="balance-usdt-approx">Global Rank: #42 • Season 1 Era</div>
              </div>
            </div>
          </div>

          {/* Action Dual Buttons (Leaderboard & Watch Ads) */}
          <div className="hero-dual-actions">
            <button className="action-pill-btn withdraw" onClick={() => setActiveTab('leaderboard')}>
              <div className="action-icon-circle withdraw" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Trophy size={20} />
              </div>
              <div className="action-texts">
                <span className="action-subtext">Global Ranking</span>
                <span className="action-maintext withdraw" style={{ color: '#b45309' }}>Leaderboard</span>
              </div>
            </button>

            <button className="action-pill-btn earning" onClick={() => setActiveTab('tasks')}>
              <div className="action-icon-circle earning">
                <Play size={18} fill="#2563eb" color="#2563eb" />
              </div>
              <div className="action-texts">
                <span className="action-subtext">Watch & Earn</span>
                <span className="action-maintext earning">+10 DUCK Clips</span>
              </div>
            </button>
          </div>

          {/* Games Section */}
          <div className="section-header">
            <span className="section-title">Play Games & Earn More</span>
          </div>

          <div className="games-grid">
            {/* Box 1: Airplane Crash (2 plays per 24 hours) */}
            <div className="game-card lucky-spin" onClick={handleOpenPlaneGame}>
              <div className="game-card-top-row">
                <div>
                  <div className="game-title">Airplane</div>
                  <div className="game-subtitle">Crypto 1945</div>
                </div>
                <div className="game-icon-box green">
                  <Plane size={17} />
                </div>
              </div>

              <div className="game-bottom-pill-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span className="game-badge-pill green">
                  {user.planePlaysToday >= 2 ? 'Limit Reached' : 'Play & Earn'}
                </span>
                <span className="box-timer-counter" style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: user.planePlaysToday >= 2 ? '#f87171' : '#86efac',
                  background: 'rgba(0, 0, 0, 0.65)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Clock size={10} />
                  {user.planePlaysToday >= 2 ? planeTimeRemaining : `${2 - (user.planePlaysToday || 0)}/2 left`}
                </span>
              </div>
            </div>

            {/* Box 2: Daily Challenge Bonus (1 claim per 24 hours, $0.01) */}
            <div className="game-card number-challenge" onClick={handleClaimDaily}>
              {/* Geometric pattern graphic */}
              <div style={{
                position: 'absolute',
                right: -10,
                bottom: -10,
                width: 75,
                height: 75,
                opacity: 0.18,
                pointerEvents: 'none'
              }}>
                <svg width="75" height="75" viewBox="0 0 75 75" fill="none">
                  <circle cx="50" cy="50" r="32" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx="50" cy="50" r="20" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M25 60 L40 40 L52 48 L65 30" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="game-card-top-row">
                <div>
                  <div className="game-title">Daily Bonus</div>
                  <div className="game-subtitle">Tap & Claim</div>
                </div>
                <div className="game-icon-box blue">
                  <Sparkles size={17} />
                </div>
              </div>

              <div className="game-bottom-pill-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span className="game-badge-pill blue">
                  {user.dailyClaimedToday ? '✓ Claimed' : 'Claim $0.01'}
                </span>
                <span className="box-timer-counter" style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: user.dailyClaimedToday ? '#fecdd3' : '#bfdbfe',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Clock size={10} />
                  {user.dailyClaimedToday ? (dailyTimeRemaining || '24:00:00') : '1/1 left'}
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

          {/* Anti-spam cooldown banner if user watched an ad recently */}
          {adCooldownRemaining > 0 && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#b45309',
              fontSize: 13,
              fontWeight: 600
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} /> Wait for next ad watching
              </span>
              <span style={{
                background: '#fef3c7',
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 700
              }}>
                {adCooldownRemaining}s
              </span>
            </div>
          )}

          {/* Active Tasks List (Watched ads are automatically removed) */}
          <div className="tasks-list">
            {user.tasks.filter(t => !t.completed).length === 0 ? (
              /* All Ads Watched - 20h Reset Countdown Screen */
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '36px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px'
                }}>
                  <Check size={28} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                  All Ads Completed!
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, maxWidth: 260, margin: '6px auto 16px' }}>
                  You have watched all available sponsored ads. New ads will appear in:
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '8px 18px',
                  borderRadius: 24,
                  fontSize: 18,
                  fontWeight: 800
                }}>
                  <Clock size={18} />
                  <span>{tasksResetTimeRemaining || '20:00:00'}</span>
                </div>
              </div>
            ) : (
              user.tasks
                .filter(task => !task.completed)
                .map((task, idx) => (
                  <div 
                    key={task.id} 
                    className="task-box-card"
                    onClick={() => startWatchingAd(task)}
                  >
                    {/* Premium Square Box with modern SVG Icon */}
                    <div 
                      className="task-square-box" 
                      style={{ 
                        background: task.color, 
                        color: '#ffffff',
                        boxShadow: `0 3px 8px ${task.color}40`
                      }}
                    >
                      {task.name === 'AdGem' && <Video size={20} />}
                      {task.name === 'BitLabs' && <MonitorPlay size={20} />}
                      {task.name === 'Tapjoy' && <Flame size={20} />}
                      {task.name === 'AdColony' && <Film size={20} />}
                      {task.name === 'Fyber' && <Zap size={20} />}
                      {task.name === 'InMobi' && <PlayCircle size={20} />}
                      {task.name === 'ironSource' && <Tv size={20} />}
                      {task.name === 'Chartboost' && <Trophy size={20} />}
                      {task.name === 'Vungle' && <Clapperboard size={20} />}
                      {task.name === 'Unity Ads' && <Star size={20} />}
                      {!['AdGem','BitLabs','Tapjoy','AdColony','Fyber','InMobi','ironSource','Chartboost','Vungle','Unity Ads'].includes(task.name) && (
                        <Play size={20} />
                      )}
                    </div>

                    <div className="task-content-area">
                      <span className="task-sub-label">Sponsor Video Ad #{task.id}</span>
                      <div className="task-brand-name">{task.name}</div>
                    </div>

                    <div className="task-action-pill-wrap">
                      <div className="task-reward-badge" style={{ color: task.color, fontWeight: 800 }}>
                        +{task.reward} DUCK
                      </div>
                      <button 
                        className="btn-ad-pill"
                        disabled={adCooldownRemaining > 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          startWatchingAd(task);
                        }}
                        style={{
                          background: adCooldownRemaining > 0 ? '#94a3b8' : task.color,
                          color: '#ffffff',
                          opacity: adCooldownRemaining > 0 ? 0.75 : 1
                        }}
                      >
                        {adCooldownRemaining > 0 ? `${adCooldownRemaining}s` : 'Watch'}
                      </button>
                    </div>
                  </div>
                ))
            )}
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
              <span>Recruit Pilots & Earn 100 DUCK Each</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800 }}>+{user.referralEarnings || 800} DUCK 🦆</div>
            <div style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.4' }}>
              When your invited friend joins and plays <b>1 round of Airplane Combat</b>, your referral is activated and <b>100 Duck Coins</b> are instantly credited to your balance!
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
                const shareText = `🦆 Join AdsDuckGo and play Airplane Combat to earn Duck Coins! Use my referral link: ${shareLink}`;
                if (window.Telegram && window.Telegram.WebApp) {
                  window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent('🦆 Play Airplane Combat & earn Duck Coins!')}`);
                } else if (navigator.share) {
                  navigator.share({ title: 'AdsDuckGo Referral', text: shareText, url: shareLink });
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
              Share on Telegram (+100 DUCK 🪙)
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
                <span className="stat-number">{user.referralsCount || 8} cadets</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon withdrawn" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Trophy size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Coins Earned</span>
                <span className="stat-number">+{user.referralEarnings || 800} DUCK</span>
              </div>
            </div>
          </div>

          {/* Referral Benefits */}
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
                <div className="activity-sub">Friend must play at least 1 round of Airplane Combat to activate</div>
              </div>
            </div>

            <div className="activity-item" style={{ border: '1.5px solid #dce4ee', borderRadius: 'var(--radius-lg)' }}>
              <div className="activity-icon task" style={{ background: '#eff6ff', color: '#1e6bf5' }}>
                <Trophy size={20} />
              </div>
              <div className="activity-details">
                <div className="activity-title">3. Instant +100 Duck Coins</div>
                <div className="activity-sub">Upon activation, 100 Duck Coins are instantly added to your balance</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 4: LEADERBOARD ======================= */}
      {activeTab === 'leaderboard' && (
        <div className="main-view">
          <div className="leaderboard-header">
            <div className="leaderboard-title">
              <Trophy size={24} color="#f59e0b" />
              <span>Pilot Leaderboard</span>
            </div>
            <div className="bell-btn" onClick={() => showToast("Rankings update in real-time!")}>
              <Award size={18} color="#2563eb" />
            </div>
          </div>

          {/* User's Current Standing Card */}
          <div className="leaderboard-hero-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Your Pilot Standing
              </span>
              <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                Season 1 Active
              </span>
            </div>

            <div className="leaderboard-user-row">
              <img 
                src={user.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
                alt="Pilot Avatar" 
                className="leaderboard-avatar"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{user.name}</div>
                <div style={{ fontSize: 12, color: '#bfdbfe' }}>@{user.username || 'pilot'} • Cadet Rank</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fde047' }}>
                  {Math.round(user.balance).toLocaleString()} <span style={{ fontSize: 13 }}>DUCK</span>
                </div>
                <div style={{ fontSize: 11, color: '#bfdbfe' }}>Rank #42 Worldwide</div>
              </div>
            </div>
          </div>

          {/* Season 1 Rewards Pool Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1.5px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#92400e' }}>Season 1 Pilot Airdrop Pool 🚀</div>
              <div style={{ fontSize: 11, color: '#b45309', marginTop: 2, lineHeight: 1.4 }}>
                Play Airplane Combat & collect Duck Coins to climb the leaderboard! Top 1,000 pilots qualify for exclusive in-game badges and seasonal tier rewards.
              </div>
            </div>
          </div>

          {/* Leaderboard Rankings List */}
          <div className="section-header" style={{ marginTop: 16 }}>
            <span className="section-title">Top Ace Pilots</span>
          </div>

          <div className="leaderboard-list">
            {leaderboard.map((pilot, idx) => (
              <div key={pilot.id || idx} className="leaderboard-item">
                <div className={`leaderboard-rank-badge ${idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : 'other'}`}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </div>
                <div className="leaderboard-user-info">
                  <div className="leaderboard-username">
                    {pilot.name || pilot.username}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {pilot.badge || 'Ace Pilot'}
                  </div>
                </div>
                <div className="leaderboard-coins">
                  <span>{pilot.balance?.toLocaleString()}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>DUCK 🦆</span>
                </div>
              </div>
            ))}
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
          className={`nav-tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy size={20} />
          <span>Rank</span>
        </button>
      </div>

      {/* ======================= MODAL: AD PLAYER ======================= */}
      {adModal.open && (
        <div className="modal-overlay">
          <div className="modal-sheet">
            <button className="modal-close-btn" onClick={() => setAdModal({ open: false, task: null, countdown: 5 })}>
              <X size={16} />
            </button>

            <div className="modal-title">Watching Sponsor Clip</div>

            <div className="modal-ad-player">
              <span className="ad-countdown-pill">
                <Clock size={12} /> {adModal.countdown}s
              </span>
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <Sparkles size={36} color="#f59e0b" style={{ marginBottom: 10 }} />
                <div style={{ fontWeight: 800, fontSize: 16 }}>{adModal.task?.name} Video Clip</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  Stay on this screen to claim your +{adModal.task?.reward || 10} Duck Coins
                </div>
              </div>
            </div>

            {adModal.countdown === 0 ? (
              <button className="btn-primary-action" onClick={handleFinishAd}>
                Claim +{adModal.task?.reward || 10} Duck Coins
              </button>
            ) : (
              <button className="btn-primary-action" disabled style={{ background: '#94a3b8' }}>
                Reward available in {adModal.countdown}s...
              </button>
            )}
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
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Daily Check-in Reward</div>
                  <div style={{ fontSize: '11px', color: '#c2410c', fontWeight: 600 }}>Claim your daily 50 Duck Coins</div>
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
                {user.dailyClaimedToday ? 'Claimed' : 'Claim 50 DUCK'}
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
                    Won +{gameModal.result} Duck Coins!
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Added directly to your balance</div>
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
