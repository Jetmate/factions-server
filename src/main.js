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

import fs from 'fs'
import readline from 'readline'


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
let reloading = []

const readLine = readline.createInterface({
  input: fs.createReadStream(path.join(WWW, 'badWords.txt'))
})

let badWords = []
readLine.on('line', (line) => {
  if (line) {
    badWords.push(line)
  }
})

function hasBadWord (word) {
  for (let badWord of badWords) {
    if (word.includes(badWord)) {
      return true
    }
  }
  return false
}


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
  res.render('index.html', {component: 'setup'})
})

app.post('/signup', (req, res, next) => {
  if (req.session.name in leaderboard) {
    res.render('index.html', {component: 'extraTab'})
  } else if (!req.body.id) {
    res.render('index.html', {component: 'setup', error: 'please actually input a name'})
  } else if (hasBadWord(req.body.id)) {
    res.render('index.html', {component: 'setup', error: 'please be civil'})
  } else if (req.body.id.length > 7) {
    res.render('index.html', {component: 'setup', error: 'please enter something shorter'})
  } else if (req.body.id in leaderboard) {
    res.render('index.html', {component: 'setup', error: 'username taken!'})
  } else {
    req.session.name = req.body.id
    res.redirect('/game')
  }
})

app.get('/game', (req, res, next) => {
  if (typeof req.session.name === 'undefined') {
    res.redirect('/')
  } else if (req.session.name in leaderboard && !(reloading.includes(req.session.name))) {
    res.render('index.html', {component: 'extraTab'})
  } else {
    if (!(req.session.name in leaderboard)) {
      leaderboard[req.session.name] = 0
    } else {
      reloading.splice(reloading.indexOf(req.session.name), 1)
    }

    console.log('new', leaderboard)
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
  })

  socket.on('player', (id, coords, health) => {
    socket.broadcast.emit('player', id, coords, health)
  })

  socket.on('playerDeath', (playerId, killerId) => {
    io.emit('playerDeath', playerId, killerId)
    leaderboard[killerId]++
    console.log('death', leaderboard)
    // delete leaderboard[playerId]
  })

  socket.on('close', (id) => {
    console.log('close')
    socket.broadcast.emit('close', id)
    delete leaderboard[id]
  })

  socket.on('reload', (id) => {
    socket.broadcast.emit('reload', id)
    reloading.push(id)
  })
})
