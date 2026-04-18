import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Recordings from './Recordings';
import { apiCall } from './api';

function TopNavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center w-full px-6 h-16 fixed top-0 z-50 bg-[#131315]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#a5e7ff] to-[#00d2ff] font-headline">Vision Shield</span>
      </div>
      <div className="flex items-center gap-6">
        <button onClick={handleLogout} className="text-zinc-500 hover:text-white transition-colors duration-300">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}

function SideNavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex flex-col h-full border-r border-zinc-800/50 bg-[#131315] w-64 fixed left-0 top-0 pt-20 z-40">
      <nav className="flex-1 mt-8">
        <Link to="/" className={`py-4 px-6 flex items-center gap-4 transition-all duration-200 font-headline text-xs font-bold uppercase tracking-widest ${isActive('/') ? 'bg-gradient-to-r from-[#00d2ff]/10 to-transparent border-l-2 border-[#00d2ff] text-[#00d2ff] hover:translate-x-1' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200 hover:translate-x-1'}`}>
          <span className="material-symbols-outlined text-[20px]">videocam</span>
          <span>Live Feed</span>
        </Link>
        <Link to="/recordings" className={`py-4 px-6 flex items-center gap-4 transition-all duration-200 font-headline text-xs font-bold uppercase tracking-widest ${isActive('/recordings') ? 'bg-gradient-to-r from-[#00d2ff]/10 to-transparent border-l-2 border-[#00d2ff] text-[#00d2ff] hover:translate-x-1' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200 hover:translate-x-1'}`}>
          <span className="material-symbols-outlined text-[20px]">settings_backup_restore</span>
          <span>Recordings</span>
        </Link>
      </nav>
    </aside>
  );
}

function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [totalAlerts, setTotalAlerts] = useState(0);

  const fetchAlerts = async () => {
    const { data } = await apiCall('/alerts');
    if (data && data.alerts) {
      setAlerts(data.alerts);
      setTotalAlerts(data.total);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, []);

  const getAlertStyle = (type) => {
    if (type === 'motion') return { border: 'border-primary-container/50', bg: 'bg-primary-container/20', text: 'text-primary-container', label: 'INFO' };
    if (type === 'person') return { border: 'border-tertiary-container/50', bg: 'bg-tertiary-container/20', text: 'text-tertiary-container', label: 'WARNING' };
    return { border: 'border-error/50', bg: 'bg-error/20', text: 'text-error', label: 'CRITICAL' };
  };

  return (
    <main className="ml-64 flex-1 p-6 overflow-y-auto">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-[3] flex flex-col gap-6">
          <div className="relative bg-surface-container-low rounded-lg overflow-hidden flex-1 shadow-2xl border border-white/5 min-h-[400px]">
            <div className="absolute inset-0 grayscale opacity-40 mix-blend-screen pointer-events-none">
              <div className="w-full h-full border border-primary/10"></div>
            </div>
            <img alt="Live Camera Feed" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpSXX_126PLnu3l7ipG2AjlWx8cp3cgPZ7fOvIt6n7LSw8JQOBAJsqRSvIqvyBVGRJu4psB4ipuO9udwU0iAWX-bnDRORuoRjCVIncBuAWE-HGaGlx-Kxg0H2P6nAhvq64vR76WdCwvrxUAGNKbl-ISYVu0XoGSbvxbZgQpIH47OXCHpPDdLORofUaN4TkmhyQT1ZUORTTffV5pCcGjzN4YC_VhBW4dTcg6F9QVDquM7aIUusgeKqZNLEhvwFrXgbRFhgAoWCri0k" />
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 border-l-2 border-primary">
                  <p className="font-headline text-[10px] text-primary tracking-[0.2em] font-bold">CAM_01 // LIVE</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-32">
            <div className="bg-surface-container px-6 py-4 rounded shadow-lg flex flex-col justify-between border-l border-primary/20">
              <p className="font-headline text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Total Alerts</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-headline font-bold text-white tracking-tighter">{totalAlerts}</p>
              </div>
            </div>
            <div className="bg-surface-container px-6 py-4 rounded shadow-lg flex flex-col justify-between border-l border-zinc-800">
              <p className="font-headline text-[10px] text-zinc-500 font-bold tracking-widest uppercase">System Status</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-headline font-bold text-white tracking-tighter">ONLINE</p>
              </div>
            </div>
            <div className="bg-surface-container-high px-6 py-4 rounded shadow-lg flex flex-col justify-between border-l-2 border-primary">
              <p className="font-headline text-[10px] text-primary font-bold tracking-widest uppercase">AI Engine</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-headline font-bold text-white tracking-tighter">ACTIVE</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Real-time alerts side panel */}
        <div className="flex-[1] flex flex-col gap-6">
          <div className="bg-surface-container rounded-lg p-6 flex-1 shadow-xl border border-white/5 flex flex-col overflow-hidden max-h-[calc(100vh-8rem)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline text-xs font-black tracking-[0.2em] text-white">REAL_TIME_ALERTS</h2>
              <span className="material-symbols-outlined text-zinc-600 text-sm">filter_list</span>
            </div>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {alerts.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center mt-10 font-headline uppercase tracking-widest">No alerts detected</p>
              ) : (
                alerts.map(alert => {
                  const style = getAlertStyle(alert.type);
                  return (
                    <div key={alert.id} className={`bg-surface-container-low p-4 border-l-4 ${style.border} hover:bg-surface-container-high transition-colors cursor-pointer group`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[8px] font-headline font-black px-2 py-0.5 ${style.bg} ${style.text} rounded-full tracking-widest uppercase`}>
                          {style.label}
                        </span>
                        <span className="text-[9px] font-headline text-zinc-500 uppercase tracking-widest">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <h3 className={`text-xs font-headline font-bold text-on-surface mb-1 group-hover:${style.text} transition-colors uppercase`}>
                        {alert.type} DETECTED
                      </h3>
                      {alert.media_path && (
                        <p className="text-[10px] text-primary underline mt-2">View Media</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Layout({ children }) {
  return (
    <div className="flex h-screen pt-16">
      <TopNavBar />
      <SideNavBar />
      {children}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/recordings" element={<ProtectedRoute><Layout><Recordings /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
