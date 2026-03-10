import React from 'react';

const Grid = ({ grid, isMinimal = true }) => {
  if (!grid) return (
    <div className="flex items-center justify-center w-full h-64 text-cyan-500 font-bold animate-pulse glow-cyan">
      GENERATING ECOSYSTEM...
    </div>
  );

  return (
    <div className="flex flex-col neo-container p-2 gap-1 overflow-hidden select-none bg-[#121212]">
      {grid.map((row, y) => (
        <div key={y} className="flex gap-1">
          {row.map((cell, x) => (
            <div 
                key={`${x}-${y}`} 
                className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-300 ${cell === 'water' ? 'neo-cell' : 'neo-cell'}`}
                title={`(${x},${y}) ${cell}`}
            >
              {cell === 'fish' && (isMinimal ? <span className="text-xl md:text-2xl drop-shadow-md">🐟</span> : <div className="shape-x drop-shadow-md animate-pulse"></div>)}
              {cell === 'shark' && (isMinimal ? <span className="text-xl md:text-2xl drop-shadow-md">🦈</span> : <div className="shape-o drop-shadow-md animate-pulse" style={{animationDuration: '2s'}}></div>)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
