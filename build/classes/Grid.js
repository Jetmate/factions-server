'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function randRange(upper) {
  return Math.floor(Math.random() * upper);
}

var Grid = function () {
  // fillPercent = 50

  function Grid(width, height) {
    _classCallCheck(this, Grid);

    this.width = width;
    this.height = height;
    this.createGrid();
  }

  _createClass(Grid, [{
    key: 'createGrid',
    value: function createGrid() {
      this.grid = [];
      for (var x = 0; x < this.width; x++) {
        this.grid[x] = [];
        for (var y = 0; y < this.heigth; y++) {
          this.grid[x][y] = '';
        }
      }
    }
  }, {
    key: 'randomCoords',
    value: function randomCoords() {
      return [randRange(this.width), randRange(this.height)];
    }
  }]);

  return Grid;
}();

exports.default = Grid;