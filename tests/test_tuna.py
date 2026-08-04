from models.tuna import Tuna
from models.grid import Grid


def test_tuna_moves_to_an_empty_neighbor():
    Tuna.breed_time = 10
    grid = Grid(width=3, height=3)
    grid.update([], [])
    tuna = Tuna(1, 1)

    tuna.move(grid)

    assert (tuna.x, tuna.y) != (1, 1)
    assert (tuna.previous_x, tuna.previous_y) == (1, 1)


def test_tuna_ages_by_one_each_move():
    Tuna.breed_time = 10
    grid = Grid(width=3, height=3)
    grid.update([], [])
    tuna = Tuna(1, 1)

    tuna.move(grid)

    assert tuna.age == 1


def test_tuna_does_not_reproduce_before_breed_time():
    Tuna.breed_time = 5
    grid = Grid(width=3, height=3)
    grid.update([], [])
    tuna = Tuna(1, 1)

    newborn = tuna.move(grid)

    assert newborn is None


def test_tuna_reproduces_after_breed_time_and_resets_age():
    Tuna.breed_time = 1
    grid = Grid(width=3, height=3)
    grid.update([], [])
    tuna = Tuna(1, 1)

    newborn = tuna.move(grid)

    assert isinstance(newborn, Tuna)
    assert (newborn.x, newborn.y) == (1, 1)
    assert tuna.age == 0


def test_tuna_stays_put_when_fully_surrounded():
    Tuna.breed_time = 10
    grid = Grid(width=3, height=3)
    tuna = Tuna(1, 1)
    blockers = [Tuna(1, 0), Tuna(1, 2), Tuna(0, 1), Tuna(2, 1)]
    grid.update(blockers + [tuna], [])

    newborn = tuna.move(grid)

    assert (tuna.x, tuna.y) == (1, 1)
    assert newborn is None
