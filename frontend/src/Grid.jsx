import React from 'react';

const Grid = ({ grid }) => {
  if (!grid) return (
    <div className="flex items-center justify-center w-full h-64 text-teal-400 font-bold animate-pulse glow-teal text-lg tracking-widest uppercase">
      Seeding Ocean...
    </div>
  );

  return (
    <div className="flex flex-col glass-panel p-3 gap-1 overflow-hidden select-none bg-black/40">
      {grid.map((row, y) => (
        <div key={y} className="flex gap-1">
          {row.map((cell, x) => (
            <div 
                key={`${x}-${y}`} 
                className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-300 glass-cell hover:bg-white/10 ${
                    cell === 'fish' ? 'shadow-[inset_0_0_10px_rgba(45,212,191,0.2)]' :
                    cell === 'shark' ? 'shadow-[inset_0_0_10px_rgba(56,189,248,0.2)]' : ''
                }`}
                title={`(${x},${y}) ${cell}`}
            >
              {cell === 'fish' && <span className="drop-shadow-lg text-lg animate-bounce" style={{animationDuration: '3s'}}>🐟</span>}
              {cell === 'shark' && <span className="drop-shadow-lg text-lg animate-pulse" style={{animationDuration: '2s'}}>🦈</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
