import helmet from 'helmet'
// import compression from 'compression'
import express from 'express'
// import http from 'http'
import socketio from 'socket.io'
import handlebars from 'hbs'
// import session from 'express-session'
import cookieSession from 'cookie-session'
import bodyParser from 'body-parser'
import path from 'path'

import Grid from './classes/Grid.js'


const GRID_WIDTH = 50
const GRID_HEIGHT = 50
let grid = new Grid(GRID_WIDTH, GRID_HEIGHT, 2)
let WWW
if (process.env.NODE_ENV === 'production') {
  WWW = path.join(__dirname, 'www')
} else {
  WWW = path.join(__dirname, '../../factions/www')
}

let leaderboard = {}

const app = express()
let server
if (process.env.NODE_ENV === 'production') {
  server = app.listen(3002, '127.0.0.1')
  console.log('RUNNING ON http://127.0.0.1:3002/')
} else {
  server = app.listen(3000, '0.0.0.0')
  console.log('RUNNING ON http://0.0.0.0:3000/')
}
const io = socketio(server)

app.set('view engine', 'html')
app.engine('html', handlebars.__express)
app.set('views', WWW)


app.use(helmet())
// app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(session({ secret: 'KV8t4Bhvq4FAIwj7', saveUninitialized: false, resave: true}))
app.use(cookieSession({keys: ['asdf', 'vj32fd', '3jadva3']}))

app.get('/', (req, res, next) => {
  // if ('id' in req.session) {
  //   res.render('index.html', {component: 'extraTab'})
  // } else {
  res.render('index.html', {component: 'setup'})
  // }
})

app.post('/signup', (req, res, next) => {
  req.session.name = req.body.id
  res.redirect('/game')
})

app.get('/game', (req, res, next) => {
  if (typeof req.session.name === 'undefined') {
    res.redirect('/')
  } else {
    res.render('index.html', {
      component: 'game',
      id: req.session.name,
      coords: JSON.stringify(grid.randomCoords()),
      grid: JSON.stringify(grid.grid),
      GRID_WIDTH: grid.width,
      GRID_HEIGHT: grid.height,
      leaderboard: JSON.stringify(leaderboard)
    })
  }
})

app.use(express.static(WWW))



io.on('connection', (socket) => {
  socket.on('playerChange', (id, type, action) => {
    socket.broadcast.emit('playerChange', id, type, action)
  })

  socket.on('newBullet', (coords, id, rotation, velocity) => {
    socket.broadcast.emit('newBullet', coords, id, rotation, velocity)
  })

  socket.on('bulletCrash', (bulletId) => {
    socket.broadcast.emit('bulletCrash', bulletId)
  })

  socket.on('bulletHit', (bulletId, playerId, death, shooterId) => {
    socket.broadcast.emit('bulletHit', bulletId, playerId, death, shooterId)
  })

  socket.on('newPlayer', (id, coords) => {
    socket.broadcast.emit('newPlayer', id, coords)
    leaderboard[id] = 0
  })

  socket.on('player', (id, coords, health) => {
    socket.broadcast.emit('player', id, coords, health)
  })

  socket.on('playerDeath', (playerId, killerId) => {
    io.emit('playerDeath', playerId, killerId)
    leaderboard[killerId]++
    delete leaderboard[playerId]
  })

  socket.on('close', (id) => {
    socket.broadcast.emit('close', id)
    delete leaderboard[id]
  })
})
