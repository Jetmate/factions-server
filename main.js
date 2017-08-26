'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
// import compression from 'compression'

// import http from 'http'

// import session from 'express-session'


var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _hbs = require('hbs');

var _hbs2 = _interopRequireDefault(_hbs);

var _cookieSession = require('cookie-session');

var _cookieSession2 = _interopRequireDefault(_cookieSession);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function p() {
  for (var _len = arguments.length, items = Array(_len), _key = 0; _key < _len; _key++) {
    items[_key] = arguments[_key];
  }

  items.forEach(function (item) {
    if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && item !== null) {
      for (var key in item) {
        if (item.hasOwnProperty(key)) {
          console.log(key + ': ' + item[key]);
        }
      }
    } else if (typeof item === 'undefined') {
      console.log('UNDEFINED');
    } else {
      console.log(item);
    }
  });
}

function randRange(upper) {
  return Math.floor(Math.random() * upper);
}

function randomCoords() {
  return [randRange(GRID_WIDTH), randRange(GRID_HEIGHT)];
}

function createGrid() {
  var grid = [];
  for (var x = 0; x < GRID_WIDTH; x++) {
    grid[x] = [];
    for (var y = 0; y < GRID_HEIGHT; y++) {
      grid[x][y] = '';
    }
  }
  return grid;
}

// const randomItem = (array) => {
//   return array[randRange(array.length)]
// }

// const CHAR_POOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
// const randomString = (length=16) => {
//   let result = []
//   for (let i = 0; i < length; i++) {
//     result.push(randomItem(CHAR_POOL))
//   }
//   return result.join('')
// }


var GRID_WIDTH = 20;
var GRID_HEIGHT = 20;
var grid = createGrid();

var app = (0, _express2.default)();
var server = app.listen(3000, '0.0.0.0');
var io = (0, _socket2.default)(server);

app.set('view engine', 'html');
app.engine('html', _hbs2.default.__express);
app.set('views', __dirname + '/www');

app.use((0, _helmet2.default)());
// app.use(compression())
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));
// app.use(session({ secret: 'KV8t4Bhvq4FAIwj7', saveUninitialized: false, resave: true}))
app.use((0, _cookieSession2.default)({ keys: ['asdf', 'vj32fd', '3jadva3'] }));

app.get('/', function (req, res, next) {
  // if ('id' in req.session) {
  //   res.render('index.html', {component: 'extraTab'})
  // } else {
  res.render('index.html', { component: 'setup' });
  // }
});

app.post('/signup', function (req, res, next) {
  req.session.name = req.body.id;
  p(req.session.name);
  res.redirect('/game');
});

app.get('/game', function (req, res, next) {
  if (typeof req.session.name === 'undefined') {
    res.redirect('/');
  } else {
    res.render('index.html', {
      component: 'game',
      id: req.session.name,
      coords: JSON.stringify(randomCoords()),
      grid: JSON.stringify(grid),
      GRID_WIDTH: GRID_WIDTH,
      GRID_HEIGHT: GRID_HEIGHT
    });
  }
});

app.use(_express2.default.static('www'));

p('RUNNING ON http://0.0.0.0:3000/');

io.on('connection', function (socket) {
  socket.on('playerChange', function (id, type, action) {
    socket.broadcast.emit('playerChange', id, type, action);
  });

  socket.on('newBullet', function (bulletId, coords, rotation, velocity) {
    socket.broadcast.emit('newBullet', bulletId, coords, rotation, velocity);
  });

  socket.on('bulletCrash', function (bulletId) {
    socket.broadcast.emit('bulletCrash', bulletId);
  });

  socket.on('bulletHit', function (bulletId, playerId) {
    socket.broadcast.emit('bulletHit', bulletId, playerId);
  });

  socket.on('new', function (id, coords) {
    socket.broadcast.emit('new', id, coords);
  });

  socket.on('player', function (id, coords) {
    socket.broadcast.emit('player', id, coords);
  });

  socket.on('playerDeath', function (id) {
    io.emit('playerDeath', id);
  });

  socket.on('close', function (id) {
    socket.broadcast.emit('close', id);
  });
});