from app.models.entity import Entity


class Fish(Entity):
    def __init__(self, breed_time: int):
        super().__init__()
        self.breed_time = breed_time
