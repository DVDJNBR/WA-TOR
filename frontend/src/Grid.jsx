import React from 'react';

const Grid = ({ grid }) => {
  if (!grid) return (
    <div className="flex items-center justify-center w-full h-64 text-blue-300 font-bold animate-pulse">
      GENERATING ECOSYSTEM...
    </div>
  );

  return (
    <div className="flex flex-col bg-[#001b3a] shadow-2xl overflow-hidden select-none">
      {grid.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <div 
                key={`${x}-${y}`} 
                className={`w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs transition-all duration-300 border-[0.5px] border-white/5
                    ${cell === 'water' ? 'bg-blue-900/40' : 
                      cell === 'fish' ? 'bg-cyan-500/20 shadow-[inset_0_0_10px_rgba(6,182,212,0.3)]' : 
                      'bg-red-500/20 shadow-[inset_0_0_10px_rgba(239,68,68,0.3)]'}`}
                title={`(${x},${y}) ${cell}`}
            >
              {cell === 'fish' && <span className="drop-shadow-md animate-bounce" style={{animationDuration: '3s'}}>🐟</span>}
              {cell === 'shark' && <span className="drop-shadow-md animate-pulse">🦈</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
