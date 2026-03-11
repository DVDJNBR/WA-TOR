import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Grid from './Grid'

function App() {
  const [grid, setGrid] = useState(null)
  const [running, setRunning] = useState(false)
  const [stats, setStats] = useState({ fish: 0, shark: 0, steps: 0 })
  const intervalRef = useRef(null)
  const [speed, setSpeed] = useState(150)
  const cursorRef = useRef(null)
  const [isMinimalDesign, setIsMinimalDesign] = useState(true)

  // Simulation Parameters
  const [params, setParams] = useState({
      width: 40,
      height: 25,
      num_fish: 150,
      num_sharks: 15,
      fish_breed_time: 3,
      shark_breed_time: 12,
      shark_starve_time: 3
  })

  // Use relative path for production (proxied by Nginx)
  const apiUrl = '/api'; 

  const fetchState = async () => {
    try {
      const res = await axios.get(`${apiUrl}/state`)
      setGrid(res.data.state)
      calculateStats(res.data.state)
    } catch (err) {
      console.error(err)
    }
  }

  const calculateStats = (gridData) => {
      let f = 0, s = 0;
      gridData.forEach(row => {
          row.forEach(cell => {
              if (cell === 'fish') f++;
              if (cell === 'shark') s++;
          })
      })
      setStats(prev => ({ ...prev, fish: f, shark: s }))
  }

  const initSim = async () => {
      try {
          await axios.post(`${apiUrl}/init`, params)
          fetchState()
      } catch (err) {
          console.error(err)
      }
  }

  const stepSim = async () => {
      try {
          await axios.post(`${apiUrl}/step`)
          fetchState()
          setStats(prev => ({ ...prev, steps: prev.steps + 1 }))
      } catch (err) {
          console.error(err)
      }
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(stepSim, speed)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, speed])

  useEffect(() => {
      if (running && stats.steps > 0 && (stats.fish === 0 || stats.shark === 0)) {
          setRunning(false);
      }
  }, [stats, running]);

  useEffect(() => {
      initSim()

      const handleMouseMove = (e) => {
          if (!isMinimalDesign && cursorRef.current) {
              cursorRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(14, 165, 233, 0.15), transparent 40%)`;
          }
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMinimalDesign])

  useEffect(() => {
      document.body.className = isMinimalDesign ? 'theme-minimal' : 'theme-premium';
  }, [isMinimalDesign]);

  if (isMinimalDesign) {
      return (
          <div className="min-h-screen font-sans overflow-hidden flex flex-col items-center">
              <header className="w-full text-center py-6">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 uppercase">Wa-Tor Simulation</h1>
              </header>

              <main className="max-w-[90rem] mx-auto flex flex-col xl:flex-row gap-8 items-start justify-center relative z-10 flex-grow px-4 pb-12">
                  <aside className="w-full xl:w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-shrink-0 flex flex-col">
                      <h2 className="text-sm font-semibold text-gray-700 uppercase mb-4 text-center">Controls</h2>

                      <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                              <button
                                  onClick={() => setRunning(!running)}
                                  className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${running ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                              >
                                  {running ? 'STOP' : 'START'}
                              </button>
                              <button
                                  onClick={() => { setRunning(false); stepSim(); }}
                                  className="w-full py-2 px-3 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                              >
                                  STEP
                              </button>
                          </div>

                          <button
                              onClick={() => { setRunning(false); initSim(); }}
                              className="w-full py-2 px-3 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                              Reset
                          </button>

                          <div className="pt-4 border-t border-gray-100 space-y-2">
                              <div className="flex justify-between text-xs text-gray-500">
                                  <span>Speed</span>
                                  <span>{speed}ms</span>
                              </div>
                              <input
                                  type="range" min="30" max="2000" step="10"
                                  value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                          </div>

                          <div className="pt-4 border-t border-gray-100">
                              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Parameters</h3>
                              <div className="space-y-3 text-xs">
                                  <div className="flex justify-between items-center">
                                      <label className="text-gray-600">Fish Init</label>
                                      <input type="number" value={params.num_fish} onChange={e => setParams({...params, num_fish: parseInt(e.target.value)})} className="w-16 px-2 py-1 border border-gray-300 rounded" />
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <label className="text-gray-600">Shark Init</label>
                                      <input type="number" value={params.num_sharks} onChange={e => setParams({...params, num_sharks: parseInt(e.target.value)})} className="w-16 px-2 py-1 border border-gray-300 rounded" />
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <label className="text-gray-600">Fish Breed</label>
                                      <input type="number" value={params.fish_breed_time} onChange={e => setParams({...params, fish_breed_time: parseInt(e.target.value)})} className="w-16 px-2 py-1 border border-gray-300 rounded" />
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <label className="text-gray-600">Shark Breed</label>
                                      <input type="number" value={params.shark_breed_time} onChange={e => setParams({...params, shark_breed_time: parseInt(e.target.value)})} className="w-16 px-2 py-1 border border-gray-300 rounded" />
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <label className="text-gray-600">Shark Starve</label>
                                      <input type="number" value={params.shark_starve_time} onChange={e => setParams({...params, shark_starve_time: parseInt(e.target.value)})} className="w-16 px-2 py-1 border border-gray-300 rounded" />
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <label className="text-gray-600">Width</label>
                                      <input type="number" value={params.width} onChange={e => setParams({...params, width: parseInt(e.target.value)})} className="w-16 px-2 py-1 border border-gray-300 rounded" />
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <label className="text-gray-600">Height</label>
                                      <input type="number" value={params.height} onChange={e => setParams({...params, height: parseInt(e.target.value)})} className="w-16 px-2 py-1 border border-gray-300 rounded" />
                                  </div>
                              </div>
                          </div>
                      </div>

                      <button
                          onClick={() => setIsMinimalDesign(false)}
                          className="glass-button w-full py-3 px-4 text-purple-300 uppercase tracking-widest text-sm relative wave-btn mt-auto border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/60"
                      >
                          Switch to Premium
                      </button>
                  </aside>

                  <section className="flex-1 space-y-6 flex flex-col items-center w-full max-w-5xl">
                      <div className="flex gap-4 w-full mb-6 justify-center">
                          <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 text-center flex-1 max-w-[150px]">
                              <div className="text-xs text-gray-500 uppercase">Fish</div>
                              <div className="text-xl font-bold text-gray-900">{stats.fish}</div>
                          </div>
                          <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 text-center flex-1 max-w-[150px]">
                              <div className="text-xs text-gray-500 uppercase">Sharks</div>
                              <div className="text-xl font-bold text-gray-900">{stats.shark}</div>
                          </div>
                          <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 text-center flex-1 max-w-[150px]">
                              <div className="text-xs text-gray-500 uppercase">Cycle</div>
                              <div className="text-xl font-bold text-gray-900">{stats.steps}</div>
                          </div>
                      </div>
                      <div className="bg-gray-50 p-6 flex justify-center w-full overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                          <div className="overflow-auto max-w-full max-h-[70vh] rounded-lg relative z-10 scrollbar-thin">
                              <Grid grid={grid} isMinimal={true} />
                          </div>
                      </div>
                  </section>
              </main>

              <footer className="mt-auto py-6 relative z-10 flex justify-center gap-6 text-gray-500 text-xs">
                 <div className="relative group">
                   <button className="uppercase hover:text-gray-800 transition-colors">How To</button>
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 bg-white border border-gray-200 rounded shadow-lg text-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                     <p className="font-bold mb-2 border-b border-gray-100 pb-1">Rules of the Ocean</p>
                     <ul className="list-disc pl-4 space-y-1 text-[11px]">
                       <li><strong>Fish:</strong> Move randomly to adjacent empty spaces. Breed after surviving a set number of cycles.</li>
                       <li><strong>Sharks:</strong> Seek out adjacent fish to eat, otherwise move randomly. Breed after surviving a set number of cycles. Starve if they don't eat within their starvation limit.</li>
                     </ul>
                   </div>
                 </div>
                 <div className="relative group">
                   <button className="uppercase hover:text-gray-800 transition-colors">About</button>
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 bg-white border border-gray-200 rounded shadow-lg text-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                     <p className="font-bold mb-2 border-b border-gray-100 pb-1 text-left">Wa-Tor Simulation</p>
                     <p className="mb-2 text-left">A population dynamics simulation devised by A.K. Dewdney, originally presented in Scientific American (1984).</p>
                   </div>
                 </div>
                 <a href="https://github.com/DVDJNBR/WA-TOR" target="_blank" rel="noopener noreferrer" className="uppercase hover:text-gray-800 transition-colors">
                    Source
                 </a>
              </footer>
          </div>
      )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans selection:bg-sky-500/30 overflow-hidden relative flex flex-col">

      {/* Custom Cursor Effect (stylized light following the mouse) */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      />

      <header className="max-w-7xl mx-auto flex flex-col items-center mb-10 text-center relative z-10 pt-4">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2 uppercase drop-shadow-2xl">
          <span className="glow-white font-serif italic pr-2">Wa-Tor</span> <span className="text-sky-200 font-light">Ocean</span>
        </h1>
      </header>
      
      <main className="max-w-[90rem] mx-auto flex flex-col xl:flex-row gap-8 items-start justify-center relative z-10 flex-grow">
          {/* Controls Panel */}
          <aside className="w-full xl:w-80 space-y-6 flex-shrink-0 flex flex-col">
              <div className="glass-panel p-6 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-6 text-center text-sky-100 uppercase tracking-widest border-b border-sky-500/20 pb-4">
                  Command Deck
                </h2>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="wave-btn-container">
                            <button
                              onClick={() => setRunning(!running)}
                              className={`glass-button w-full py-3 px-4 uppercase tracking-widest text-sm relative wave-btn ${running ? 'btn-coral' : 'btn-seafoam'}`}
                            >
                                {running ? 'Halt' : 'Simulate'}
                            </button>
                        </div>
                        <div className="wave-btn-container">
                            <button
                              onClick={() => { setRunning(false); stepSim(); }}
                              className="glass-button w-full py-3 px-4 btn-ocean uppercase tracking-widest text-sm relative wave-btn"
                            >
                                Advance
                            </button>
                        </div>
                    </div>

                    <div className="wave-btn-container">
                        <button
                          onClick={() => { setRunning(false); initSim(); }}
                          className="glass-button w-full py-3 px-4 text-sky-200 uppercase tracking-widest text-sm relative wave-btn"
                        >
                            Seed Ocean
                        </button>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-sky-500/20">
                        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                            <span className="text-sky-300/70">Current Velocity</span>
                            <span className="glow-blue">{speed}ms</span>
                        </div>
                        <input 
                          type="range" min="30" max="2000" step="10"
                          value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                          className="glass-slider w-full"
                        />
                    </div>

                    <div className="pt-6 border-t border-sky-500/20">
                        <h3 className="font-bold mb-4 text-sky-200 uppercase tracking-wider text-xs text-center">
                           Ecosystem Parameters
                        </h3>
                        <div className="space-y-5 text-sm font-semibold">
                            <div className="space-y-2">
                               <label className="text-sky-300/60 block uppercase text-[10px] tracking-widest">Initial Population</label>
                               <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase glow-teal mb-1">Fish 🐟</span>
                                      <input type="number" value={params.num_fish} 
                                        onChange={e => setParams({...params, num_fish: parseInt(e.target.value)})}
                                        className="glass-input w-full text-teal-200" />
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase glow-coral mb-1">Sharks 🦈</span>
                                      <input type="number" value={params.num_sharks} 
                                        onChange={e => setParams({...params, num_sharks: parseInt(e.target.value)})}
                                        className="glass-input w-full text-orange-200" />
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-sky-300/60 block uppercase text-[10px] tracking-widest">Breeding Cycle</label>
                               <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase glow-teal mb-1">Fish</span>
                                      <input type="number" value={params.fish_breed_time}
                                        onChange={e => setParams({...params, fish_breed_time: parseInt(e.target.value)})}
                                        className="glass-input w-full text-teal-200" />
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase glow-coral mb-1">Sharks</span>
                                      <input type="number" value={params.shark_breed_time}
                                        onChange={e => setParams({...params, shark_breed_time: parseInt(e.target.value)})}
                                        className="glass-input w-full text-orange-200" />
                                  </div>
                               </div>
                            </div>

                            <div className="flex flex-col items-center">
                               <label className="text-sky-300/60 uppercase text-[10px] tracking-widest mb-1">Shark Starvation Cycle</label>
                               <input type="number" value={params.shark_starve_time}
                                  onChange={e => setParams({...params, shark_starve_time: parseInt(e.target.value)})}
                                  className="glass-input w-full text-orange-200 max-w-[50%]" />
                            </div>

                            <div className="space-y-2">
                               <label className="text-sky-300/60 block uppercase text-[10px] tracking-widest">Ocean Dimensions</label>
                               <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase text-sky-200 mb-1">Width</span>
                                      <input type="number" value={params.width} 
                                          onChange={e => setParams({...params, width: parseInt(e.target.value)})}
                                          className="glass-input w-full" />
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase text-sky-200 mb-1">Height</span>
                                      <input type="number" value={params.height} 
                                          onChange={e => setParams({...params, height: parseInt(e.target.value)})}
                                          className="glass-input w-full" />
                                  </div>
                               </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsMinimalDesign(true)}
                        className="w-full py-2 px-3 rounded text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors mt-auto uppercase tracking-widest"
                    >
                        Switch to Minimal
                    </button>
                </div>
              </div>
          </aside>

          {/* Visualization Section */}
          <section className="flex-1 space-y-6 flex flex-col items-center w-full max-w-5xl">
             <div className="grid grid-cols-3 gap-6 w-full">
                 <div className="glass-panel p-4 flex flex-col items-center justify-center">
                    <span className="text-[11px] text-teal-300/70 uppercase font-bold tracking-widest mb-1">Fish Population</span>
                    <span className="text-3xl font-black glow-teal drop-shadow-lg">{stats.fish}</span>
                 </div>
                 <div className="glass-panel p-4 flex flex-col items-center justify-center">
                    <span className="text-[11px] text-orange-300/70 uppercase font-bold tracking-widest mb-1">Shark Population</span>
                    <span className="text-3xl font-black glow-coral drop-shadow-lg">{stats.shark}</span>
                 </div>
                 <div className="glass-panel p-4 flex flex-col items-center justify-center">
                    <span className="text-[11px] text-sky-200/70 uppercase font-bold tracking-widest mb-1">Current Cycle</span>
                    <span className="text-3xl font-black glow-white drop-shadow-lg">{stats.steps}</span>
                 </div>
             </div>
             
             <div className="glass-panel p-6 flex justify-center w-full overflow-hidden shadow-2xl shadow-sky-900/50">
                 <div className="overflow-auto max-w-full max-h-[70vh] rounded-lg relative z-10 scrollbar-thin">
                    <Grid grid={grid} isMinimal={false} />
                 </div>
             </div>
          </section>
      </main>

      {/* Footer Navigation (About, How To, Source) */}
      <footer className="mt-12 py-6 relative z-10 flex justify-center gap-6">
        <div className="relative group">
           <button className="glass-button px-6 py-2 uppercase tracking-widest text-xs btn-ocean">How To</button>
           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 glass-panel text-xs text-sky-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
             <p className="font-bold mb-2 border-b border-sky-500/30 pb-1 text-left">Rules of the Ocean</p>
             <ul className="list-disc pl-4 space-y-1 text-[11px] text-left">
               <li><strong className="text-teal-300">Fish:</strong> Move randomly to adjacent empty spaces. Breed after surviving a set number of cycles.</li>
               <li><strong className="text-orange-300">Sharks:</strong> Seek out adjacent fish to eat, otherwise move randomly. Breed after surviving a set number of cycles. Starve if they don't eat within their starvation limit.</li>
             </ul>
             <p className="mt-2 text-[10px] text-sky-300/70 italic text-left">The goal is to find the perfect parameter balance to achieve an infinite, stable ecosystem.</p>
           </div>
        </div>

        <div className="relative group">
           <button className="glass-button px-6 py-2 uppercase tracking-widest text-xs btn-seafoam">About</button>
           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 glass-panel text-xs text-sky-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
             <p className="font-bold mb-2 border-b border-sky-500/30 pb-1 text-left">Wa-Tor Simulation</p>
             <p className="mb-2 text-left">A population dynamics simulation devised by A.K. Dewdney, originally presented in Scientific American (1984).</p>
             <p className="text-left">This application models the fragile balance of a predator-prey ecosystem, demonstrating how populations fluctuate interdependently over time.</p>
           </div>
        </div>

        <a href="https://github.com/DVDJNBR/WA-TOR" target="_blank" rel="noopener noreferrer" className="glass-button px-6 py-2 uppercase tracking-widest text-xs btn-coral flex items-center justify-center">
           Source
        </a>
      </footer>
    </div>
  )
}

export default App
