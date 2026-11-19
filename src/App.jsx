import { useState, useEffect, useRef } from 'react';
import { hashPassword, migratePassword, verifyPassword } from './lib/password.js';

const DEFAULT_SETTINGS = {
  mainText: 'Time to focus.',
  subText: 'Take a deep breath.',
  bgColor1: '#f8fafc',
  bgColor2: '#e0e7ff',
  bgColor3: '#ddd6fe',
  bgColor4: '#fce7f3',
  textColor: '#4c1d95',
  subTextColor: '#6b21a8',
  accentColor: '#a78bfa',
  pulseEnabled: true,
};

const THEMES = [
  { id: 'default', name: 'Purple Zen', emoji: '💜', colors: { bgColor1: '#f8fafc', bgColor2: '#e0e7ff', bgColor3: '#ddd6fe', bgColor4: '#fce7f3', textColor: '#4c1d95', subTextColor: '#6b21a8', accentColor: '#a78bfa' } },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', colors: { bgColor1: '#f0fdfa', bgColor2: '#ccfbf1', bgColor3: '#a5f3fc', bgColor4: '#e0f2fe', textColor: '#164e63', subTextColor: '#0e7490', accentColor: '#06b6d4' } },
  { id: 'sunset', name: 'Sunset', emoji: '🌅', colors: { bgColor1: '#fff7ed', bgColor2: '#fed7aa', bgColor3: '#fda4af', bgColor4: '#fce7f3', textColor: '#9a3412', subTextColor: '#c2410c', accentColor: '#f97316' } },
  { id: 'forest', name: 'Forest', emoji: '🌿', colors: { bgColor1: '#f0fdf4', bgColor2: '#dcfce7', bgColor3: '#bbf7d0', bgColor4: '#ecfdf5', textColor: '#14532d', subTextColor: '#166534', accentColor: '#22c55e' } },
  { id: 'night', name: 'Night', emoji: '🌙', colors: { bgColor1: '#0f172a', bgColor2: '#1e1b4b', bgColor3: '#312e81', bgColor4: '#1e293b', textColor: '#e0e7ff', subTextColor: '#a5b4fc', accentColor: '#818cf8' } },
  { id: 'minimal', name: 'Minimal', emoji: '⬜', colors: { bgColor1: '#fafafa', bgColor2: '#f5f5f5', bgColor3: '#e5e5e5', bgColor4: '#f5f5f5', textColor: '#171717', subTextColor: '#404040', accentColor: '#737373' } },
];

