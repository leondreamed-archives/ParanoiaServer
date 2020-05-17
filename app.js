const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port);

app.set('view engine', 'ejs');

const rooms = {

};

let schedules = [];

app.get('/', (req, res) => {
  res.render('index', {
    room: 'leonzalion'
  });
});

app.get('/test', (req, res) => {
  res.json(rooms);
});

app.get('/:room', (req, res) => {
  res.render('index', {
    room: req.params.room
  });
});




io.on('connection', (socket) => {
  socket.on('disconnect', function() {
    for (const [room, roomObj] of Object.entries(rooms)) {
      if (socket.id === roomObj.userSocketId) {
        rooms[room].isUserOnline = false;
      }
    }
  });

  socket.on('takeScreenshot', function(room) {
    socket.to(room).emit('takeScreenshot', room);
  });

  socket.on('tookScreenshot', function(room, base64Screenshots) {
    socket.to(room).emit('tookScreenshot', room, base64Screenshots);
  });

  socket.on('getSchedules', function(room, fn) {
    fn(rooms[room] ? rooms[room].schedules : []);
  });

  socket.on('setSchedules', function(room, newSchedules) {
    rooms[room].schedules = newSchedules;
    socket.to(room).emit('setSchedules', room, schedules);
  });

  socket.on('connectUser', function(room) {
    rooms[room] = rooms[room] || {};
    rooms[room].userSocketId = socket.id;
  });
});
