import random


class Fish:
    """Base class for a creature that lives on the Wa-Tor grid."""

    breed_time: int = 0

    def __init__(self, x: int, y: int) -> None:
        self.x = x
        self.y = y
        self.previous_x = x
        self.previous_y = y
        self.age = 0

    def neighbor_coords(self, width: int, height: int) -> list[tuple[int, int]]:
        """Return the coordinates of the four toroidal neighbors."""
        up = (self.x, (self.y - 1) % height)
        down = (self.x, (self.y + 1) % height)
        left = ((self.x - 1) % width, self.y)
        right = ((self.x + 1) % width, self.y)
        return [up, down, left, right]

    def move_to(self, target: tuple[int, int]) -> None:
        """Move to the given coordinates, remembering the previous position."""
        self.previous_x, self.previous_y = self.x, self.y
        self.x, self.y = target

    def choose_target(self, candidates: list[tuple[int, int]]) -> None:
        """Pick a random cell among the candidates and move there."""
        target = random.choice(candidates)
        self.move_to(target)

    def is_ready_to_breed(self) -> bool:
        """Return whether this fish has aged enough to reproduce."""
        return self.age >= self.breed_time
