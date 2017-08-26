function randRange (upper) {
  return Math.floor(Math.random() * upper)
}

export default class Grid {
  // fillPercent = 50

  constructor (width, height) {
    this.width = width
    this.height = height
    this.createGrid()
  }

  createGrid () {
    this.grid = []
    for (let x = 0; x < this.width; x++) {
      this.grid[x] = []
      for (let y = 0; y < this.heigth; y++) {
        this.grid[x][y] = ''
      }
    }
  }

  randomCoords () {
    return [randRange(this.width), randRange(this.height)]
  }
}
