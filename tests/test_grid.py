from models.grid import Grid
from models.tuna import Tuna
from models.shark import Shark


def test_new_grid_is_fully_empty():
    grid = Grid(width=3, height=3)
    assert grid.is_empty(1, 1)
    assert not grid.has_tuna(1, 1)


def test_update_marks_tuna_cells():
    grid = Grid(width=3, height=3)
    tuna = Tuna(1, 1)

    grid.update([tuna], [])

    assert not grid.is_empty(1, 1)
    assert grid.has_tuna(1, 1)
    assert grid.is_empty(0, 0)


def test_update_marks_shark_cells_as_not_tuna():
    grid = Grid(width=3, height=3)
    shark = Shark(2, 2)

    grid.update([], [shark])

    assert not grid.is_empty(2, 2)
    assert not grid.has_tuna(2, 2)


def test_update_replaces_previous_state():
    grid = Grid(width=3, height=3)
    tuna = Tuna(0, 0)

    grid.update([tuna], [])
    assert not grid.is_empty(0, 0)

    grid.update([], [])
    assert grid.is_empty(0, 0)
