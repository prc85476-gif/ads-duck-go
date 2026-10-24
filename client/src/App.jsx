import React, { useState, useEffect, useRef } from 'react';
import { 
  Plane, 
  Crosshair,
  Target,
  Shield, 
  ShieldCheck, 
  Zap, 
  Flame, 
  Trophy, 
  Award, 
  Users, 
  Gift, 
  Clock, 
  Bell, 
  Check, 
  Copy, 
  X, 
  Sparkles, 
  Play, 
  Radio, 
  RotateCcw,
  Compass,
  ArrowRight,
  Info,
  ChevronRight,
  HelpCircle,
  LogOut,
  Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://localhost:5000/api'
  : '/api';

const ADSGRAM_BLOCK_ID = "55687";

function generateInitialFlightMissions() {
  const baseMissions = [
    { id: 1, name: "Operation Skywatch", code: "OP-01", desc: "High-altitude radar reconnaissance patrol", reward: 15, xp: 50, color: "#1e6bf5", icon: "radar" },
    { id: 2, name: "Operation Dogfight", code: "OP-02", desc: "Intercept enemy scout fighter squadron", reward: 20, xp: 75, color: "#ef4444", icon: "plane" },
    { id: 3, name: "Operation Sidewinder", code: "OP-03", desc: "Calibrate heat-seeking AIM-9 missiles", reward: 20, xp: 75, color: "#f97316", icon: "target" },
    { id: 4, name: "Operation Iron Carrier", code: "OP-04", desc: "Naval carrier battle fleet air defense drill", reward: 25, xp: 100, color: "#0ea5e9", icon: "shield" },
    { id: 5, name: "Operation Mach 3", code: "OP-05", desc: "Supersonic altitude interceptor training", reward: 25, xp: 100, color: "#8b5cf6", icon: "zap" },
    { id: 6, name: "Operation Fortress Escort", code: "OP-06", desc: "Heavy B-29 strategic bomber air escort", reward: 30, xp: 120, color: "#10b981", icon: "shield" },
    { id: 7, name: "Operation Citadel Strike", code: "OP-07", desc: "Precision coastal bunker tactical raid", reward: 30, xp: 120, color: "#e11d48", icon: "flame" },
    { id: 8, name: "Operation Top Gun Elite", code: "OP-08", desc: "Master aerobatics dogfight qualification", reward: 35, xp: 150, color: "#f59e0b", icon: "trophy" }
  ];

  return baseMissions.map((m) => ({
    id: m.id,
    name: m.name,
    code: m.code,
    desc: m.desc,
    reward: m.reward,
    xp: m.xp,
    completed: false,
    tag: "Ready",
    color: m.color,
    icon: m.icon
  }));
}

export default function App() {
  const [activeTab, setActiveTab] = useState('hangar'); // 'hangar' | 'missions' | 'squadron' | 'leaderboard'
  const iframeRef = useRef(null);

  // User State
  const [user, setUser] = useState({
    id: "123456789",
    name: "Capt. Rakib",
    username: "rakib_ace",
    verified: true,
    balance: 250,
    totalEarned: 520,
    tasksCompleted: 0,
    gamesPlayed: 5,
    fuel: 100, // 0 - 100%
    dailyClaimedToday: false,
    lastDailyClaim: null,
    referralsCount: 8,
    referralEarnings: 800,
    referralCode: "123456789",
    botUsername: "adsduckgobot",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    recentActivity: [
      { id: '1', title: 'Air Combat Sortie', desc: 'Won +35 Duck Coins in Pacific Sector', time: '1h ago', type: 'game' },
      { id: '2', title: 'Operation Skywatch', desc: 'Completed flight intel reconnaissance', time: '3h ago', type: 'task' }
    ],
    tasks: generateInitialFlightMissions()
  });

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState([
    { id: '1', name: 'CyberDuck_99', username: 'cyber_duck', balance: 14250, badge: '🥇 SUPREME ACE' },
    { id: '2', name: 'SkyMaster_Pro', username: 'skymaster', balance: 11800, badge: '🥈 COMMANDER' },
    { id: '3', name: 'CryptoAviator', username: 'aviator77', balance: 9400, badge: '🥉 ELITE PILOT' },
    { id: '4', name: 'DuckVader', username: 'duckvader', balance: 7650, badge: '🎖️ CAPTAIN' },
    { id: '5', name: 'TonFighter', username: 'tonfighter', balance: 6200, badge: '🎖️ LIEUTENANT' },
    { id: '6', name: 'FlightOfficer', username: 'flightoff', balance: 5100, badge: '🎖️ WINGMAN' },
    { id: '7', name: 'AeroBlast', username: 'aeroblast', balance: 4350, badge: '🎖️ PILOT' }
  ]);

  // Modals & Timers
  const [adModal, setAdModal] = useState({ open: false, title: '', reward: 10, countdown: 5, onFinish: null });
  const [spinModal, setSpinModal] = useState({ open: false, spinning: false, result: null });
  const [toastMessage, setToastMessage] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);
  const [planeGameOpen, setPlaneGameOpen] = useState(false);

  // Live Countdowns
  const [dailyTimeRemaining, setDailyTimeRemaining] = useState('');
  const [radioCooldownRemaining, setRadioCooldownRemaining] = useState(0); // 10s cooldown
  const [missionsResetRemaining, setMissionsResetRemaining] = useState('');

  // 1-second interval for live countdowns
  useEffect(() => {
    const updateCountdowns = () => {
      const now = Date.now();
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      const TWENTY_HOURS = 20 * 60 * 60 * 1000;

      // 10s Radio Transmission cooldown
      if (user.lastAdWatchedAt) {
        const elapsed = now - user.lastAdWatchedAt;
        const diff = 10000 - elapsed;
        setRadioCooldownRemaining(diff > 0 ? Math.ceil(diff / 1000) : 0);
      } else {
        setRadioCooldownRemaining(0);
      }

      // 20-Hours Missions Reset timer
      if (user.allTasksCompletedAt) {
        const elapsed = now - user.allTasksCompletedAt;
        const diff = TWENTY_HOURS - elapsed;
        if (diff > 0) {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setMissionsResetRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        } else {
          setMissionsResetRemaining('');
          setUser(prev => ({
            ...prev,
            tasks: generateInitialFlightMissions(),
            tasksCompleted: 0,
            allTasksCompletedAt: null
          }));
        }
      } else {
        setMissionsResetRemaining('');
      }

      // Daily Claim timer
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
  }, [user.lastDailyClaim, user.dailyClaimedToday, user.lastAdWatchedAt, user.allTasksCompletedAt]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Launch the 3D Airplane Game
  const handleLaunchCombat = () => {
    setPlaneGameOpen(true);
  };

  // Adsgram Helper Execution
  const triggerAdsgramRewardedAd = (onSuccess, fallbackInfo = { title: "Tactical Flight Briefing", reward: 20 }) => {
    if (radioCooldownRemaining > 0) {
      showToast(`📡 Radio frequency busy: Please wait ${radioCooldownRemaining}s!`);
      return;
    }

    if (window.Adsgram) {
      try {
        const AdController = window.Adsgram.init({
          blockId: ADSGRAM_BLOCK_ID,
          debug: false
        });

        AdController.show().then(() => {
          onSuccess();
        }).catch((err) => {
          console.warn("Adsgram network notice, opening fallback briefing:", err);
          setAdModal({
            open: true,
            title: fallbackInfo.title,
            reward: fallbackInfo.reward,
            countdown: 5,
            onFinish: onSuccess
          });
        });
        return;
      } catch (err) {
        console.error("Adsgram init error:", err);
      }
    }

    // Built-in interactive flight briefing modal
    setAdModal({
      open: true,
      title: fallbackInfo.title,
      reward: fallbackInfo.reward,
      countdown: 5,
      onFinish: onSuccess
    });
  };

  // Listen to messages from Airplane Combat Game iframe
  useEffect(() => {
    const handleGameMessage = async (e) => {
      if (!e.data) return;

      if (e.data.type === 'AIRPLANE_GAME_EXIT') {
        setPlaneGameOpen(false);
      } 
      else if (e.data.type === 'AIRPLANE_GAME_CLAIM') {
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
          // Local offline fallback
          setUser(prev => ({
            ...prev,
            balance: prev.balance + earnedCoins,
            totalEarned: prev.totalEarned + earnedCoins,
            gamesPlayed: prev.gamesPlayed + 1,
            recentActivity: [
              { 
                id: Date.now().toString(), 
                title: 'Air Combat Victory', 
                desc: `Combat Sortie Loot: +${earnedCoins} Duck Coins`, 
                time: 'Just now', 
                type: 'game' 
              },
              ...prev.recentActivity
            ]
          }));
        }

        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        showToast(`🛩️ Combat Sortie Complete: +${earnedCoins} Duck Coins credited!`);
      }
      else if (e.data.type === 'ADSGRAM_TRIGGER_AD') {
        // In-game rewarded action (Emergency Revive or 2X Loot)
        const action = e.data.action;
        triggerAdsgramRewardedAd(() => {
          // Send success message to iframe
          if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'ADSGRAM_AD_SUCCESS', action }, '*');
          }
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
          showToast(action === 'REVIVE_PLANE' ? "⚡ Fighter Jet Revived!" : "🎬 2X Combat Rewards Activated!");
        }, {
          title: action === 'REVIVE_PLANE' ? "Emergency Pilot Revive Briefing" : "2X Combat Intel Transmission",
          reward: 20
        });
      }
    };

    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, [user.id, radioCooldownRemaining]);

  // Initial Data Fetch
  useEffect(() => {
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

    // Fetch user details
    fetch(`${API_BASE}/user/${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setUser(prev => ({
            ...prev,
            ...data.data,
            balance: Math.round(data.data.balance || 250),
            totalEarned: Math.round(data.data.totalEarned || 520),
            referralEarnings: data.data.referralEarnings ?? 800,
            referralsCount: data.data.referralsCount ?? 8,
            referralCode: data.data.referralCode || currentUserId,
            botUsername: "adsduckgobot"
          }));
        }
      })
      .catch(() => console.log('Offline/Local standalone mode active'));

    // Fetch leaderboard
    fetch(`${API_BASE}/leaderboard`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.leaderboard && data.leaderboard.length > 0) {
          setLeaderboard(data.leaderboard.map((u, idx) => ({
            id: u.id,
            name: u.name || 'Flight Ace',
            username: u.username || 'pilot',
            balance: Math.round(u.balance || 0),
            badge: idx === 0 ? '🥇 SUPREME ACE' : idx === 1 ? '🥈 COMMANDER' : idx === 2 ? '🥉 ELITE PILOT' : '🎖️ ACE'
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Claim Daily Supply Crate (+50 Duck Coins)
  const handleClaimDailySupply = async () => {
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
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        showToast("📦 Daily Supply Crate claimed: +50 Duck Coins!");
      } else {
        showToast(data.message);
      }
    } catch {
      setUser(prev => ({
        ...prev,
        balance: prev.balance + 50,
        totalEarned: prev.totalEarned + 50,
        dailyClaimedToday: true,
        recentActivity: [
          { id: Date.now().toString(), title: 'Daily Supply Drop', desc: 'Claimed +50 Duck Coins', time: 'Just now', type: 'daily' },
          ...prev.recentActivity
        ]
      }));
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      showToast("📦 Daily Supply Crate claimed: +50 Duck Coins!");
    }
  };

  // Tactical Hangar Boosts (Refuel / Armor Reinforcement via Adsgram)
  const handleTacticalBoost = (boostType) => {
    const isRefuel = boostType === 'refuel';
    const boostTitle = isRefuel ? "Tactical Jet Refuel Briefing" : "Armor Plating Calibration";
    const boostCoins = 25;

    triggerAdsgramRewardedAd(async () => {
      setUser(prev => ({
        ...prev,
        balance: prev.balance + boostCoins,
        totalEarned: prev.totalEarned + boostCoins,
        fuel: 100,
        lastAdWatchedAt: Date.now(),
        recentActivity: [
          { 
            id: Date.now().toString(), 
            title: isRefuel ? 'Afterburner Refueled' : 'Armor Plating Boosted', 
            desc: `+${boostCoins} Duck Coins & 100% Combat Readiness`, 
            time: 'Just now', 
            type: 'task' 
          },
          ...prev.recentActivity
        ]
      }));
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      showToast(`✈️ ${isRefuel ? 'Refueled 100%' : 'Armor Reinforced'}: +${boostCoins} Duck Coins credited!`);
    }, {
      title: boostTitle,
      reward: boostCoins
    });
  };

  // Execute Flight Mission Briefing (Adsgram Rewarded Ad)
  const handleStartMission = (mission) => {
    if (radioCooldownRemaining > 0) {
      showToast(`📡 Radio cooldown active: Wait ${radioCooldownRemaining}s!`);
      return;
    }
    if (mission.completed) {
      showToast("Operation completed for this tactical cycle!");
      return;
    }

    triggerAdsgramRewardedAd(async () => {
      try {
        const res = await fetch(`${API_BASE}/complete-task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, taskId: mission.id })
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          throw new Error(data.message);
        }
      } catch {
        // Fallback local update
        setUser(prev => {
          const updatedMissions = prev.tasks.map(m => m.id === mission.id ? { ...m, completed: true, tag: "Completed" } : m);
          const remaining = updatedMissions.filter(m => !m.completed);
          const allDone = remaining.length === 0;

          return {
            ...prev,
            tasks: updatedMissions,
            balance: prev.balance + mission.reward,
            totalEarned: prev.totalEarned + mission.reward,
            tasksCompleted: prev.tasksCompleted + 1,
            lastAdWatchedAt: Date.now(),
            allTasksCompletedAt: allDone ? Date.now() : prev.allTasksCompletedAt,
            recentActivity: [
              { 
                id: Date.now().toString(), 
                title: `${mission.name} Briefing`, 
                desc: `Completed tactical brief: +${mission.reward} Duck Coins`, 
                time: 'Just now', 
                type: 'task' 
              },
              ...prev.recentActivity
            ]
          };
        });
      }

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      showToast(`🎯 ${mission.name} Complete: +${mission.reward} Duck Coins!`);
    }, {
      title: `${mission.name} Tactical Intel Briefing`,
      reward: mission.reward
    });
  };

  // Lucky Tactical Radar Spin
  const executeRadarSpin = () => {
    setSpinModal(prev => ({ ...prev, spinning: true }));
    setTimeout(() => {
      const prize = 20;
      setSpinModal({ open: true, spinning: false, result: prize });
      setUser(prev => ({
        ...prev,
        balance: prev.balance + prize,
        totalEarned: prev.totalEarned + prize,
        recentActivity: [
          { id: Date.now().toString(), title: 'Radar Recon Bounty', desc: `Won +${prize} Duck Coins`, time: 'Just now', type: 'game' },
          ...prev.recentActivity
        ]
      }));
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
      showToast(`📡 Radar detected enemy cache: +${prize} Duck Coins!`);
    }, 1500);
  };

  // Fallback ad countdown
  useEffect(() => {
    let timer;
    if (adModal.open && adModal.countdown > 0) {
      timer = setTimeout(() => {
        setAdModal(prev => ({ ...prev, countdown: prev.countdown - 1 }));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [adModal.open, adModal.countdown]);

  const handleFinishAdModal = () => {
    const finishCallback = adModal.onFinish;
    setAdModal({ open: false, title: '', reward: 0, countdown: 5, onFinish: null });
    if (finishCallback) {
      finishCallback();
    }
  };

  // Top Bar for Hangar View
  const renderTopBar = () => (
    <div className="top-nav">
      <div className="brand-section">
        <div style={{ position: 'relative' }}>
          <img 
            src={user.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
            alt="Pilot Avatar" 
            className="user-avatar-mini"
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px',
              border: '2px solid #0284c7',
              objectFit: 'cover'
            }}
            onClick={() => showToast(`Pilot: ${user.name} | Call-sign: @${user.username}`)}
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="brand-title" style={{ fontSize: 17 }}>Duck Aviator</span>
            <ShieldCheck size={15} color="#0284c7" />
          </div>
          <div className="brand-tagline" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
            <span style={{ color: '#0284c7', fontWeight: 800 }}>SQUADRON 77</span>
            <span>• Rank #42</span>
          </div>
        </div>
      </div>

      <div className="top-actions">
        <div className="bell-btn" onClick={() => showToast("All flight systems nominal")}>
          <Bell size={18} />
          <span className="bell-badge">1</span>
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

      {/* Top Bar on Hangar */}
      {activeTab === 'hangar' && renderTopBar()}

      {/* ======================= TAB 1: HANGAR (Flight Deck) ======================= */}
      {activeTab === 'hangar' && (
        <div className="main-view">
          {/* Main Pilot Stats & Balance Card */}
          <div className="balance-hero-card" style={{ cursor: 'default', position: 'relative', overflow: 'hidden' }}>
            <div className="balance-card-header" style={{ position: 'relative', zIndex: 2 }}>
              <div className="wallet-icon-box" style={{ background: '#f59e0b' }}>
                <Trophy size={18} color="#fff" />
              </div>
              <span className="balance-label">Combat Duck Coins</span>
              
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
                <span>Flight Ace</span>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px' }}>
              <div>
                <div className="balance-amount">{Math.round(user.balance).toLocaleString()} <span style={{ fontSize: 18, color: '#fde047' }}>DUCK 🦆</span></div>
                <div className="balance-usdt-approx">Combat Missions Flown: {user.gamesPlayed} • Season 1</div>
              </div>
            </div>
          </div>

          {/* Featured Fighter Aircraft Showcase & Launch Mission */}
          <div className="hangar-hero-card">
            <div className="hangar-grid-bg"></div>

            <div className="hangar-header-row">
              <span className="squadron-tag">
                <Shield size={12} /> F-15EX Strike Eagle
              </span>
              <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700 }}>
                COMBAT READY
              </span>
            </div>

            {/* Fighter Aircraft Visual Illustration */}
            <div className="jet-display-area">
              <div style={{ position: 'relative', width: '130px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Modern Aviation Fighter Jet Graphic */}
                <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Afterburner Thruster Glow */}
                  <circle cx="60" cy="85" r="14" fill="#38bdf8" opacity="0.35" filter="blur(8px)" />
                  <ellipse cx="60" cy="88" rx="8" ry="4" fill="#67e8f9" />
                  
                  {/* Delta Wings */}
                  <path d="M60 10 L85 55 L115 72 L76 72 L60 88 L44 72 L5 72 L35 55 Z" fill="#334155" stroke="#64748b" strokeWidth="2" strokeLinejoin="round" />
                  
                  {/* Fuselage & Cockpit */}
                  <path d="M60 5 L68 35 L68 78 L60 88 L52 78 L52 35 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                  
                  {/* Cockpit Canopy Glass */}
                  <ellipse cx="60" cy="38" rx="4.5" ry="12" fill="#38bdf8" opacity="0.85" />
                  
                  {/* Twin Vertical Stabilizers */}
                  <path d="M52 68 L42 82 L48 85 L54 74 Z" fill="#0ea5e9" />
                  <path d="M68 68 L78 82 L72 85 L66 74 Z" fill="#0ea5e9" />
                </svg>
              </div>

              <div className="jet-model-title">FIGHTER COCKPIT 1945</div>
              <div className="jet-model-class">Supersonic Carrier Air Interceptor</div>
            </div>

            {/* Jet Specifications Grid */}
            <div className="specs-grid">
              <div className="spec-cell">
                <div className="spec-cell-label"><Crosshair size={11} color="#f87171" /> FIREPOWER</div>
                <div className="spec-cell-val" style={{ color: '#f87171' }}>940 DPS</div>
              </div>
              <div className="spec-cell">
                <div className="spec-cell-label"><Shield size={11} color="#38bdf8" /> ARMOR</div>
                <div className="spec-cell-val" style={{ color: '#38bdf8' }}>860 HP</div>
              </div>
              <div className="spec-cell">
                <div className="spec-cell-label"><Zap size={11} color="#facc15" /> SPEED</div>
                <div className="spec-cell-val" style={{ color: '#facc15' }}>Mach 2.2</div>
              </div>
            </div>

            {/* Launch Air Combat Button */}
            <button className="btn-launch-sortie" onClick={handleLaunchCombat}>
              <Play size={18} fill="#ffffff" />
              <span>LAUNCH AIR COMBAT SORTIE</span>
            </button>
          </div>

          {/* Tactical Maintenance & Upgrades (Adsgram Integration) */}
          <div className="section-header">
            <span className="section-title">Tactical Readiness & Boosts</span>
          </div>

          <div className="tactical-boost-grid">
            {/* Boost 1: Tactical Refuel (Adsgram Rewarded) */}
            <div className="tactical-boost-card refuel" onClick={() => handleTacticalBoost('refuel')}>
              <div>
                <div className="boost-card-top">
                  <div className="boost-icon-box" style={{ background: '#f97316' }}>
                    <Flame size={18} />
                  </div>
                  <div className="boost-card-title">Refuel Jet</div>
                </div>
                <div className="boost-card-sub">
                  Briefing grants 100% afterburner fuel & combat bounty.
                </div>
              </div>
              <div className="boost-card-badge" style={{ background: '#ffedd5', color: '#c2410c' }}>
                <Sparkles size={11} /> +25 DUCK 🪙
              </div>
            </div>

            {/* Boost 2: Armor Reinforcement (Adsgram Rewarded) */}
            <div className="tactical-boost-card shield" onClick={() => handleTacticalBoost('armor')}>
              <div>
                <div className="boost-card-top">
                  <div className="boost-icon-box" style={{ background: '#0284c7' }}>
                    <Shield size={18} />
                  </div>
                  <div className="boost-card-title">Reinforce Hull</div>
                </div>
                <div className="boost-card-sub">
                  Briefing grants reinforced shield armor plating.
                </div>
              </div>
              <div className="boost-card-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                <Sparkles size={11} /> +25 DUCK 🪙
              </div>
            </div>
          </div>

          {/* Quick Dual Cards: Daily Supply Drop & Lucky Radar */}
          <div className="games-grid" style={{ marginBottom: 16 }}>
            {/* Daily Supply Drop */}
            <div className="game-card lucky-spin" onClick={handleClaimDailySupply} style={{ background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)' }}>
              <div className="game-card-top-row">
                <div>
                  <div className="game-title">Daily Supply</div>
                  <div className="game-subtitle">Airdrop Crate</div>
                </div>
                <div className="game-icon-box" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Gift size={17} color="#fff" />
                </div>
              </div>
              <div className="game-bottom-pill-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span className="game-badge-pill" style={{ background: 'rgba(0,0,0,0.25)', color: '#fff' }}>
                  {user.dailyClaimedToday ? '✓ Claimed' : 'Claim +50 DUCK'}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#d1fae5', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={10} />
                  {user.dailyClaimedToday ? (dailyTimeRemaining || '24:00:00') : 'Ready'}
                </span>
              </div>
            </div>

            {/* Lucky Radar Recon */}
            <div className="game-card number-challenge" onClick={() => setSpinModal({ open: true, spinning: false, result: null })}>
              <div className="game-card-top-row">
                <div>
                  <div className="game-title">Radar Recon</div>
                  <div className="game-subtitle">Scan & Win</div>
                </div>
                <div className="game-icon-box blue">
                  <Compass size={17} />
                </div>
              </div>
              <div className="game-bottom-pill-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span className="game-badge-pill blue">Scan Radar</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#bfdbfe', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Sparkles size={10} /> +20 DUCK
                </span>
              </div>
            </div>
          </div>

          {/* Recent Combat Sortie Activity */}
          <div className="section-header">
            <span className="section-title">Recent Sortie Log</span>
            <span className="section-link" onClick={() => setActiveTab('missions')}>All Operations</span>
          </div>

          <div className="activity-list">
            {user.recentActivity.slice(0, 3).map(act => (
              <div key={act.id} className="activity-item">
                <div className={`activity-icon ${act.type}`}>
                  {act.type === 'game' ? <Plane size={20} /> : <Target size={20} />}
                </div>
                <div className="activity-details">
                  <div className="activity-title">{act.title}</div>
                  <div className="activity-sub">{act.desc}</div>
                </div>
                <div className="activity-right-col">
                  <span className="activity-amount-large" style={{ color: '#0284c7' }}>+Duck Coins</span>
                  <span className="activity-time">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: MISSIONS (Tactical Flight Operations) ======================= */}
      {activeTab === 'missions' && (
        <div className="main-view">
          <div className="tasks-header">
            <div className="header-back-title" onClick={() => setActiveTab('hangar')}>
              <span>‹</span> Flight Operations
            </div>
          </div>

          {/* Operations Progress Banner */}
          <div className="tasks-banner" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
            <div>
              <div className="tasks-banner-title" style={{ color: '#fff' }}>Tactical Flight Operations</div>
              <div className="tasks-banner-sub" style={{ color: '#94a3b8' }}>Complete flight intelligence briefings for Squadron XP & Duck Coins</div>
            </div>

            <div className="progress-row">
              <div className="progress-bar-bg" style={{ background: '#334155' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${(user.tasksCompleted / user.tasks.length) * 100}%`,
                    background: 'linear-gradient(90deg, #38bdf8, #22c55e)'
                  }}
                ></div>
              </div>
              <span className="progress-count" style={{ color: '#38bdf8' }}>{user.tasksCompleted}/{user.tasks.length} Completed</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="task-stats-bar">
            <div className="task-stat-item">
              <span className="task-stat-label">Total Ops</span>
              <span className="task-stat-num">{user.tasks.length}</span>
            </div>
            <div className="task-stat-item">
              <span className="task-stat-label">Accomplished</span>
              <span className="task-stat-num" style={{ color: '#16a34a' }}>{user.tasksCompleted}</span>
            </div>
            <div className="task-stat-item">
              <span className="task-stat-label">Pending</span>
              <span className="task-stat-num" style={{ color: '#f59e0b' }}>{user.tasks.length - user.tasksCompleted}</span>
            </div>
          </div>

          {/* Radio Cooldown Notice */}
          {radioCooldownRemaining > 0 && (
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
                <Radio size={16} /> Radio Frequency Cooldown
              </span>
              <span style={{
                background: '#fef3c7',
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 700
              }}>
                {radioCooldownRemaining}s
              </span>
            </div>
          )}

          {/* Operations List */}
          <div className="tasks-list">
            {user.tasks.filter(m => !m.completed).length === 0 ? (
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
                  All Flight Operations Accomplished!
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, maxWidth: 260, margin: '6px auto 16px' }}>
                  You have cleared all tactical operations for this flight cycle. New mission directives deploy in:
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
                  <span>{missionsResetRemaining || '20:00:00'}</span>
                </div>
              </div>
            ) : (
              user.tasks
                .filter(mission => !mission.completed)
                .map((mission) => (
                  <div 
                    key={mission.id} 
                    className="flight-mission-card"
                    onClick={() => handleStartMission(mission)}
                  >
                    <div 
                      style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: 12, 
                        background: mission.color, 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 3px 8px ${mission.color}40`
                      }}
                    >
                      {mission.id === 1 && <Radio size={20} />}
                      {mission.id === 2 && <Plane size={20} />}
                      {mission.id === 3 && <Target size={20} />}
                      {mission.id === 4 && <Shield size={20} />}
                      {mission.id === 5 && <Zap size={20} />}
                      {mission.id === 6 && <ShieldCheck size={20} />}
                      {mission.id === 7 && <Flame size={20} />}
                      {mission.id === 8 && <Trophy size={20} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="mission-title-text">
                        <span className="mission-code-badge" style={{ background: `${mission.color}20`, color: mission.color }}>
                          {mission.code}
                        </span>
                        <span>{mission.name}</span>
                      </div>
                      <div className="mission-desc-text">
                        {mission.desc}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="mission-reward-pill" style={{ color: mission.color }}>
                        +{mission.reward} DUCK
                      </div>
                      <button 
                        className="btn-briefing-pill"
                        disabled={radioCooldownRemaining > 0}
                        style={{
                          background: radioCooldownRemaining > 0 ? '#94a3b8' : mission.color,
                          opacity: radioCooldownRemaining > 0 ? 0.75 : 1
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartMission(mission);
                        }}
                      >
                        {radioCooldownRemaining > 0 ? `${radioCooldownRemaining}s` : 'Briefing'}
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: SQUADRON (Wingmen / Referrals) ======================= */}
      {activeTab === 'squadron' && (
        <div className="main-view">
          <div className="wallet-header">
            <div className="wallet-title">
              <Users size={22} color="#0284c7" />
              <span>Wingmen Squadron</span>
            </div>
            <div className="bell-btn" onClick={() => showToast("Recruit wingmen pilots to earn +100 DUCK per combat recruit!")}>
              <Info size={18} />
            </div>
          </div>

          {/* Squadron Recruitment Hero Card */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '22px 20px',
            color: '#ffffff',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
              <Users size={18} color="#38bdf8" />
              <span>Recruit Fighter Pilots & Earn 100 DUCK</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffd700' }}>+{user.referralEarnings || 800} DUCK 🦆</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
              When your recruited wingman joins via your link and flies <b>1 combat air sortie</b>, your bounty activates and <b>100 Duck Coins</b> are credited to your flight balance!
            </div>
          </div>

          {/* Referral Link Card */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #dce4ee',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: 12,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Combat Bot</span>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 700, 
                color: '#0284c7', 
                background: '#e0f2fe', 
                padding: '3px 8px', 
                borderRadius: '6px' 
              }}>
                @{user.botUsername}
              </span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Your Squadron Recruit Link
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
                  showToast("📋 Wingman invite link copied!");
                  setTimeout(() => setReferralCopied(false), 2000);
                }}
                style={{
                  background: referralCopied ? '#10b981' : '#0284c7',
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
                const shareText = `🦆 Join Duck Aviator 1945 and fly Air Combat Sorties to earn Duck Coins! Use my pilot recruit link: ${shareLink}`;
                if (window.Telegram && window.Telegram.WebApp) {
                  window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent('🦆 Fly Air Combat Sorties & earn Duck Coins in Duck Aviator 1945!')}`);
                } else if (navigator.share) {
                  navigator.share({ title: 'Duck Aviator Recruit', text: shareText, url: shareLink });
                } else {
                  navigator.clipboard?.writeText(shareText);
                  showToast("📋 Wingman recruit text copied!");
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
              Recruit Wingmen on Telegram (+100 DUCK 🪙)
            </button>
          </div>

          {/* Squadron Statistics */}
          <div className="section-header" style={{ marginTop: 16 }}>
            <span className="section-title">Squadron Intelligence</span>
          </div>

          <div className="quick-stats-grid">
            <div className="stat-card">
              <div className="stat-icon earned">
                <Users size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Active Wingmen</span>
                <span className="stat-number">{user.referralsCount || 8} pilots</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon withdrawn" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Trophy size={18} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Bounty Coins</span>
                <span className="stat-number">+{user.referralEarnings || 800} DUCK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 4: LEADERBOARD (Hall of Fame) ======================= */}
      {activeTab === 'leaderboard' && (
        <div className="main-view">
          <div className="leaderboard-header">
            <div className="leaderboard-title">
              <Trophy size={24} color="#f59e0b" />
              <span>Worldwide Ace Pilots</span>
            </div>
            <div className="bell-btn" onClick={() => showToast("Rankings update in real-time!")}>
              <Award size={18} color="#0284c7" />
            </div>
          </div>

          {/* Player Standing Card */}
          <div className="leaderboard-hero-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Your Pilot Standing
              </span>
              <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                Season 1 Active
              </span>
            </div>

            <div className="leaderboard-user-row">
              <img 
                src={user.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
                alt="Pilot Avatar" 
                className="leaderboard-avatar"
                style={{ border: '2px solid #38bdf8' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{user.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>@{user.username || 'pilot'} • Flight Ace</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fde047' }}>
                  {Math.round(user.balance).toLocaleString()} <span style={{ fontSize: 13 }}>DUCK</span>
                </div>
                <div style={{ fontSize: 11, color: '#38bdf8' }}>Rank #42 Worldwide</div>
              </div>
            </div>
          </div>

          {/* Season 1 Tournament Pool */}
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
              <div style={{ fontSize: 13, fontWeight: 800, color: '#92400e' }}>Season 1 Pilot Airdrop Tournament 🚀</div>
              <div style={{ fontSize: 11, color: '#b45309', marginTop: 2, lineHeight: 1.4 }}>
                Fly Air Combat Sorties & complete operations to ascend the Hall of Fame. Top 1,000 pilots qualify for exclusive season token airdrops!
              </div>
            </div>
          </div>

          {/* Leaderboard Rankings List */}
          <div className="section-header" style={{ marginTop: 16 }}>
            <span className="section-title">Hall of Fame Standings</span>
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
          className={`nav-tab-btn ${activeTab === 'hangar' ? 'active' : ''}`}
          onClick={() => setActiveTab('hangar')}
        >
          <Plane size={20} />
          <span>Hangar</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'missions' ? 'active' : ''}`}
          onClick={() => setActiveTab('missions')}
        >
          <Target size={20} />
          <span>Missions</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'squadron' ? 'active' : ''}`}
          onClick={() => setActiveTab('squadron')}
        >
          <Users size={20} />
          <span>Squadron</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy size={20} />
          <span>Ranks</span>
        </button>
      </div>

      {/* ======================= MODAL: FLIGHT BRIEFING PLAYER ======================= */}
      {adModal.open && (
        <div className="modal-overlay">
          <div className="modal-sheet">
            <button className="modal-close-btn" onClick={() => setAdModal({ open: false, title: '', reward: 0, countdown: 5, onFinish: null })}>
              <X size={16} />
            </button>

            <div className="modal-title">{adModal.title || 'Tactical Flight Briefing'}</div>

            <div className="modal-ad-player" style={{ background: '#0f172a', color: '#fff' }}>
              <span className="ad-countdown-pill" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                <Clock size={12} /> {adModal.countdown}s
              </span>
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <Radio size={36} color="#38bdf8" style={{ marginBottom: 10 }} />
                <div style={{ fontWeight: 800, fontSize: 16 }}>Encrypted Intel Transmission</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  Stand by for transmission completion to secure +{adModal.reward || 20} Duck Coins
                </div>
              </div>
            </div>

            {adModal.countdown === 0 ? (
              <button className="btn-primary-action" onClick={handleFinishAdModal}>
                Confirm Briefing & Claim +{adModal.reward || 20} Duck Coins
              </button>
            ) : (
              <button className="btn-primary-action" disabled style={{ background: '#94a3b8' }}>
                Decryption in progress: {adModal.countdown}s...
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================= MODAL: RADAR SCANNER ======================= */}
      {spinModal.open && (
        <div className="modal-overlay">
          <div className="modal-sheet">
            <button className="modal-close-btn" onClick={() => setSpinModal({ open: false, spinning: false, result: null })}>
              <X size={16} />
            </button>

            <div className="modal-title">📡 Tactical Radar Recon</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Scan the Pacific aerial sector for hidden enemy supply crates!
            </div>

            <div style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 14,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 140,
              color: '#fff',
              marginTop: 12
            }}>
              {spinModal.spinning ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, animation: 'spin 1s infinite linear' }}>
                    🧭
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 700, fontSize: 14, color: '#38bdf8' }}>
                    Radar sweep in progress...
                  </div>
                </div>
              ) : spinModal.result ? (
                <div style={{ textAlign: 'center' }}>
                  <Award size={40} color="#10b981" />
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#f8fafc', marginTop: 6 }}>
                    Enemy Cache Secured: +{spinModal.result} Duck Coins!
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Credited to your flight deck</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 44 }}>📡</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>Sector Pacific 1945 Ready</div>
                </div>
              )}
            </div>

            <button 
              className="btn-primary-action"
              disabled={spinModal.spinning}
              onClick={executeRadarSpin}
              style={{ marginTop: 14 }}
            >
              {spinModal.spinning ? 'Scanning...' : 'Initiate Radar Sweep'}
            </button>
          </div>
        </div>
      )}

      {/* ======================= MODAL: AIRPLANE COMBAT GAME IFRAME ======================= */}
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
            ref={iframeRef}
            src="/airforce_game.html" 
            title="Duck Aviator Combat 1945"
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
