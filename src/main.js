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


const GRID_WIDTH = 20
const GRID_HEIGHT = 20
let grid = new Grid(GRID_WIDTH, GRID_HEIGHT)
const WWW = path.join(__dirname, '../../factions/www')

const app = express()
const server = app.listen(3000, '0.0.0.0')
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
      GRID_HEIGHT: grid.height
    })
  }
})

app.use(express.static(WWW))

console.log('RUNNING ON http://0.0.0.0:3000/')



io.on('connection', (socket) => {
  socket.on('playerChange', (id, type, action) => {
    socket.broadcast.emit('playerChange', id, type, action)
  })

  socket.on('newBullet', (bulletId, coords, rotation, velocity) => {
    socket.broadcast.emit('newBullet', bulletId, coords, rotation, velocity)
  })

  socket.on('bulletCrash', (bulletId) => {
    socket.broadcast.emit('bulletCrash', bulletId)
  })

  socket.on('bulletHit', (bulletId, playerId) => {
    socket.broadcast.emit('bulletHit', bulletId, playerId)
  })

  socket.on('new', (id, coords) => {
    socket.broadcast.emit('new', id, coords)
  })

  socket.on('player', (id, coords) => {
    socket.broadcast.emit('player', id, coords)
  })

  socket.on('playerDeath', (id) => {
    io.emit('playerDeath', id)
  })

  socket.on('close', (id) => {
    socket.broadcast.emit('close', id)
  })
})
