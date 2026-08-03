from app.models.entity import Entity


class Shark(Entity):
    def __init__(self, breed_time: int, starve_time: int, initial_energy: int = None):
        super().__init__()
        self.breed_time = breed_time
        self.starve_time = starve_time
        self.energy = initial_energy if initial_energy is not None else starve_time
