from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_init_simulation():
    response = client.post(
        "/init",
        json={
            "width": 10,
            "height": 10,
            "num_fish": 5,
            "num_sharks": 2,
            "fish_breed_time": 3,
            "shark_breed_time": 10,
            "shark_starve_time": 3
        }
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Simulation initialized"}

def test_get_state():
    # First ensure we have a known state
    client.post(
        "/init",
        json={"width": 5, "height": 5, "num_fish": 1, "num_sharks": 0}
    )
    response = client.get("/state")
    assert response.status_code == 200
    state = response.json()["state"]
    assert len(state) == 5
    assert len(state[0]) == 5
    fish_count = sum(row.count("fish") for row in state)
    assert fish_count == 1

def test_step_simulation():
    # Initialize simulation
    client.post(
        "/init",
        json={"width": 5, "height": 5, "num_fish": 1, "num_sharks": 0, "fish_breed_time": 10}
    )

    # Get initial state
    initial_response = client.get("/state")
    initial_state = initial_response.json()["state"]

    # Step simulation
    step_response = client.post("/step")
    assert step_response.status_code == 200
    new_state = step_response.json()["state"]

    # Check that state is returned and has correct dimensions
    assert len(new_state) == 5
    assert len(new_state[0]) == 5

    # With 1 fish on a 5x5 grid, it should move
    # (unless we're very unlucky and it's blocked, but 1 fish can't be blocked)
    assert new_state != initial_state
