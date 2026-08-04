from models.shark import Shark
from models.tuna import Tuna
from models.grid import Grid


def test_shark_starts_with_start_energy():
    Shark.start_energy = 5
    shark = Shark(0, 0)
    assert shark.energy == 5


def test_shark_loses_energy_moving_to_empty_cell():
    Shark.start_energy = 5
    Shark.breed_time = 10
    grid = Grid(width=3, height=3)
    grid.update([], [])
    shark = Shark(1, 1)

    shark.move(grid, [])

    assert shark.energy == 4


def test_shark_eats_neighboring_tuna_and_gains_energy():
    Shark.start_energy = 3
    Shark.breed_time = 10
    Shark.energy_per_tuna = 5
    grid = Grid(width=3, height=1)
    prey = Tuna(2, 0)
    predator = Shark(1, 0)
    grid.update([prey], [predator])
    tuna_list = [prey]

    predator.move(grid, tuna_list)

    assert (predator.x, predator.y) == (2, 0)
    assert predator.energy == 3 - 1 + 5
    assert prey not in tuna_list


def test_shark_prefers_tuna_over_empty_cell():
    Shark.start_energy = 5
    Shark.breed_time = 10
    Shark.energy_per_tuna = 2
    grid = Grid(width=3, height=3)
    prey = Tuna(1, 0)
    predator = Shark(1, 1)
    grid.update([prey], [predator])

    predator.move(grid, [prey])

    assert (predator.x, predator.y) == (1, 0)


def test_shark_is_starving_at_zero_energy():
    Shark.start_energy = 1
    Shark.breed_time = 10
    grid = Grid(width=3, height=3)
    grid.update([], [])
    shark = Shark(1, 1)

    shark.move(grid, [])

    assert shark.is_starving()


def test_shark_stays_put_when_fully_blocked():
    Shark.start_energy = 5
    Shark.breed_time = 10
    grid = Grid(width=3, height=3)
    shark = Shark(1, 1)
    blockers = [Shark(1, 0), Shark(1, 2), Shark(0, 1), Shark(2, 1)]
    grid.update([], blockers + [shark])

    newborn = shark.move(grid, [])

    assert (shark.x, shark.y) == (1, 1)
    assert newborn is None


def test_shark_reproduces_after_breed_time():
    Shark.start_energy = 5
    Shark.breed_time = 1
    grid = Grid(width=3, height=3)
    grid.update([], [])
    shark = Shark(1, 1)

    newborn = shark.move(grid, [])

    assert isinstance(newborn, Shark)
    assert (newborn.x, newborn.y) == (1, 1)
    assert shark.age == 0
