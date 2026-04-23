'use client';

import { useEffect, useState } from 'react';
import { getRankings, RankingData } from '@/lib/googleSheet';

export default function Leaderboard() {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRankings() {
      const data = await getRankings();
      // Sort by score descending
      const sorted = [...data].sort((a, b) => b.score - a.score);
      setRankings(sorted);
      setLoading(false);
    }
    loadRankings();
  }, []);

  return (
    <div className="w-full max-w-md p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Hall of Fame
      </h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.length === 0 ? (
            <p className="text-center text-zinc-400 italic">No records yet. Be the first!</p>
          ) : (
            rankings.map((rank, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  index === 0 ? 'bg-yellow-500/20 border border-yellow-500/40' : 
                  index === 1 ? 'bg-zinc-300/20 border border-zinc-300/40' :
                  index === 2 ? 'bg-amber-600/20 border border-amber-600/40' :
                  'bg-white/5 border border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-black w-6 ${
                    index === 0 ? 'text-yellow-400' : 
                    index === 1 ? 'text-zinc-300' :
                    index === 2 ? 'text-amber-500' :
                    'text-zinc-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold">{rank.name}</p>
                    <p className="text-xs text-zinc-400">{rank.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-blue-400">{rank.score}</p>
                  <p className="text-[10px] text-zinc-500">{rank.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
