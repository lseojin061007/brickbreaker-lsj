'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { submitScore } from '@/lib/googleSheet';

interface GameEngineProps {
  userName: string;
  onGameEnd: (status: 'success' | 'failure', time?: string) => void;
  onQuit: () => void;
}

const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 100;
const BALL_RADIUS = 8;
const INITIAL_LIVES = 3;

// Light Colors
const COLORS = {
  RED: '#ff8a8a',
  ORANGE: '#ffb38a',
  YELLOW: '#ffff8a',
  BLUE: '#8ae4ff',
  GREEN: '#8aff8a',
  PURPLE: '#c48aff',
};

const COLOR_LIST = [COLORS.ORANGE, COLORS.YELLOW, COLORS.BLUE, COLORS.GREEN, COLORS.PURPLE];

export default function GameEngine({ userName, onGameEnd, onQuit }: GameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'paused' | 'ended'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [time, setTime] = useState(0);
  const [redBricksRemoved, setRedBricksRemoved] = useState(0);
  
  const requestRef = useRef<number>();
  const gameRef = useRef({
    ball: { x: 0, y: 0, dx: 4, dy: -4 },
    paddle: { x: 0 },
    bricks: [] as { x: number; y: number; status: number; color: string }[],
    keys: { left: false, right: false },
    touchX: null as number | null,
    startTime: 0,
    pausedTime: 0,
    lastTime: 0,
  });

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const hitSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    // Background Music
    const bg = new Audio('/Hyper_Speed_Run.mp3');
    bg.loop = true;
    bg.volume = 0.15; // Low volume as requested
    bgMusicRef.current = bg;

    // Effect Sound (Collision)
    const hit = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'); 
    hit.volume = 0.2;
    hitSoundRef.current = hit;

    return () => {
      bg.pause();
      bgMusicRef.current = null;
      hitSoundRef.current = null;
    };
  }, []);

  // Initialize Bricks
  useEffect(() => {
    const bricks = [];
    const totalBricks = BRICK_ROWS * BRICK_COLS;
    const redBrickCount = Math.floor(totalBricks * 0.3); // 30% red bricks
    let redPlaced = 0;

    // Create a pool of colors
    const pool = [];
    for (let i = 0; i < totalBricks; i++) {
      if (redPlaced < redBrickCount) {
        pool.push(COLORS.RED);
        redPlaced++;
      } else {
        pool.push(COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)]);
      }
    }
    
    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const brickWidth = (canvas.width - 20) / BRICK_COLS;
      const brickHeight = 25;
      for (let c = 0; c < BRICK_COLS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
          const color = pool.pop() || COLORS.BLUE;
          bricks.push({
            x: c * brickWidth + 10,
            y: r * brickHeight + 50,
            status: 1,
            color: color,
          });
        }
      }
      gameRef.current.bricks = bricks;
      gameRef.current.paddle.x = (canvas.width - PADDLE_WIDTH) / 2;
      gameRef.current.ball.x = canvas.width / 2;
      gameRef.current.ball.y = canvas.height - 30;
    }
  }, []);

  // Countdown Logic
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      gameRef.current.startTime = Date.now();
      bgMusicRef.current?.play().catch(e => console.log("Audio play failed:", e));
    }
  }, [gameState, countdown]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameRef.current.keys.left = true;
      if (e.key === 'ArrowRight') gameRef.current.keys.right = true;
      if (e.key === ' ') {
         // Pause toggle logic could go here
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') gameRef.current.keys.left = false;
      if (e.key === 'ArrowRight') gameRef.current.keys.right = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      gameRef.current.touchX = e.touches[0].clientX;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (gameRef.current.touchX !== null) {
        const deltaX = e.touches[0].clientX - gameRef.current.touchX;
        gameRef.current.paddle.x += deltaX;
        gameRef.current.touchX = e.touches[0].clientX;
        
        // Bounds
        const canvas = canvasRef.current;
        if (canvas) {
          if (gameRef.current.paddle.x < 0) gameRef.current.paddle.x = 0;
          if (gameRef.current.paddle.x + PADDLE_WIDTH > canvas.width) {
            gameRef.current.paddle.x = canvas.width - PADDLE_WIDTH;
          }
        }
      }
    };
    const handleTouchEnd = () => {
      gameRef.current.touchX = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Bricks
    gameRef.current.bricks.forEach(b => {
      if (b.status === 1) {
        ctx.beginPath();
        const brickWidth = (canvas.width - 20) / BRICK_COLS;
        ctx.roundRect(b.x, b.y, brickWidth - 4, 21, 4);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.closePath();
      }
    });

    // Draw Paddle
    ctx.beginPath();
    ctx.roundRect(gameRef.current.paddle.x, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;

    // Draw Ball
    ctx.beginPath();
    ctx.arc(gameRef.current.ball.x, gameRef.current.ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();

    if (gameState === 'playing') {
      // Move Paddle
      if (gameRef.current.keys.right && gameRef.current.paddle.x < canvas.width - PADDLE_WIDTH) {
        gameRef.current.paddle.x += 7;
      } else if (gameRef.current.keys.left && gameRef.current.paddle.x > 0) {
        gameRef.current.paddle.x -= 7;
      }

      // Ball Movement & Collision
      let { x, y, dx, dy } = gameRef.current.ball;

      // Wall Collision
      if (x + dx > canvas.width - BALL_RADIUS || x + dx < BALL_RADIUS) dx = -dx;
      if (y + dy < BALL_RADIUS) dy = -dy;
      else if (y + dy > canvas.height - BALL_RADIUS - 10) {
        // Paddle Collision
        if (x > gameRef.current.paddle.x && x < gameRef.current.paddle.x + PADDLE_WIDTH) {
          dy = -dy;
          // Add some angle based on where it hit the paddle
          const hitPos = (x - (gameRef.current.paddle.x + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
          dx = hitPos * 5;
        } else {
          // Fall
          setLives(l => {
            if (l <= 1) {
              setGameState('ended');
              onGameEnd('failure');
              return 0;
            }
            // Reset ball/paddle
            gameRef.current.ball = { x: canvas.width / 2, y: canvas.height - 30, dx: 4, dy: -4 };
            gameRef.current.paddle.x = (canvas.width - PADDLE_WIDTH) / 2;
            return l - 1;
          });
        }
      }

      // Brick Collision
      gameRef.current.bricks.forEach(b => {
        if (b.status === 1) {
          const brickWidth = (canvas.width - 20) / BRICK_COLS;
          if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + 25) {
            dy = -dy;
            b.status = 0;
            
            // Web Audio API Synthesis for Hit Sound
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = 'square';
              osc.frequency.setValueAtTime(440, audioCtx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.05);
              gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.1);
            } catch (e) {
              console.error("Audio Synthesis failed:", e);
            }
            
            if (b.color === COLORS.RED) {
              setRedBricksRemoved(prev => {
                const newVal = prev + 1;
                if (newVal >= 3) {
                  setGameState('ended');
                  const finalTime = Math.floor((Date.now() - gameRef.current.startTime) / 1000);
                  const minutes = Math.floor(finalTime / 60);
                  const seconds = finalTime % 60;
                  const timeStr = `${minutes}분 ${seconds}초`;
                  onGameEnd('success', timeStr);
                  
                  // Submit to Google Sheets
                  submitScore({
                    name: userName,
                    finishtime: timeStr
                  });
                }
                return newVal;
              });
            }
          }
        }
      });

      gameRef.current.ball = { x: x + dx, y: y + dy, dx, dy };
      
      // Update timer
      const elapsed = Math.floor((Date.now() - gameRef.current.startTime) / 1000);
      setTime(elapsed);
    }

    requestRef.current = requestAnimationFrame(draw);
  }, [gameState, onGameEnd, userName]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [draw]);

  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      gameRef.current.pausedTime = Date.now();
      bgMusicRef.current?.pause();
    } else if (gameState === 'paused') {
      const pauseDuration = Date.now() - gameRef.current.pausedTime;
      gameRef.current.startTime += pauseDuration;
      setGameState('playing');
      bgMusicRef.current?.play();
    }
  };

  return (
    <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8">
      <div className="flex flex-col items-center">
        {/* HUD */}
        <div className="w-full flex justify-between items-center mb-4 px-2 text-white font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase">Lives</span>
            <div className="flex gap-1">
              {[...Array(INITIAL_LIVES)].map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-zinc-800'}`}></div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-500 uppercase">Target (Red)</span>
            <span className="text-xl font-black text-red-400">{redBricksRemoved} / 3</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 uppercase">Time</span>
            <span className="text-xl font-black tabular-nums">{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={500} 
            className="max-w-full h-auto touch-none"
          />

          {/* Overlays */}
          {gameState === 'countdown' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
              <span className="text-8xl font-black text-white animate-ping">{countdown}</span>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-20">
              <h2 className="text-4xl font-black text-white mb-8 italic tracking-tighter">PAUSED</h2>
              <button 
                onClick={togglePause}
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                RESUME
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Side Controls */}
      <div className="flex flex-col gap-4 w-full lg:w-40 lg:mt-14">
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-3">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center mb-1">Controls</h3>
          <button 
            onClick={togglePause}
            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold transition-all text-white flex flex-col items-center justify-center gap-1"
          >
            <span className="text-xs opacity-50 uppercase tracking-tighter">Stop</span>
            {gameState === 'paused' ? '게임재개' : '게임멈추기'}
          </button>
          <button 
            onClick={onQuit}
            className="w-full py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-sm font-bold text-blue-400 transition-all flex flex-col items-center justify-center gap-1"
          >
            <span className="text-xs opacity-50 uppercase tracking-tighter">Restart</span>
            다시 시작
          </button>
          <button 
            onClick={onQuit}
            className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-bold text-red-400 transition-all flex flex-col items-center justify-center gap-1"
          >
            <span className="text-xs opacity-50 uppercase tracking-tighter">Exit</span>
            게임 종료
          </button>
        </div>
        
        {/* Mobile Swipe Tip */}
        <div className="hidden lg:flex p-4 bg-white/5 border border-white/10 rounded-2xl flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-600 uppercase">Movement</span>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px]">←</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px]">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
