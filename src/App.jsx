import { useState, useEffect } from 'react';

function App() {
  const [blockedSites, setBlockedSites] = useState([]);
  const [newSite, setNewSite] = useState('');
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['blockedSites', 'focusMode'], (result) => {
      if (result.blockedSites) {
        setBlockedSites(result.blockedSites);
      }
      if (result.focusMode !== undefined) {
        setFocusMode(result.focusMode);
      }
    });
  }, []);

  const toggleFocusMode = () => {
    const newFocusMode = !focusMode;
    setFocusMode(newFocusMode);
    chrome.storage.local.set({ focusMode: newFocusMode });
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

  return (
    <div className="w-[420px] min-h-[550px] bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgxNDcsMTk3LDI1MywwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60"></div>
      
      <div className="relative backdrop-blur-sm bg-white/70 rounded-3xl shadow-xl border border-white/60 p-6">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white rounded-2xl w-14 h-14 flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-300/40">
            Z
          </div>
          <h1 className="text-4xl font-bold ml-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ZenFocus
          </h1>
        </div>

        <div className="mb-8">
          <button
            onClick={toggleFocusMode}
            className={`w-full py-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md ${
              focusMode
                ? 'bg-gradient-to-r from-emerald-300 to-teal-300 text-emerald-900 shadow-emerald-200/60'
                : 'bg-gradient-to-r from-indigo-300 to-purple-300 text-indigo-900 shadow-indigo-200/60'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <div className={`w-4 h-4 rounded-full ${focusMode ? 'bg-emerald-900' : 'bg-indigo-900'} shadow-sm`}></div>
              <span>{focusMode ? '🧘 Odak Modu Aktif' : '🎯 Odak Modunu Aç'}</span>
            </div>
          </button>
        </div>

        <div className="bg-white/50 rounded-2xl p-5 border border-indigo-100 mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Engellenecek Site Ekle
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
            <span>Engellenen Siteler</span>
            <span className="bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs">
              {blockedSites.length}
            </span>
          </h2>
          
          {blockedSites.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <div className="text-5xl mb-3 opacity-60">🌟</div>
              <p className="text-sm text-slate-600">Henüz engellenmiş site yok</p>
              <p className="text-xs mt-1 text-slate-500">Yukarıdan site ekleyerek başla</p>
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
      `}</style>
    </div>
  );
}

export default App;
