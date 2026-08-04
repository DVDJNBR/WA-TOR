from __future__ import annotations

from models.fish import Fish
from models.grid import Grid
from models.tuna import Tuna


class Shark(Fish):
    """Predator: hunts tuna, loses energy each turn, and starves without food."""

    start_energy: int = 0
    energy_per_tuna: int = 0

    def __init__(self, x: int, y: int) -> None:
        super().__init__(x, y)
        self.energy = self.start_energy

    def is_starving(self) -> bool:
        """Return whether this shark has run out of energy."""
        return self.energy <= 0

    def eat(self, tuna_list: list[Tuna]) -> None:
        """Gain energy and remove the tuna at this shark's position."""
        self.energy += self.energy_per_tuna
        tuna_list[:] = [t for t in tuna_list if (t.x, t.y) != (self.x, self.y)]

    def move(self, grid: Grid, tuna_list: list[Tuna]) -> Shark | None:
        self.age += 1
        self.energy -= 1

        neighbors = self.neighbor_coords(grid.width, grid.height)
        tuna_cells = [cell for cell in neighbors if grid.has_tuna(*cell)]
        empty_cells = [cell for cell in neighbors if grid.is_empty(*cell)]

        if not tuna_cells and not empty_cells:
            return None
            # blocked, stays put

        if tuna_cells:
            self.choose_target(tuna_cells)
            self.eat(tuna_list)
                # prefers a meal over an empty cell
        else:
            self.choose_target(empty_cells)

        if not self.is_ready_to_breed():
            return None

        self.age = 0
        return Shark(self.previous_x, self.previous_y)