function App() {
  const [page, setPage] = useState('main');
  const [showConfirm, setShowConfirm] = useState(false);
  const [blockedSites, setBlockedSites] = useState([]);
  const [newSite, setNewSite] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [stats, setStats] = useState({ totalBlocked: 0, focusTime: 0, sessionsCompleted: 0 });
  const [password, setPassword] = useState('');
  const [savedPassword, setSavedPassword] = useState(null);
  const [inputValid, setInputValid] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState('focus');
  const timerRef = useRef(null);

  useEffect(() => {
    chrome.storage.local.get(['blockedSites', 'focusMode', 'blockPageSettings', 'stats', 'password', 'passwordHash'], (result) => {
      if (result.blockedSites) setBlockedSites(result.blockedSites);
      if (result.focusMode !== undefined) setFocusMode(result.focusMode);
      if (result.blockPageSettings) setSettings({ ...DEFAULT_SETTINGS, ...result.blockPageSettings });
      if (result.stats) setStats(result.stats);
      // Older versions stored the password itself; replace it with a hash
      migratePassword(result.passwordHash || result.password).then((record) => {
        setSavedPassword(record);
        if (typeof result.password === 'string') {
          if (record) chrome.storage.local.set({ passwordHash: record });
          chrome.storage.local.remove('password');
        }
      });
    });
  }, []);

  useEffect(() => {
    if (pomodoroRunning && pomodoroTime > 0) {
      timerRef.current = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      clearInterval(timerRef.current);
      if (pomodoroMode === 'focus') {
        const newStats = { ...stats, sessionsCompleted: stats.sessionsCompleted + 1, focusTime: stats.focusTime + 25 };
        setStats(newStats);
        chrome.storage.local.set({ stats: newStats });
        setPomodoroMode('break');
        setPomodoroTime(5 * 60);
      } else {
        setPomodoroMode('focus');
        setPomodoroTime(25 * 60);
      }
      setPomodoroRunning(false);
    }
    return () => clearInterval(timerRef.current);
  }, [pomodoroRunning, pomodoroTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePomodoro = () => {
    setPomodoroRunning(!pomodoroRunning);
  };

  const resetPomodoro = () => {
    setPomodoroRunning(false);
    setPomodoroMode('focus');
    setPomodoroTime(25 * 60);
  };

  const handleToggleFocusMode = () => {
    if (focusMode) {
      setShowConfirm(true);
    } else {
      setFocusMode(true);
      chrome.storage.local.set({ focusMode: true });
    }
  };

  useEffect(() => {
    let current = true;
    verifyPassword(passwordInput, savedPassword).then((ok) => { if (current) setInputValid(ok); });
    return () => { current = false; };
  }, [passwordInput, savedPassword]);

  const passwordBlocks = Boolean(savedPassword) && !inputValid;

  const confirmTurnOff = async () => {
    if (savedPassword && !(await verifyPassword(passwordInput, savedPassword))) {
      return;
    }
    setFocusMode(false);
    chrome.storage.local.set({ focusMode: false });
    setShowConfirm(false);
    setPasswordInput('');
  };

  const savePassword = async (newPassword) => {
    setPassword('');
    if (!newPassword) {
      setSavedPassword(null);
      chrome.storage.local.remove(['passwordHash', 'password']);
      return;
    }
    const record = await hashPassword(newPassword);
    setSavedPassword(record);
    chrome.storage.local.set({ passwordHash: record });
    chrome.storage.local.remove('password');
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const applyTheme = (theme) => {
    setSettings((prev) => ({ ...prev, ...theme.colors }));
  };

  const saveSettings = () => {
    chrome.storage.local.set({ blockPageSettings: settings }, () => setPage('main'));
  };

  const addSite = () => {
    if (newSite.trim() === '') return;

    const cleanSite = newSite.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    
    if (blockedSites.includes(cleanSite)) {
      setNewSite('');
      return;
    }

    const updatedSites = [...blockedSites, cleanSite];
    setBlockedSites(updatedSites);
    
    chrome.storage.local.set({ blockedSites: updatedSites }, () => {
      setNewSite('');
    });
  };

  const removeSite = (siteToRemove) => {
    const updatedSites = blockedSites.filter((site) => site !== siteToRemove);
    setBlockedSites(updatedSites);
    chrome.storage.local.set({ blockedSites: updatedSites });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addSite();
    }
  };

  if (page === 'settings') {
    const bgGradient = `linear-gradient(135deg, ${settings.bgColor1} 0%, ${settings.bgColor2} 30%, ${settings.bgColor3} 60%, ${settings.bgColor4} 100%)`;

    return (
      <div className="w-[420px] bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-4 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgxNDcsMTk3LDI1MywwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60"></div>

        <div className="relative space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage('main')}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="text-base font-bold text-slate-800">Block Screen</h2>
            <button
              onClick={() => setSettings(DEFAULT_SETTINGS)}
              className="text-xs text-slate-400 hover:text-slate-600 transition"
            >
              Reset
            </button>
          </div>

          <div
            className="rounded-2xl overflow-hidden shadow-lg border border-white/60"
            style={{ background: bgGradient, height: '110px' }}
          >
            <div className="flex flex-col items-center justify-center h-full relative px-4">
              {settings.pulseEnabled && (
                <div
                  className="absolute w-20 h-20 rounded-full animate-pulse"
                  style={{
                    background: `radial-gradient(circle, ${settings.accentColor}30, transparent)`,
                    boxShadow: `0 0 40px ${settings.accentColor}20`,
                  }}
                ></div>
              )}
              <p className="text-sm font-light z-10 mb-1 text-center truncate w-full" style={{ color: settings.textColor }}>
                {settings.mainText || 'Main text...'}
              </p>
              <p className="text-xs font-light z-10 text-center truncate w-full" style={{ color: settings.subTextColor }}>
                {settings.subText || 'Sub text...'}
              </p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
            <h3 className="text-[11px] font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Motivation Text</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={settings.mainText}
                onChange={(e) => updateSetting('mainText', e.target.value)}
                placeholder="Main text..."
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
              <input
                type="text"
                value={settings.subText}
                onChange={(e) => updateSetting('subText', e.target.value)}
                placeholder="Sub text..."
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
            <h3 className="text-[11px] font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Theme</h3>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((theme) => {
                const isActive = settings.bgColor1 === theme.colors.bgColor1 && settings.accentColor === theme.colors.accentColor;
                return (
                  <button
                    key={theme.id}
                    onClick={() => applyTheme(theme)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      isActive ? 'border-indigo-400 shadow-md ring-2 ring-indigo-200' : 'border-transparent'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${theme.colors.bgColor1}, ${theme.colors.bgColor3})` }}
                  >
                    <span className="text-base">{theme.emoji}</span>
                    <span className="text-[10px] font-bold" style={{ color: theme.colors.textColor }}>{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
            <h3 className="text-[11px] font-bold text-slate-500 mb-2.5 uppercase tracking-wider">Custom Colors</h3>
            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Background</span>
                <div className="flex gap-2 mt-1">
                  {['bgColor1', 'bgColor2', 'bgColor3', 'bgColor4'].map((key) => (
                    <input
                      key={key}
                      type="color"
                      value={settings[key]}
                      onChange={(e) => updateSetting(key, e.target.value)}
                      className="color-picker w-9 h-9 rounded-xl border-2 border-white shadow-sm cursor-pointer"
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-6">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Text</span>
                  <div className="flex gap-2 mt-1">
                    <input type="color" value={settings.textColor} onChange={(e) => updateSetting('textColor', e.target.value)} className="color-picker w-9 h-9 rounded-xl border-2 border-white shadow-sm cursor-pointer" />
                    <input type="color" value={settings.subTextColor} onChange={(e) => updateSetting('subTextColor', e.target.value)} className="color-picker w-9 h-9 rounded-xl border-2 border-white shadow-sm cursor-pointer" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Accent</span>
                  <div className="mt-1">
                    <input type="color" value={settings.accentColor} onChange={(e) => updateSetting('accentColor', e.target.value)} className="color-picker w-9 h-9 rounded-xl border-2 border-white shadow-sm cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-700 font-medium">Pulse Animation</span>
              <div
                onClick={() => updateSetting('pulseEnabled', !settings.pulseEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  settings.pulseEnabled ? 'bg-indigo-500' : 'bg-slate-300'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  settings.pulseEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </div>
            </label>
          </div>

          <button
            onClick={saveSettings}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-300/40 hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Save
          </button>
        </div>

        <style>{`
          .color-picker { -webkit-appearance: none; appearance: none; border: none; padding: 0; background: none; }
          .color-picker::-webkit-color-swatch-wrapper { padding: 2px; }
          .color-picker::-webkit-color-swatch { border: none; border-radius: 10px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-[420px] min-h-[550px] bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgxNDcsMTk3LDI1MywwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60"></div>
      
      <div className="relative backdrop-blur-sm bg-white/70 rounded-3xl shadow-xl border border-white/60 p-6">
        <div className="flex items-center justify-center mb-8 relative">
          <div className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white rounded-2xl w-14 h-14 flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-300/40">
            Z
          </div>
          <h1 className="text-4xl font-bold ml-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ZenFocus
          </h1>
          <button
            onClick={() => setPage('settings')}
            className="absolute -right-1 -top-1 w-9 h-9 flex items-center justify-center rounded-xl bg-white/80 border border-indigo-100 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all"
            title="Settings"
          >
            <svg className="w-[18px] h-[18px] text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={handleToggleFocusMode}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md ${
              focusMode
                ? 'bg-gradient-to-r from-emerald-300 to-teal-300 text-emerald-900 shadow-emerald-200/60'
                : 'bg-gradient-to-r from-indigo-300 to-purple-300 text-indigo-900 shadow-indigo-200/60'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <div className={`w-4 h-4 rounded-full ${focusMode ? 'bg-emerald-900' : 'bg-indigo-900'} shadow-sm`}></div>
              <span>{focusMode ? '🧘 Focus Mode Active' : '🎯 Enable Focus Mode'}</span>
            </div>
          </button>
        </div>

        {/* Pomodoro Timer */}
        <div className="bg-white/50 rounded-2xl p-4 border border-indigo-100 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span>⏱️</span> Pomodoro Timer
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${pomodoroMode === 'focus' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {pomodoroMode === 'focus' ? 'Focus' : 'Break'}
            </span>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-3 font-mono">{formatTime(pomodoroTime)}</div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={togglePomodoro}
                className={`px-6 py-2 rounded-xl font-semibold text-sm transition-all ${
                  pomodoroRunning
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                {pomodoroRunning ? '⏸ Pause' : '▶ Start'}
              </button>
              <button
                onClick={resetPomodoro}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold text-sm transition-all"
              >
                ↺ Reset
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white/50 rounded-2xl p-4 border border-indigo-100 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span>📊</span> Statistics
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.sessionsCompleted}</div>
              <div className="text-[10px] text-slate-500 uppercase">Sessions</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.focusTime}</div>
              <div className="text-[10px] text-slate-500 uppercase">Minutes</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{blockedSites.length}</div>
              <div className="text-[10px] text-slate-500 uppercase">Blocked</div>
            </div>
          </div>
        </div>

        {/* Password Protection */}
        <div className="bg-white/50 rounded-2xl p-4 border border-indigo-100 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span>🔒</span> Password Protection
          </h3>
          {savedPassword ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-600 flex items-center gap-2">
                <span>✓</span> Password is set
              </span>
              <button
                onClick={() => savePassword('')}
                className="text-xs text-rose-500 hover:text-rose-700 transition"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set password..."
                className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
              <button
                onClick={() => password && savePassword(password)}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-200 transition"
              >
                Set
              </button>
            </div>
          )}
          <p className="text-[10px] text-slate-400 mt-2">Password required to turn off focus mode</p>
        </div>

        <div className="bg-white/50 rounded-2xl p-4 border border-indigo-100 mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Add Site to Block
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="instagram.com"
              className="flex-1 px-4 py-3 bg-white border border-indigo-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
            />
            <button
              onClick={addSite}
              className="bg-gradient-to-r from-indigo-400 to-purple-400 text-white px-6 py-3 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition font-semibold shadow-md shadow-indigo-200/50 hover:shadow-lg transform hover:scale-[1.02]"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-white/50 rounded-2xl p-5 border border-indigo-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center justify-between">
            <span>Blocked Sites</span>
            <span className="bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs">
              {blockedSites.length}
            </span>
          </h2>
          
          {blockedSites.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <div className="text-5xl mb-3 opacity-60">🌟</div>
              <p className="text-sm text-slate-600">No blocked sites yet</p>
              <p className="text-xs mt-1 text-slate-500">Add sites above to get started</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
              {blockedSites.map((site, index) => (
                <div
                  key={index}
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 px-4 py-2 rounded-full text-indigo-800 text-sm font-medium transition-all duration-200 hover:from-indigo-200 hover:to-purple-200 hover:border-indigo-300 hover:scale-[1.02] shadow-sm"
                >
                  <span className="truncate max-w-[200px]">{site}</span>
                  <button
                    onClick={() => removeSite(site)}
                    className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-300 hover:bg-rose-400 flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-sm"
                  >
                    <svg
                      className="w-3 h-3 text-rose-800"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-[340px] w-full shadow-2xl border border-slate-100 animate-in">
            <div className="text-center mb-2">
              <div className="text-4xl mb-3">🛑</div>
              <h3 className="text-lg font-bold text-slate-800">Turn Off Focus Mode</h3>
            </div>
            <p className="text-sm text-slate-500 text-center mb-4">
              Are you sure you want to turn off focus mode? All blocked sites will become accessible.
            </p>
            {savedPassword && (
              <div className="mb-4">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password to confirm..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
                />
                {passwordInput && !inputValid && (
                  <p className="text-xs text-rose-500 mt-2">Incorrect password</p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setPasswordInput(''); }}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmTurnOff}
                disabled={passwordBlocks}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all shadow-md ${
                  passwordBlocks
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600 shadow-rose-200/50'
                }`}
              >
                Yes, Turn Off
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(199, 210, 254, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(129, 140, 248, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(129, 140, 248, 0.7);
        }
        @keyframes animate-in-kf {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-in {
          animation: animate-in-kf 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
