import React from 'react';

const Grid = ({ grid, isMinimal = true }) => {
  if (!grid) return (
    <div className={`flex items-center justify-center w-full h-64 font-bold animate-pulse text-lg tracking-widest uppercase ${isMinimal ? 'text-gray-500' : 'text-teal-400 glow-teal'}`}>
      Seeding Ocean...
    </div>
  );

  return (
    <div className={`flex flex-col p-1 gap-0.5 overflow-hidden select-none w-fit mx-auto border ${isMinimal ? 'bg-white border-gray-300 shadow-sm rounded-md' : 'glass-panel bg-black/40'}`}>
      {grid.map((row, y) => (
        <div key={y} className="flex gap-0.5">
          {row.map((cell, x) => (
            <div 
                key={`${x}-${y}`} 
                className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 transition-all duration-300 flex items-center justify-center ${
                    isMinimal
                      ? 'border border-gray-100 bg-gray-50 hover:bg-gray-100'
                      : 'glass-cell hover:bg-white/10'
                } ${
                    !isMinimal && cell === 'fish' ? 'shadow-[inset_0_0_10px_rgba(45,212,191,0.2)]' :
                    !isMinimal && cell === 'shark' ? 'shadow-[inset_0_0_10px_rgba(56,189,248,0.2)]' : ''
                }`}
                title={`(${x},${y}) ${cell}`}
            >
              {cell === 'fish' && <span className={`text-sm sm:text-base md:text-lg drop-shadow-sm ${!isMinimal && 'animate-bounce drop-shadow-lg'}`} style={!isMinimal ? {animationDuration: '3s'} : {}}>🐟</span>}
              {cell === 'shark' && <span className={`text-sm sm:text-base md:text-lg drop-shadow-sm ${!isMinimal && 'animate-pulse drop-shadow-lg'}`} style={!isMinimal ? {animationDuration: '2s'} : {}}>🦈</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
