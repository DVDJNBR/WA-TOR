import random

from models.tuna import Tuna
from models.shark import Shark
from models.grid import Grid


class Simulation:
    """Orchestrates the Wa-Tor population across a grid, one turn at a time."""

    def __init__(
        self,
        width: int,
        height: int,
        num_tuna: int,
        num_sharks: int,
        tuna_breed_time: int,
        shark_breed_time: int,
        shark_start_energy: int,
        energy_per_tuna: int,
    ) -> None:
        self.grid = Grid(width, height)
        self.tour = 0

        Tuna.breed_time = tuna_breed_time
        Shark.breed_time = shark_breed_time
        Shark.start_energy = shark_start_energy
        Shark.energy_per_tuna = energy_per_tuna
            # shared config, injected once on every instance of the species

        self.tuna_list: list[Tuna] = []
        self.shark_list: list[Shark] = []
        self.place_population(num_tuna, num_sharks)
        self.grid.update(self.tuna_list, self.shark_list)
            # builds the population, then makes the grid match it

    def place_population(self, num_tuna: int, num_sharks: int) -> None:
        """Scatter tuna and sharks on distinct random cells."""
        positions = [(x, y) for x in range(self.grid.width) for y in range(self.grid.height)]
        random.shuffle(positions)

        for x, y in positions[:num_tuna]:
            self.tuna_list.append(Tuna(x, y))

        for x, y in positions[num_tuna:num_tuna + num_sharks]:
            self.shark_list.append(Shark(x, y))
            # unique random cells, sliced between the two species

    def step(self) -> None:
        """Advance the simulation by one turn."""
        self.move_sharks()
        self.move_tuna()
        self.tour += 1
            # sharks act first, then tuna, then the clock advances

    def move_sharks(self) -> None:
        """Move every shark, drop the starved ones, and add any newborns."""
        newborns = []
        survivors = []

        for shark in self.shark_list:
            newborn = shark.move(self.grid, self.tuna_list)
            self.grid.update(self.tuna_list, self.shark_list)
                # keeps the grid in sync before the next shark moves

            if not shark.is_starving():
                survivors.append(shark)
            if newborn:
                newborns.append(newborn)

        self.shark_list = survivors + newborns
            # starved sharks are dropped here, newborns join in

    def move_tuna(self) -> None:
        """Move every tuna and add any newborns."""
        newborns = []

        for tuna in self.tuna_list:
            newborn = tuna.move(self.grid)
            self.grid.update(self.tuna_list, self.shark_list)

            if newborn:
                newborns.append(newborn)

        self.tuna_list.extend(newborns)
            # tuna never starves, so nothing to drop here
