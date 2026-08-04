from simulation import Simulation


def make_simulation(**overrides):
    params = dict(
        width=5,
        height=5,
        num_tuna=3,
        num_sharks=2,
        tuna_breed_time=10,
        shark_breed_time=10,
        shark_start_energy=10,
        energy_per_tuna=3,
    )
    params.update(overrides)
    return Simulation(**params)


def test_places_correct_population_counts():
    sim = make_simulation()
    assert len(sim.tuna_list) == 3
    assert len(sim.shark_list) == 2


def test_places_each_creature_on_a_unique_cell():
    sim = make_simulation()
    positions = [(c.x, c.y) for c in sim.tuna_list + sim.shark_list]
    assert len(positions) == len(set(positions))


def test_step_increments_tour_counter():
    sim = make_simulation()
    sim.step()
    assert sim.tour == 1
    sim.step()
    assert sim.tour == 2


def test_grid_reflects_population_after_step():
    sim = make_simulation()
    sim.step()

    for tuna in sim.tuna_list:
        assert sim.grid.has_tuna(tuna.x, tuna.y)
    for shark in sim.shark_list:
        assert not sim.grid.is_empty(shark.x, shark.y)


def test_sharks_that_starve_are_removed():
    sim = make_simulation(num_tuna=0, num_sharks=1, shark_start_energy=1)
    sim.step()
    assert len(sim.shark_list) == 0


def test_population_grows_when_breed_time_is_reached():
    sim = make_simulation(num_tuna=1, num_sharks=1, tuna_breed_time=1, shark_breed_time=1)
    sim.step()
    assert len(sim.tuna_list) == 2
    assert len(sim.shark_list) == 2
