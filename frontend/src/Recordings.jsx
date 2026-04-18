import React, { useState, useEffect } from 'react';
import { apiCall } from './api';

function Recordings() {
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecordings = async () => {
      setIsLoading(true);
      const { data } = await apiCall('/recordings');
      if (data && data.recordings) {
        setRecordings(data.recordings);
      }
      setIsLoading(false);
    };
    fetchRecordings();
  }, []);

  const API_BASE_URL = 'http://localhost:5000';

  return (
    <main className="ml-64 pt-16 flex flex-col h-screen overflow-hidden bg-surface w-full">
      {/* Header & Filters Area */}
      <section className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold tracking-tight text-on-background">RECORDING_ARCHIVE</h1>
            <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest">
              System Timestamp: {new Date().toISOString().split('T')[0]} // Total Records: {recordings.length}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-surface-container-low p-1 rounded-sm">
              <span className="px-3 py-1.5 text-[10px] font-headline font-bold text-primary bg-primary/10 tracking-widest uppercase rounded-sm">ALL_EVENTS</span>
              <span className="px-3 py-1.5 text-[10px] font-headline font-bold text-zinc-500 tracking-widest uppercase hover:text-zinc-300 cursor-pointer transition-colors">INTRUSION</span>
              <span className="px-3 py-1.5 text-[10px] font-headline font-bold text-zinc-500 tracking-widest uppercase hover:text-zinc-300 cursor-pointer transition-colors">FACE_ID</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-sm border border-outline-variant/10 cursor-pointer hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-primary text-sm">filter_list</span>
              <span className="text-[10px] font-headline font-bold text-on-surface-variant tracking-widest uppercase">FILTER_CHANNELS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Grid Layout */}
      <section className="flex-1 flex flex-col md:flex-row overflow-hidden px-6 pb-6 gap-6 w-full">
        {/* Calendar Component */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-surface-container-low rounded-lg p-6 flex-none border border-outline-variant/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-sm font-bold tracking-widest text-primary uppercase">Current Month</h3>
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-zinc-500 cursor-pointer hover:text-white transition-colors">chevron_left</span>
                <span className="material-symbols-outlined text-zinc-500 cursor-pointer hover:text-white transition-colors">chevron_right</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-4 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-[10px] font-headline font-bold text-zinc-600 uppercase">{day}</div>
              ))}
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className={`text-[11px] font-body py-1 cursor-pointer transition-colors ${i === 15 ? 'font-headline font-bold text-on-primary-fixed bg-primary-container/90 rounded-sm shadow-[0_0_12px_rgba(0,210,255,0.3)]' : 'text-zinc-400 hover:text-white'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-container-lowest flex-1 rounded-lg p-6 border border-outline-variant/5 overflow-hidden flex flex-col">
            <h3 className="font-headline text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-4">TIME_RANGE_SELECTOR</h3>
            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
              <div className="group cursor-pointer">
                <div className="flex justify-between text-[10px] font-headline font-bold tracking-widest mb-1 group-hover:text-primary transition-colors">
                  <span>00:00 - 06:00</span>
                  <span className="text-zinc-600">12 FILES</span>
                </div>
                <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-700 group-hover:bg-primary-container transition-all" style={{ width: '15%' }}></div>
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="flex justify-between text-[10px] font-headline font-bold tracking-widest mb-1 text-primary">
                  <span>06:00 - 12:00</span>
                  <span>45 FILES</span>
                </div>
                <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container shadow-[0_0_8px_rgba(0,210,255,0.5)] transition-all" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Grid Area */}
        <div className="flex-1 bg-surface-container-low rounded-lg p-6 border border-outline-variant/5 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              <p className="text-zinc-500 font-headline uppercase tracking-widest">Loading archive data...</p>
            ) : recordings.length === 0 ? (
              <p className="text-zinc-500 font-headline uppercase tracking-widest">No recordings found in archive.</p>
            ) : (
              recordings.map((recording) => (
                <div key={recording.id} className="bg-surface-container-high rounded-sm group overflow-hidden relative border border-transparent hover:border-primary-container/20 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                  <div className="aspect-video relative overflow-hidden bg-black">
                    <img 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale hover:grayscale-0" 
                      alt="Recording snapshot" 
                      src={recording.media_path ? `${API_BASE_URL}${recording.media_path}` : "https://lh3.googleusercontent.com/aida-public/AB6AXuAEc_oMwNJgF-ajEZhxc5NuRjWkpPNq0NVa2NYk-F6C6yrwNS6XasjqHKwQJFlHiThyWObNS1vDXlgowZ90ooUdISdtzb9lH6XOXOA8N7B7QOkRo5Aj0hKTtvFo37ZD0yfktAUrWPwubdaLtlOSI6K8_frOszZK4rZxDCWXJR6D6OICENSw_9txadYMgfyt34ChpaOcHfk715PApq7JIBq0BBdG1ZwUzgqxuqnlVVjtfoJmB0C6s0_NR8Ds1VX6ARjMOlSvs9yQIB4"} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="bg-tertiary-container/20 backdrop-blur-md text-tertiary-container text-[8px] font-headline font-bold px-2 py-0.5 rounded-full border border-tertiary-container/30 uppercase tracking-widest">
                        {recording.type}
                      </span>
                      <span className="bg-black/40 backdrop-blur-md text-zinc-300 text-[8px] font-headline font-bold px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-widest">
                        Alert_{recording.id}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`${API_BASE_URL}/api/recording/${recording.id}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-primary-container/90 text-on-primary-container flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                      </a>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-headline text-xs font-bold tracking-widest text-on-surface uppercase">Event_{recording.id}</h4>
                        <p className="text-[10px] font-body text-zinc-500 uppercase tracking-tighter">
                          {new Date(recording.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-zinc-500 text-sm cursor-pointer hover:text-primary transition-colors">more_vert</span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <a href={`${API_BASE_URL}/api/recording/${recording.id}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-surface-container-lowest text-[10px] font-headline font-bold text-zinc-400 py-2 uppercase tracking-widest rounded-sm hover:bg-surface-container-highest hover:text-white transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-xs">download</span> SAVE_RAW
                      </a>
                      <button className="flex-1 bg-primary/5 text-[10px] font-headline font-bold text-primary py-2 uppercase tracking-widest rounded-sm hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-xs">analytics</span> AI_LOG
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Recordings;
