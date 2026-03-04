import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Grid from './Grid'

function App() {
  const [grid, setGrid] = useState(null)
  const [running, setRunning] = useState(false)
  const [stats, setStats] = useState({ fish: 0, shark: 0, steps: 0 })
  const intervalRef = useRef(null)
  const [speed, setSpeed] = useState(150)

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
  }, [])

  return (
    <div className="min-h-screen bg-[#121212] text-[#e0e0e0] p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      <header className="max-w-7xl mx-auto flex flex-col items-center mb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2 uppercase">
          <span className="glow-white">WA-TOR</span> <span className="text-[#333]">SIM</span>
        </h1>
        <p className="text-[#888] max-w-xl text-sm uppercase tracking-widest font-semibold">
          Ecosystem Dynamics
        </p>
      </header>
      
      <main className="max-w-[90rem] mx-auto flex flex-col xl:flex-row gap-8 items-start justify-center">
          {/* Controls Panel */}
          <aside className="w-full xl:w-80 space-y-6 flex-shrink-0">
              <div className="neo-container p-6">
                <h2 className="text-xl font-bold mb-6 text-center text-[#e0e0e0] uppercase tracking-widest">
                  Controls
                </h2>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setRunning(!running)}
                          className={`neo-button py-3 px-4 ${running ? 'btn-red' : 'btn-green'}`}
                        >
                            {running ? 'STOP' : 'START'}
                        </button>
                        <button 
                          onClick={() => { setRunning(false); stepSim(); }}
                          className="neo-button py-3 px-4 btn-cyan"
                        >
                            STEP
                        </button>
                    </div>

                    <button
                      onClick={() => { setRunning(false); initSim(); }}
                      className="w-full neo-button py-3 px-4 btn-blue uppercase tracking-widest text-sm"
                    >
                        Reset Universe
                    </button>

                    <div className="space-y-3 pt-4 border-t border-[#333]">
                        <div className="flex justify-between text-sm font-semibold uppercase tracking-wider">
                            <span className="text-[#888]">Speed Delay</span>
                            <span className="glow-cyan">{speed}ms</span>
                        </div>
                        <input 
                          type="range" min="30" max="2000" step="10"
                          value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                          className="neo-slider w-full"
                        />
                    </div>

                    <div className="pt-6 border-t border-[#333]">
                        <h3 className="font-bold mb-4 text-[#888] uppercase tracking-wider text-sm text-center">
                           Parameters
                        </h3>
                        <div className="space-y-4 text-sm font-semibold">
                            <div className="space-y-2">
                               <label className="text-[#666] block uppercase text-xs tracking-wider">Population</label>
                               <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase glow-cyan mb-1">Fish</span>
                                      <input type="number" value={params.num_fish} 
                                        onChange={e => setParams({...params, num_fish: parseInt(e.target.value)})}
                                        className="neo-input w-full glow-cyan" />
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase glow-orange mb-1">Sharks</span>
                                      <input type="number" value={params.num_sharks} 
                                        onChange={e => setParams({...params, num_sharks: parseInt(e.target.value)})}
                                        className="neo-input w-full glow-orange" />
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-[#666] block uppercase text-xs tracking-wider">Breeding Time</label>
                               <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase glow-cyan mb-1">Fish</span>
                                      <input type="number" value={params.fish_breed_time}
                                        onChange={e => setParams({...params, fish_breed_time: parseInt(e.target.value)})}
                                        className="neo-input w-full glow-cyan" />
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase glow-orange mb-1">Sharks</span>
                                      <input type="number" value={params.shark_breed_time}
                                        onChange={e => setParams({...params, shark_breed_time: parseInt(e.target.value)})}
                                        className="neo-input w-full glow-orange" />
                                  </div>
                               </div>
                            </div>

                            <div className="flex flex-col items-center">
                               <label className="text-[#666] uppercase text-xs tracking-wider mb-1">Shark Starve Time</label>
                               <input type="number" value={params.shark_starve_time}
                                  onChange={e => setParams({...params, shark_starve_time: parseInt(e.target.value)})}
                                  className="neo-input w-full glow-orange" />
                            </div>

                            <div className="space-y-2">
                               <label className="text-[#666] block uppercase text-xs tracking-wider">Grid Size</label>
                               <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase text-[#888] mb-1">Width</span>
                                      <input type="number" value={params.width} 
                                          onChange={e => setParams({...params, width: parseInt(e.target.value)})}
                                          className="neo-input w-full" />
                                  </div>
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] uppercase text-[#888] mb-1">Height</span>
                                      <input type="number" value={params.height} 
                                          onChange={e => setParams({...params, height: parseInt(e.target.value)})}
                                          className="neo-input w-full" />
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
                 <div className="neo-container p-4 flex flex-col items-center justify-center">
                    <span className="text-xs text-[#666] uppercase font-bold tracking-widest mb-1">Fish</span>
                    <span className="text-2xl font-black glow-cyan">{stats.fish}</span>
                 </div>
                 <div className="neo-container p-4 flex flex-col items-center justify-center">
                    <span className="text-xs text-[#666] uppercase font-bold tracking-widest mb-1">Sharks</span>
                    <span className="text-2xl font-black glow-orange">{stats.shark}</span>
                 </div>
                 <div className="neo-container p-4 flex flex-col items-center justify-center">
                    <span className="text-xs text-[#666] uppercase font-bold tracking-widest mb-1">Cycle</span>
                    <span className="text-2xl font-black glow-white">{stats.steps}</span>
                 </div>
             </div>
             
             <div className="neo-container p-6 flex justify-center w-full overflow-hidden">
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
