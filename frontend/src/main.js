const apiUrl = '/api'

const params = {
  width: 20,
  height: 15,
  num_fish: 80,
  num_sharks: 10,
  fish_breed_time: 3,
  shark_breed_time: 12,
  shark_starve_time: 3,
}

let speed = 150
let running = false
let intervalId = null
let steps = 0

const app = document.getElementById('app')

app.innerHTML = `
  <div class="wrap">
    <div class="title">Wa-Tor</div>
    <div class="params">
      ${paramRow('num_fish', 'poissons')}
      ${paramRow('num_sharks', 'requins')}
      ${paramRow('fish_breed_time', 'reproduction poisson')}
      ${paramRow('shark_breed_time', 'reproduction requin')}
      ${paramRow('shark_starve_time', 'famine requin')}
      ${paramRow('width', 'largeur')}
      ${paramRow('height', 'hauteur')}
    </div>
    <div class="params-row">
      <label for="speed">vitesse</label>
      <input type="range" id="speed" min="30" max="1000" step="10" value="${speed}" />
    </div>
    <div class="controls">
      <button id="toggle">start</button>
      <button id="step">step</button>
      <button id="reset">reset</button>
    </div>
    <div class="status">
      <span>fish 🐟 <strong id="fish-count">0</strong></span>
      <span>sharks 🦈 <strong id="shark-count">0</strong></span>
      <span>cycle <strong id="step-count">0</strong></span>
    </div>
    <div id="grid" class="grid"></div>
    <a class="source" href="https://github.com/DVDJNBR/WA-TOR" target="_blank" rel="noopener">source</a>
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

const gridEl = document.getElementById('grid')
const fishCountEl = document.getElementById('fish-count')
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
  intervalId = setInterval(stepSim, speed)
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
          .map((cell) => `<div class="cell">${cell === 'fish' ? '🐟' : cell === 'shark' ? '🦈' : ''}</div>`)
          .join('')}</div>`
    )
    .join('')

  let fish = 0
  let sharks = 0
  for (const row of state) {
    for (const cell of row) {
      if (cell === 'fish') fish++
      if (cell === 'shark') sharks++
    }
  }
  fishCountEl.textContent = fish
  sharkCountEl.textContent = sharks

  if (running && steps > 0 && (fish === 0 || sharks === 0)) {
    stop()
  }
}

async function fetchState() {
  const res = await fetch(`${apiUrl}/state`)
  const data = await res.json()
  renderGrid(data.state)
}

async function initSim() {
  const res = await fetch(`${apiUrl}/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    console.error('init failed', await res.text())
    return
  }
  await fetchState()
}

async function stepSim() {
  const res = await fetch(`${apiUrl}/step`, { method: 'POST' })
  const data = await res.json()
  steps++
  stepCountEl.textContent = steps
  renderGrid(data.state)
}

initSim()
