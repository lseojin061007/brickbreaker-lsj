'use client';

import { useState, useEffect } from 'react';
import Leaderboard from './components/Leaderboard';
import GameEngine from './components/GameEngine';

export default function Home() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'success' | 'failure'>('idle');
  const [userName, setUserName] = useState('');
  const [finalTime, setFinalTime] = useState<string | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);

  const handleStart = () => {
    if (userName.trim()) {
      setGameState('playing');
      setFinalTime(null);
      setShowFireworks(false);
    } else {
      alert('이름을 입력해주세요!');
    }
  };

  const handleGameEnd = (status: 'success' | 'failure', time?: string) => {
    setGameState(status);
    if (status === 'success' && time) {
      setFinalTime(time);
      setShowFireworks(true);
      // Fireworks stop after 5 seconds
      setTimeout(() => setShowFireworks(false), 5000);
    }
  };

  const handleRestart = () => {
    setGameState('idle');
    setFinalTime(null);
    setShowFireworks(false);
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col items-center justify-center p-4 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Fireworks Container */}
      {showFireworks && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '10px',
                height: '10px',
                backgroundColor: ['#ff8a8a', '#ffff8a', '#8aff8a', '#8ae4ff'][Math.floor(Math.random() * 4)],
                borderRadius: '50%',
                boxShadow: '0 0 20px currentColor',
                animation: `firework ${1 + Math.random()}s ease-out infinite`
              }}
            />
          ))}
          <style jsx>{`
            @keyframes firework {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(5); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <header className="z-10 mb-8 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent drop-shadow-2xl italic">
          INU 벽돌깨기
        </h1>
        <div className="h-1 w-24 bg-blue-500 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      </header>

      <main className="z-10 w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center">
        {gameState === 'idle' ? (
          <div className="flex flex-col items-center gap-6 w-full max-w-md p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl">
            {/* INU Lion Image */}
            <div className="relative w-40 h-40 mb-2 animate-float">
              <img 
                src="/inu_lion.png" 
                alt="INU Lion" 
                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              />
            </div>
            
            <div className="w-full space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Player Identity</label>
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all text-lg font-medium placeholder:text-zinc-700"
              />
            </div>
            <button 
              onClick={handleStart}
              className="group relative w-full overflow-hidden rounded-2xl bg-white px-8 py-5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <span className="text-xl font-black text-black tracking-tight">GAME START</span>
            </button>
            <div className="text-zinc-600 text-xs font-medium tracking-widest pt-4 border-t border-white/5 w-full text-center uppercase">
              신소재공학과_202501183_이서진
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-20 transition duration-1000"></div>
            <div className="relative w-full aspect-[4/5] sm:w-[450px] min-h-[600px] bg-zinc-900/90 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-hidden p-6">
              {gameState === 'playing' && (
                <GameEngine 
                  userName={userName} 
                  onGameEnd={handleGameEnd}
                  onQuit={handleRestart}
                />
              )}

              {(gameState === 'success' || gameState === 'failure') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-lg z-30 p-8 text-center animate-in fade-in zoom-in duration-500">
                  {gameState === 'success' ? (
                    <>
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
                        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <h2 className="text-5xl font-black text-white mb-2 italic">MISSION COMPLETE</h2>
                      <p className="text-zinc-400 mb-8">성공적으로 임무를 완수했습니다!</p>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full mb-10">
                        <div className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Final Time</div>
                        <div className="text-4xl font-black text-blue-400 font-mono tracking-tighter">{finalTime}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </div>
                      <h2 className="text-5xl font-black text-white mb-2 italic">MISSION FAILED</h2>
                      <p className="text-zinc-400 mb-10">생명을 모두 잃었습니다.</p>
                    </>
                  )}
                  <div className="flex flex-col gap-4 w-full">
                    <button 
                      onClick={handleRestart}
                      className="w-full py-4 bg-white text-black font-black rounded-xl hover:scale-105 transition-transform"
                    >
                      TRY AGAIN
                    </button>
                    <button 
                      onClick={handleRestart}
                      className="text-zinc-500 hover:text-white text-sm font-bold transition-colors"
                    >
                      BACK TO MAIN
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <footer className="z-10 mt-16 py-8 border-t border-white/5 w-full max-w-6xl flex justify-between items-center text-zinc-600 text-[10px] font-bold tracking-widest uppercase">
        <div>© 2026 INU-BRICKBREAKER</div>
        <div className="flex gap-6">
          <span>신소재공학과_202501183_이서진</span>
        </div>
      </footer>
    </div>
  );
}
