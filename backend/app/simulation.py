import random
from typing import List, Optional, Tuple

from app.models.fish import Fish
from app.models.shark import Shark


class WatorSimulation:
    def __init__(self, width: int, height: int, num_fish: int, num_sharks: int,
                 fish_breed_time: int = 3, shark_breed_time: int = 10, shark_starve_time: int = 3):
        self.width = width
        self.height = height
        self.fish_breed_time = fish_breed_time
        self.shark_breed_time = shark_breed_time
        self.shark_starve_time = shark_starve_time
        self.grid: List[List[Optional[object]]] = [[None for _ in range(width)] for _ in range(height)]
        self._initialize_population(num_fish, num_sharks)

    def _initialize_population(self, num_fish: int, num_sharks: int):
        positions = [(x, y) for x in range(self.width) for y in range(self.height)]
        random.shuffle(positions)

        for _ in range(num_fish):
            if not positions: break
            x, y = positions.pop()
            self.grid[y][x] = Fish(self.fish_breed_time)

        for _ in range(num_sharks):
            if not positions: break
            x, y = positions.pop()
            self.grid[y][x] = Shark(self.shark_breed_time, self.shark_starve_time)

    def step(self):
        # Reset moved flag
        for y in range(self.height):
            for x in range(self.width):
                if self.grid[y][x]:
                    self.grid[y][x].moved = False

        # Randomize processing order to avoid bias
        coords = [(x, y) for x in range(self.width) for y in range(self.height)]
        random.shuffle(coords)

        for x, y in coords:
            entity = self.grid[y][x]
            if entity and not entity.moved:
                if isinstance(entity, Shark):
                    self._process_shark(x, y, entity)
                elif isinstance(entity, Fish):
                    self._process_fish(x, y, entity)

    def _get_neighbors(self, x: int, y: int) -> List[Tuple[int, int]]:
        neighbors = []
        # Directions: Up, Down, Left, Right
        for dx, dy in [(0, -1), (0, 1), (-1, 0), (1, 0)]:
            nx, ny = (x + dx) % self.width, (y + dy) % self.height
            neighbors.append((nx, ny))
        return neighbors

    def _process_fish(self, x: int, y: int, fish: Fish):
        fish.age += 1

        neighbors = self._get_neighbors(x, y)
        empty_neighbors = [(nx, ny) for nx, ny in neighbors if self.grid[ny][nx] is None]

        if empty_neighbors:
            nx, ny = random.choice(empty_neighbors)

            # Move
            self.grid[ny][nx] = fish
            self.grid[y][x] = None
            fish.moved = True

            # Reproduce
            if fish.age >= fish.breed_time:
                fish.age = 0
                self.grid[y][x] = Fish(self.fish_breed_time)  # Child in old spot
                self.grid[y][x].moved = True  # Child shouldn't move this turn
        else:
            fish.moved = True  # Stayed still

    def _process_shark(self, x: int, y: int, shark: Shark):
        shark.age += 1
        shark.energy -= 1  # Lose energy every turn

        if shark.energy < 0:
            self.grid[y][x] = None  # Die
            return

        neighbors = self._get_neighbors(x, y)
        fish_neighbors = [(nx, ny) for nx, ny in neighbors if isinstance(self.grid[ny][nx], Fish)]
        empty_neighbors = [(nx, ny) for nx, ny in neighbors if self.grid[ny][nx] is None]

        moved = False

        if fish_neighbors:
            target_x, target_y = random.choice(fish_neighbors)
            shark.energy = shark.starve_time  # Reset energy (ate)

            # Move (Eat)
            self.grid[target_y][target_x] = shark
            self.grid[y][x] = None
            moved = True
        elif empty_neighbors:
            target_x, target_y = random.choice(empty_neighbors)

            # Move
            self.grid[target_y][target_x] = shark
            self.grid[y][x] = None
            moved = True

        if moved:
            shark.moved = True
            # Reproduce
            if shark.age >= shark.breed_time:
                shark.age = 0
                self.grid[y][x] = Shark(self.shark_breed_time, self.shark_starve_time)
                self.grid[y][x].moved = True
        else:
            shark.moved = True  # Stayed still

    def get_state(self) -> List[List[str]]:
        state = []
        for row in self.grid:
            row_state = []
            for cell in row:
                if isinstance(cell, Fish):
                    row_state.append("fish")
                elif isinstance(cell, Shark):
                    row_state.append("shark")
                else:
                    row_state.append("water")
            state.append(row_state)
        return state
