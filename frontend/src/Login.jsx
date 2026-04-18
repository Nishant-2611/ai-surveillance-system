import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from './api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { data, error } = await apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    setIsLoading(false);

    if (error) {
      setError(error);
    } else if (data && data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    }
  };

  return (
    <div className="bg-[#131315] text-[#e5e1e4] font-body overflow-hidden min-h-screen relative">
      {/* Background Layer with Neural Pattern/Grid */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(165,231,255,0.05)_1px,transparent_0)]" style={{ backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#131315] via-[#131315]/90 to-primary/5"></div>
        <img className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-screen filter blur-sm" alt="abstract neural network visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK2aOmfUbfwAmgsyyrF4B07tloqbDYhahSSYlDM5hBWjsNKFQPw-f61TE5cTeLUQMbVUlQA8eEliJThOphEXQ0UhKvs5TSusseGpK2M6ORuq_9rE7rPyiqySN0NDb7IO3oJ5I2vJzHj4TcEk5RBJd2kUrd_iJdQntMHj47jzt2oiAPDp3Y2aCajKyhA4nphR23a4DBPr7L_3qI7PpZs3hB8CMA_IBUckQcAM-4dvRkjLUCoy-sg2Ptnbzq83GwaGA8hlQM7XIGWYs" />
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[480px] flex flex-col gap-1">
          {/* System Identity Header */}
          <header className="mb-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-container flex items-center justify-center rounded-sm shadow-[0_0_20px_rgba(0,210,255,0.3)]">
                <span className="material-symbols-outlined text-on-primary-fixed text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              </div>
              <div className="flex flex-col">
                <h1 className="font-headline text-2xl font-bold tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-fixed">
                  SENTINEL_HUD
                </h1>
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-fixed-dim/70">
                  AI_SMART_SURVEILLANCE_v4.2
                </p>
              </div>
            </div>
          </header>

          {/* Card Container */}
          <section className="bg-surface-container-low/80 backdrop-blur-2xl p-10 relative group">
            <div className="absolute inset-0 border border-outline-variant/15 pointer-events-none"></div>
            <div className="mb-10">
              <h2 className="font-headline text-3xl font-light tracking-tight text-on-surface">OPERATOR_LOGIN</h2>
              <div className="h-1 w-12 bg-primary-container mt-2"></div>
            </div>
            
            <form className="space-y-8" onSubmit={handleLogin}>
              {error && (
                <div className="bg-error/20 border border-error text-error px-4 py-2 text-sm rounded font-headline uppercase tracking-wide">
                  ERROR: {error}
                </div>
              )}

              {/* Email / Username Input */}
              <div className="relative flex flex-col">
                <label className="font-label text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2" htmlFor="identity">
                  IDENTITY_RECOGNITION
                </label>
                <div className="flex items-center bg-surface-container-high group-focus-within:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined px-4 text-on-surface-variant text-xl">alternate_email</span>
                  <input 
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-medium py-4 text-primary-fixed tracking-wide placeholder:text-outline/50 uppercase" 
                    id="identity" 
                    name="identity" 
                    placeholder="EMAIL_OR_USERNAME" 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative flex flex-col">
                <label className="font-label text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2" htmlFor="credential">
                  ENCRYPTED_KEY_PHRASE
                </label>
                <div className="flex items-center bg-surface-container-high group-focus-within:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined px-4 text-on-surface-variant text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  <input 
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-medium py-4 text-primary-fixed tracking-wide placeholder:text-outline/50" 
                    id="credential" 
                    name="credential" 
                    placeholder="••••••••••••" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="w-4 h-4 bg-surface-container-highest border-outline-variant rounded-sm text-primary focus:ring-primary/20 focus:ring-offset-0" type="checkbox" />
                  <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant group-hover:text-on-surface transition-colors">PERSIST_SESSION</span>
                </label>
              </div>

              <button disabled={isLoading} className="w-full group relative overflow-hidden bg-gradient-to-br from-primary to-primary-container p-4 rounded-sm transition-all duration-300 active:scale-[0.98] disabled:opacity-50" type="submit">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative font-headline font-bold text-on-primary-fixed text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  {isLoading ? 'VERIFYING...' : 'INITIATE_UPLINK'}
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </span>
              </button>
            </form>

            <footer className="mt-12 flex justify-center border-t border-outline-variant/10 pt-6">
              <p className="font-label text-[10px] text-on-surface-variant/50 uppercase tracking-widest text-center leading-relaxed">
                SECURE_PORTAL_ENCRYPTION_ACTIVE<br />
                AES_256_GCM | SYSTEM_ID: HUD_ALPHA_9
              </p>
            </footer>
          </section>

          <div className="flex justify-between items-end px-2 opacity-30">
            <div className="w-16 h-[2px] bg-primary"></div>
            <div className="font-label text-[9px] text-primary uppercase">LAT: 37.7749° N | LONG: 122.4194° W</div>
          </div>
        </div>
      </main>

      <div className="fixed top-8 right-8 z-50 pointer-events-none">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-label text-[10px] text-primary tracking-widest uppercase">CONNECTION_STABLE</span>
          </div>
          <div className="font-label text-[10px] text-on-surface-variant uppercase opacity-50 tracking-tighter">BITRATE: 48.2 GBPS</div>
        </div>
      </div>
      <div className="fixed bottom-8 left-8 z-50 pointer-events-none">
        <div className="w-24 h-24 border-l border-b border-primary/20 opacity-40"></div>
      </div>
    </div>
  );
}

export default Login;
