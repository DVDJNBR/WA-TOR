import { loadPyodide } from 'https://cdn.jsdelivr.net/npm/pyodide@314.0.3/pyodide.mjs'

const PY_FILES = [
  'models/fish.py',
  'models/grid.py',
  'models/tuna.py',
  'models/shark.py',
  'simulation.py',
]

async function loadWatorPackage(pyodide) {
  pyodide.FS.mkdirTree('models')
  for (const path of PY_FILES) {
    const code = await (await fetch(`/${path}`)).text()
    pyodide.FS.writeFile(path, code)
  }
}

async function main() {
  const pyodide = await loadPyodide()
  await loadWatorPackage(pyodide)

  const Simulation = pyodide.pyimport('simulation').Simulation
  const sim = Simulation.callKwargs({
    width: 10,
    height: 10,
    num_tuna: 20,
    num_sharks: 5,
    tuna_breed_time: 3,
    shark_breed_time: 10,
    shark_start_energy: 5,
    energy_per_tuna: 3,
  })

  sim.step()
  console.log('tour', sim.tour)
  console.log('tuna', sim.tuna_list.length)
  console.log('sharks', sim.shark_list.length)
}

main()
