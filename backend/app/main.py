import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.simulation import WatorSimulation

app = FastAPI()

simulation = WatorSimulation(width=50, height=30, num_fish=200, num_sharks=20)


class InitParams(BaseModel):
    width: int
    height: int
    num_fish: int
    num_sharks: int
    fish_breed_time: int = 3
    shark_breed_time: int = 10
    shark_starve_time: int = 3


@app.post("/api/init")
def init_simulation(params: InitParams):
    global simulation
    simulation = WatorSimulation(
        width=params.width,
        height=params.height,
        num_fish=params.num_fish,
        num_sharks=params.num_sharks,
        fish_breed_time=params.fish_breed_time,
        shark_breed_time=params.shark_breed_time,
        shark_starve_time=params.shark_starve_time
    )
    return {"message": "Simulation initialized"}


@app.post("/api/step")
def step_simulation():
    global simulation
    simulation.step()
    return {"state": simulation.get_state()}


@app.get("/api/state")
def get_state():
    global simulation
    return {"state": simulation.get_state()}


# In production the frontend is built (npm run build) and copied next to this
# file as app/static/. Mounted last so it doesn't shadow the /api routes above.
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
