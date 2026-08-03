from app.models.entity import Entity
from app.models.fish import Fish
from app.models.shark import Shark


def test_entity_defaults():
    entity = Entity()
    assert entity.age == 0
    assert entity.moved is False


def test_fish_is_an_entity():
    fish = Fish(breed_time=3)
    assert isinstance(fish, Entity)
    assert fish.breed_time == 3
    assert fish.age == 0


def test_shark_starts_with_full_energy():
    shark = Shark(breed_time=10, starve_time=5)
    assert isinstance(shark, Entity)
    assert shark.starve_time == 5
    assert shark.energy == 5
