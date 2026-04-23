'use client';

import { useEffect, useState } from 'react';
import { getRankings, RankingData } from '@/lib/googleSheet';

export default function Leaderboard() {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRankings() {
      const data = await getRankings();
      
      // Function to convert "M분 S초" to seconds for sorting
      const timeToSeconds = (timeStr: string) => {
        if (!timeStr) return Infinity;
        const match = timeStr.match(/(\d+)분\s*(\d+)초/);
        if (match) {
          return parseInt(match[1]) * 60 + parseInt(match[2]);
        }
        return Infinity;
      };

      // Sort by time ascending (faster is better)
      const sorted = [...data].sort((a, b) => timeToSeconds(a.finishtime) - timeToSeconds(b.finishtime));
      setRankings(sorted.slice(0, 3)); // Only Top 3 as requested
      setLoading(false);
    }
    loadRankings();
  }, []);

  return (
    <div className="w-full max-w-sm p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl text-white">
      <h2 className="text-xl font-black mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent italic tracking-tighter">
        TOP 3 SPEEDRUNNERS
      </h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/50"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {rankings.length === 0 ? (
            <p className="text-center text-zinc-500 italic text-xs py-2">No records yet.</p>
          ) : (
            rankings.map((rank, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-2 px-3 rounded-xl transition-all duration-300 ${
                  index === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : 
                  index === 1 ? 'bg-zinc-300/10 border border-zinc-300/30' :
                  'bg-amber-600/10 border border-amber-600/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-black w-6 ${
                    index === 0 ? 'text-yellow-400' : 
                    index === 1 ? 'text-zinc-300' :
                    'text-amber-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex flex-col">
                    <p className="font-bold text-white text-sm truncate max-w-[150px] leading-tight">{rank.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-blue-400 font-mono italic">{rank.finishtime}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
