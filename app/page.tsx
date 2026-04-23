'use client';

import { useState } from 'react';
import Leaderboard from './components/Leaderboard';

export default function Home() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <header className="z-10 mb-12 text-center">
        <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent drop-shadow-2xl">
          BRICK BREAKER
        </h1>
        <p className="text-zinc-500 font-medium tracking-[0.2em] uppercase mt-2">
          Precision & Velocity
        </p>
      </header>

      <main className="z-10 w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center">
        {/* Game Canvas Container */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-full aspect-[4/5] sm:w-[500px] h-[600px] bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden flex flex-col items-center justify-center">
            {gameState === 'idle' && (
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 animate-pulse">
                  <div className="w-12 h-12 bg-white rounded-full"></div>
                </div>
                <button 
                  onClick={() => setGameState('playing')}
                  className="px-8 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition-transform active:scale-95"
                >
                  START GAME
                </button>
              </div>
            )}
            {gameState === 'playing' && (
              <div className="text-zinc-500 italic">Game Engine Loading...</div>
            )}
          </div>
        </div>

        {/* Sidebar: Leaderboard & Stats */}
        <div className="flex flex-col gap-8 w-full max-w-md">
          <Leaderboard />
          
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Quick Controls</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-600 uppercase font-bold">Move</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm text-center">← →</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-600 uppercase font-bold">Launch</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm text-center">SPACE</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="z-10 mt-16 py-8 border-t border-white/5 w-full max-w-6xl flex justify-between items-center text-zinc-600 text-sm font-medium">
        <div>© 2026 BRICKBREAKER-LSJ</div>
        <div className="flex gap-6">
          <span>{`STUDENT ID: ${process.env.NEXT_PUBLIC_STUDENT_ID || '이서진'}`}</span>
        </div>
      </footer>
    </div>
  );
}
