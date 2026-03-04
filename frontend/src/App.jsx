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
          await fetchState()
          setStats(prev => ({...prev, steps: 0}))
      } catch (err) {
          console.error(err)
      }
  }

  const stepSim = async () => {
      try {
          const res = await axios.post(`${apiUrl}/step`)
          setGrid(res.data.state)
          calculateStats(res.data.state)
          setStats(prev => ({...prev, steps: prev.steps + 1}))
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
      initSim()

      const handleMouseMove = (e) => {
          if (cursorRef.current) {
              cursorRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(14, 165, 233, 0.15), transparent 40%)`;
          }
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [])

  return (
    <div className="min-h-screen text-white p-4 md:p-8 font-sans selection:bg-sky-500/30 overflow-hidden relative">

      {/* Custom Cursor Effect (stylized light following the mouse) */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      />

      <header className="max-w-7xl mx-auto flex flex-col items-center mb-10 text-center relative z-10 pt-4">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2 uppercase drop-shadow-2xl">
          <span className="glow-white font-serif italic pr-2">Wa-Tor</span> <span className="text-sky-200 font-light">Ocean</span>
        </h1>
        <p className="text-sky-300/80 max-w-xl text-sm uppercase tracking-widest font-semibold mt-2">
          Predator-Prey Dynamics Simulator
        </p>
      </header>
      
      <main className="max-w-[90rem] mx-auto flex flex-col xl:flex-row gap-8 items-start justify-center relative z-10">
          {/* Controls Panel */}
          <aside className="w-full xl:w-80 space-y-6 flex-shrink-0">
              <div className="glass-panel p-6">
                <h2 className="text-xl font-bold mb-6 text-center text-sky-100 uppercase tracking-widest border-b border-sky-500/20 pb-4">
                  Command Deck
                </h2>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="wave-btn-container">
                            <button
                                onClick={() => setRunning(!running)}
                                className={`glass-button wave-btn w-full py-3 px-4 uppercase tracking-wider text-sm ${running ? 'btn-coral' : 'btn-ocean'}`}
                            >
                                {running ? 'Halt Flow' : 'Release Tide'}
                            </button>
                        </div>
                        <button 
                          onClick={() => { setRunning(false); stepSim(); }}
                          className="glass-button py-3 px-4 btn-ocean uppercase tracking-wider text-sm"
                        >
                            Step
                        </button>
                    </div>

                    <button
                      onClick={() => { setRunning(false); initSim(); }}
                      className="w-full glass-button py-3 px-4 btn-seafoam uppercase tracking-widest text-sm"
                    >
                        Seed Ocean
                    </button>

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
                    <Grid grid={grid} />
                 </div>
             </div>
          </section>
      </main>
    </div>
  )
}

export default App
