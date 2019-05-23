const express = require('express');
// const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const server = require('http').createServer(app)
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
});
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const emptyPoem = {
  line1: { assignedTo: '', value: '' },
  line2: { assignedTo: '', value: '' },
  line3: { assignedTo: '', value: '' },
  line4: { assignedTo: '', value: '' },
  line5: { assignedTo: '', value: '' }
}
let poems = {}

const removePoem = (socketId, gameRoom) => {
  poems[gameRoom] = poems[gameRoom].filter(poem => poem.poemId !== socketId)
}

const updatePoemLine = (line, poemId, lineNum, gameRoom) => {
  poems[gameRoom] = poems[gameRoom].map(poem =>
    poem.poemId === poemId ?
      {
        ...poem,
        [lineNum]: {
          ...poem[lineNum],
          value: line
        }
      }
      : poem
  )
}

io.on('connection', socket => {
  console.log('a new client connected');
  socket.on('join game room', (gameRoom, username) => {
    socket.join(gameRoom, () => {
      const emitPoems = (gameRoom) => io.to(gameRoom).emit('poems updated', poems[gameRoom])

      poems[gameRoom] = poems[gameRoom] ? poems[gameRoom] : []
      
      socket.emit('joined game room', gameRoom)

      const myPoem = { poemId: socket.id, username, ...emptyPoem };
      poems[gameRoom].push(myPoem)
      emitPoems(gameRoom)

      socket.on('start game', () => {
        io.to(gameRoom).emit('game started')
      })

      socket.on('disconnect', () => {
        console.log('a client disconnected')
        removePoem(socket.id, gameRoom)
        emitPoems(gameRoom)
      });
    
      socket.on('add line 1', (line, poemId) => {
        updatePoemLine(line, poemId, "line1", gameRoom);
        emitPoems(gameRoom)
      });
      socket.on('add line 2', (line, poemId) => {
        updatePoemLine(line, poemId, "line2", gameRoom);
        emitPoems(gameRoom)
      });
      socket.on('add line 3', (line, poemId) => {
        updatePoemLine(line, poemId, "line3", gameRoom);
        emitPoems(gameRoom)
      });
      socket.on('add line 4', (line, poemId) => {
        updatePoemLine(line, poemId, "line4", gameRoom);
        emitPoems(gameRoom)
      });
      socket.on('add line 5', (line, poemId) => {
        updatePoemLine(line, poemId, "line5", gameRoom);
        emitPoems(gameRoom)
      });
    })
  })
});