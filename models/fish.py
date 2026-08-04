import random


class Fish:
    breed_time = 0

    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.previous_x = x
        self.previous_y = y
        self.age = 0

    def neighbor_coords(self, width, height):
        up = (self.x, (self.y - 1) % height)
        down = (self.x, (self.y + 1) % height)
        left = ((self.x - 1) % width, self.y)
        right = ((self.x + 1) % width, self.y)
        return [up, down, left, right]

    def move_to(self, target):
        self.previous_x, self.previous_y = self.x, self.y
        self.x, self.y = target

    def is_ready_to_breed(self):
        return self.age >= self.breed_time
