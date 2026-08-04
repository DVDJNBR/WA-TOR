from models.fish import Fish


def test_fish_starts_at_given_position():
    fish = Fish(2, 3)
    assert (fish.x, fish.y) == (2, 3)
    assert (fish.previous_x, fish.previous_y) == (2, 3)
    assert fish.age == 0


def test_move_to_updates_position_and_keeps_previous():
    fish = Fish(0, 0)
    fish.move_to((1, 1))
    assert (fish.x, fish.y) == (1, 1)
    assert (fish.previous_x, fish.previous_y) == (0, 0)


def test_neighbor_coords_wraps_around_edges():
    fish = Fish(0, 0)
    neighbors = fish.neighbor_coords(width=5, height=5)
    assert set(neighbors) == {(0, 4), (0, 1), (4, 0), (1, 0)}


def test_choose_target_moves_to_one_of_the_candidates():
    fish = Fish(0, 0)
    candidates = [(1, 0), (2, 0)]
    fish.choose_target(candidates)
    assert (fish.x, fish.y) in candidates


def test_is_ready_to_breed_at_threshold():
    fish = Fish(0, 0)
    fish.breed_time = 3
    fish.age = 3
    assert fish.is_ready_to_breed()

    fish.age = 2
    assert not fish.is_ready_to_breed()
