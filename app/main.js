import { loadPyodide } from 'https://cdn.jsdelivr.net/npm/pyodide@314.0.3/pyodide.mjs'

const params = {
  width: 30,
  height: 20,
  num_tuna: 80,
  num_sharks: 10,
  tuna_breed_time: 3,
  shark_breed_time: 12,
  shark_start_energy: 3,
  energy_per_tuna: 3,
}

let speed = 150
let running = false
let intervalId = null
let steps = 0
let pyodide = null
let Simulation = null
let sim = null

const app = document.getElementById('app')

app.innerHTML = `
  <div class="wrap">
    <div class="title">Wa-Tor</div>
    <div id="loading" class="loading">loading Python runtime…</div>
    <div id="sim" class="hidden">
      <div class="params">
        ${paramRow('num_tuna', 'tuna')}
        ${paramRow('num_sharks', 'sharks')}
        ${paramRow('tuna_breed_time', 'tuna breeding')}
        ${paramRow('shark_breed_time', 'shark breeding')}
        ${paramRow('shark_start_energy', 'shark start energy')}
        ${paramRow('energy_per_tuna', 'energy per tuna')}
        ${paramRow('width', 'width')}
        ${paramRow('height', 'height')}
      </div>
      <div class="params-row">
        <label for="speed">speed</label>
        <input type="range" id="speed" min="30" max="1000" step="10" value="${speed}" />
      </div>
      <div class="controls">
        <button id="toggle">start</button>
        <button id="step">step</button>
        <button id="reset">reset</button>
      </div>
      <div class="status">
        <span>tuna 🐟 <strong id="tuna-count">0</strong></span>
        <span>sharks 🦈 <strong id="shark-count">0</strong></span>
        <span>step <strong id="step-count">0</strong></span>
      </div>
      <div id="grid" class="grid"></div>
    </div>
    <div class="links">
      <span class="about" data-tooltip="A predator/prey simulation: find the balance where tuna and sharks both survive long-term. Tuna 🐟 breed on empty cells; sharks 🦈 hunt tuna, breed, and starve without food.">about</span>
      <a class="source" href="https://github.com/DVDJNBR/WA-TOR" target="_blank" rel="noopener">source</a>
    </div>
  </div>
`

function paramRow(key, label) {
  return `
    <div class="params-row">
      <label for="${key}">${label}</label>
      <input type="number" id="${key}" value="${params[key]}" />
    </div>
  `
}

const loadingEl = document.getElementById('loading')
const simEl = document.getElementById('sim')
const gridEl = document.getElementById('grid')
const tunaCountEl = document.getElementById('tuna-count')
const sharkCountEl = document.getElementById('shark-count')
const stepCountEl = document.getElementById('step-count')
const toggleBtn = document.getElementById('toggle')
const stepBtn = document.getElementById('step')
const resetBtn = document.getElementById('reset')
const speedInput = document.getElementById('speed')

for (const key of Object.keys(params)) {
  const input = document.getElementById(key)
  input.addEventListener('change', (e) => {
    const value = parseInt(e.target.value, 10)
    if (!Number.isNaN(value)) {
      params[key] = value
    }
    e.target.value = params[key]
  })
}

speedInput.addEventListener('input', (e) => {
  speed = parseInt(e.target.value, 10)
  if (running) {
    stop()
    start()
  }
})

toggleBtn.addEventListener('click', () => (running ? stop() : start()))
stepBtn.addEventListener('click', () => {
  stop()
  stepSim()
})
resetBtn.addEventListener('click', () => {
  stop()
  steps = 0
  stepCountEl.textContent = steps
  initSim()
})

function start() {
  running = true
  toggleBtn.textContent = 'pause'
  intervalId = setInterval(stepSim, 1030 - speed)
}

function stop() {
  running = false
  toggleBtn.textContent = 'start'
  clearInterval(intervalId)
}

function renderGrid(state) {
  gridEl.innerHTML = state
    .map(
      (row) =>
        `<div class="row">${row
          .map((cell) => `<div class="cell">${cell === 'tuna' ? '🐟' : cell === 'shark' ? '🦈' : ''}</div>`)
          .join('')}</div>`
    )
    .join('')

  let tuna = 0
  let sharks = 0
  for (const row of state) {
    for (const cell of row) {
      if (cell === 'tuna') tuna++
      if (cell === 'shark') sharks++
    }
  }
  tunaCountEl.textContent = tuna
  sharkCountEl.textContent = sharks

  if (running && steps > 0 && (tuna === 0 || sharks === 0)) {
    stop()
  }
}

function getState() {
  const proxy = sim.grid.to_rows()
  const state = proxy.toJs()
  proxy.destroy()
  return state
}

function initSim() {
  sim = Simulation.callKwargs(params)
  renderGrid(getState())
}

function stepSim() {
  sim.step()
  steps++
  stepCountEl.textContent = steps
  renderGrid(getState())
}

const PY_FILES = [
  'models/fish.py',
  'models/grid.py',
  'models/tuna.py',
  'models/shark.py',
  'simulation.py',
]

async function loadWatorPackage() {
  pyodide.FS.mkdirTree('models')
  for (const path of PY_FILES) {
    const code = await (await fetch(`/${path}`)).text()
    pyodide.FS.writeFile(path, code)
  }
}

async function setup() {
  pyodide = await loadPyodide()
  await loadWatorPackage()
  Simulation = pyodide.pyimport('simulation').Simulation
  initSim()
  loadingEl.classList.add('hidden')
  simEl.classList.remove('hidden')
}

setup()
