from __future__ import annotations

from models.fish import Fish
from models.grid import Grid


class Tuna(Fish):
    """Prey: moves to any empty neighboring cell and breeds over time."""

    def move(self, grid: Grid) -> Tuna | None:
        self.age += 1

        neighbors = self.neighbor_coords(grid.width, grid.height)
        empty_cells = [cell for cell in neighbors if grid.is_empty(*cell)]
            # checks for a free cell nearby

        if not empty_cells:
            return None

        self.choose_target(empty_cells)

        if not self.is_ready_to_breed():
            return None
            # not mature enough yet

        self.age = 0
        return Tuna(self.previous_x, self.previous_y)
