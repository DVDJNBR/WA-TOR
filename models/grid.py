class Grid:
    """Tracks which cells are occupied, rebuilt fresh from the population each turn."""

    def __init__(self, width: int, height: int) -> None:
        self.width = width
        self.height = height
        self.cells: dict[tuple[int, int], str] = {}

    def update(self, tuna_list: list, shark_list: list) -> None:
        """Rebuild the occupancy map from the current tuna and shark positions."""
        self.cells = {}
        for tuna in tuna_list:
            self.cells[(tuna.x, tuna.y)] = "tuna"
        for shark in shark_list:
            self.cells[(shark.x, shark.y)] = "shark"

    def is_empty(self, x: int, y: int) -> bool:
        return (x, y) not in self.cells

    def has_tuna(self, x: int, y: int) -> bool:
        return self.cells.get((x, y)) == "tuna"

    def to_rows(self) -> list[list[str]]:
        """Return the grid as rows of cell labels for display."""
        rows = []
        for y in range(self.height):
            row = []
            for x in range(self.width):
                if self.has_tuna(x, y):
                    row.append("tuna")
                elif not self.is_empty(x, y):
                    row.append("shark")
                else:
                    row.append("water")
            rows.append(row)
        return rows
            # scans row by row, cell by cell
