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
    <div className="min-h-screen bg-[#001b3a] text-white p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto flex flex-col items-center mb-10 text-center">
        <div className="bg-blue-600/30 px-6 py-2 rounded-full border border-blue-400/30 mb-4 animate-pulse">
           <span className="text-blue-200 font-bold uppercase tracking-widest text-sm">Nausicaá - 40 Years Anniversary Edition</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-2xl">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">WA-TOR</span> SIMULATION
        </h1>
        <p className="text-blue-200/70 max-w-xl">
          Exploring the delicate balance between predators and prey in our oceans. 
          A mathematical model of biological population dynamics.
        </p>
      </header>
      
      <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Controls Panel */}
          <aside className="lg:w-80 space-y-6">
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="p-2 bg-blue-500 rounded-lg">⚙️</span> Control Hub
                </h2>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setRunning(!running)}
                          className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2
                              ${running ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 shadow-lg' : 'bg-green-500 hover:bg-green-600 shadow-green-500/20 shadow-lg'}`}
                        >
                            {running ? 'Stop 🛑' : 'Start ▶️'}
                        </button>
                        <button 
                          onClick={() => { setRunning(false); initSim(); }}
                          className="py-3 px-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Reset 🔄
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-blue-300">Simulation Speed</span>
                            <span className="text-cyan-300">{speed}ms</span>
                        </div>
                        <input 
                          type="range" min="30" max="1000" step="10" 
                          value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                           🧪 Parameters
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="space-y-1">
                               <label className="text-blue-300/70 block">Population</label>
                               <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                      <span className="text-[10px] block uppercase text-blue-200/50">Fish</span>
                                      <input type="number" value={params.num_fish} 
                                        onChange={e => setParams({...params, num_fish: parseInt(e.target.value)})}
                                        className="bg-transparent w-full focus:outline-none text-blue-300 font-bold" />
                                  </div>
                                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                      <span className="text-[10px] block uppercase text-blue-200/50">Sharks</span>
                                      <input type="number" value={params.num_sharks} 
                                        onChange={e => setParams({...params, num_sharks: parseInt(e.target.value)})}
                                        className="bg-transparent w-full focus:outline-none text-blue-300 font-bold" />
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-1">
                               <label className="text-blue-300/70 block">Breeding Time</label>
                               <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                      <span className="text-[10px] block uppercase text-blue-200/50">Fish</span>
                                      <input type="number" value={params.fish_breed_time}
                                        onChange={e => setParams({...params, fish_breed_time: parseInt(e.target.value)})}
                                        className="bg-transparent w-full focus:outline-none text-blue-300 font-bold" />
                                  </div>
                                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                      <span className="text-[10px] block uppercase text-blue-200/50">Sharks</span>
                                      <input type="number" value={params.shark_breed_time}
                                        onChange={e => setParams({...params, shark_breed_time: parseInt(e.target.value)})}
                                        className="bg-transparent w-full focus:outline-none text-blue-300 font-bold" />
                                  </div>
                               </div>
                            </div>

                            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                               <label className="text-[10px] block uppercase text-blue-200/50">Shark Starve Time</label>
                               <input type="number" value={params.shark_starve_time}
                                  onChange={e => setParams({...params, shark_starve_time: parseInt(e.target.value)})}
                                  className="bg-transparent w-full focus:outline-none text-blue-300 font-bold" />
                            </div>

                            <div className="space-y-1">
                               <label className="text-blue-300/70 block">Aquarium Size</label>
                               <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex gap-2 items-center">
                                      <span className="text-[10px] uppercase text-blue-200/50">W</span>
                                      <input type="number" value={params.width} 
                                          onChange={e => setParams({...params, width: parseInt(e.target.value)})}
                                          className="bg-transparent w-full focus:outline-none text-blue-300 font-bold" />
                                  </div>
                                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex gap-2 items-center">
                                      <span className="text-[10px] uppercase text-blue-200/50">H</span>
                                      <input type="number" value={params.height} 
                                          onChange={e => setParams({...params, height: parseInt(e.target.value)})}
                                          className="bg-transparent w-full focus:outline-none text-blue-300 font-bold" />
                                  </div>
                               </div>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
          </aside>

          {/* Visualization Section */}
          <section className="flex-1 space-y-6">
             <div className="grid grid-cols-3 gap-4">
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                    <span className="text-sm text-blue-300/60 uppercase font-bold tracking-tighter">Population Fish</span>
                    <span className="text-3xl font-black text-cyan-300">🐟 {stats.fish}</span>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                    <span className="text-sm text-blue-300/60 uppercase font-bold tracking-tighter">Population Shark</span>
                    <span className="text-3xl font-black text-red-400">🦈 {stats.shark}</span>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                    <span className="text-sm text-blue-300/60 uppercase font-bold tracking-tighter">Cycle Number</span>
                    <span className="text-3xl font-black text-blue-400">⏱️ {stats.steps}</span>
                 </div>
             </div>
             
             <div className="bg-black/20 p-6 rounded-3xl border border-white/5 shadow-inner flex justify-center backdrop-blur-sm relative overflow-hidden group">
                 {/* Background Glows */}
                 <div className="absolute top-0 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                 <div className="absolute bottom-0 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                 
                 <div className="overflow-auto max-w-full max-h-[70vh] rounded-xl border border-white/10 relative z-10 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-white/5">
                    <Grid grid={grid} />
                 </div>
             </div>
          </section>
      </main>

      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-blue-300/30 text-xs">
          Nausicaá Wa-Tor Simulation Prototype • Interactive Environment Study • 2026
      </footer>
    </div>
  )
}

export default App
