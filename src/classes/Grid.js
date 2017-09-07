function randRange (upper) {
  return Math.floor(Math.random() * upper)
}

export default class Grid {
  LEVELS = [
    // {fillPercent: 24, smoothRate: 4, smoothCount: 3},
    {fillPercent: .23, smoothRate: 4, smoothCount: 4, treePercent: .004},
    // {fillPercent: 49, smoothRate: 5, smoothCount: 4},
    {fillPercent: .48, smoothRate: 5, smoothCount: 4, treePercent: .004},
    {fillPercent: .15, smoothRate: 3, smoothCount: 5, treePercent: .004},
    {fillPercent: .20, smoothRate: 3, smoothCount: 4, treePercent: .004}
  ]

  constructor (width, height, level) {
    this.width = width
    this.height = height
    this.level = level
    this.grid = this.generateGrid()
  }

  generateGrid () {
    let grid = this.createGrid()
    this.populateGrid(grid)
    for (let i = 0; i < this.LEVELS[this.level].smoothCount; i++) {
      grid = this.smoothGrid(grid)
    }
    this.outlineGrid(grid)
    this.growTrees(grid)
    return grid
  }

  growTrees (grid) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (!grid[x][y] && Math.random() < this.LEVELS[this.level].treePercent) {
          grid[x][y] = 'tree'
        }
      }
    }
  }

  createGrid () {
    let grid = []

    for (let x = 0; x < this.width; x++) {
      grid[x] = []
      for (let y = 0; y < this.height; y++) {
        grid[x][y] = ''
      }
    }

    return grid
  }

  populateGrid (grid) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (Math.random() < this.LEVELS[this.level].fillPercent) {
          grid[x][y] = 'block'
        } else {
          grid[x][y] = ''
        }
      }
    }
  }

  smoothGrid (oldGrid) {
    let grid = this.createGrid()

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let surroundingCount = this.getSurroundingTiles(oldGrid, x, y)
        if (surroundingCount >= this.LEVELS[this.level].smoothRate) {
          grid[x][y] = 'block'
        }
      }
    }

    return grid
  }

  outlineGrid (grid) {
    for (let x = 0; x < this.width; x++) {
      for (let y of [0, this.height - 1]) {
        grid[x][y] = 'block'
      }
    }

    for (let y = 0; y < this.height; y++) {
      for (let x of [0, this.width - 1]) {
        grid[x][y] = 'block'
      }
    }
  }

  getSurroundingTiles (grid, tileX, tileY) {
    let count = 0

    for (let x = tileX - 1; x <= tileX + 1; x++) {
      for (let y = tileY - 1; y <= tileY + 1; y++) {
        if (!(x === tileX && y === tileY)) {
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            if (grid[x][y] === 'block') {
              count++
            }
          }
        }
      }
    }

    // for (let offset of [[-1, 0], [0, 1], [0, -1], [0, 1]]) {
    //   if (offset[0] + tileX >= 0 && offset[0] + tileX < this.width && offset[1] + tileY >= 0 && offset[1] + tileY < this.height) {
    //     if (grid[offset[0] + tileX][offset[1] + tileY] === 'block') {
    //       count++
    //     }
    //   }
    // }

    return count
  }

  randomCoords () {
    if (process.env.NODE_ENV === 'production') {
      while (true) {
        let coords = [randRange(this.width), randRange(this.height)]
        if (!this.grid[coords[0]][coords[1]]) {
          return coords
        }
      }
    } else {
      return [9, 9]
    }
  }
}
