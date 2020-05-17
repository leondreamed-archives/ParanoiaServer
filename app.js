const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port);

app.set('view engine', 'ejs');

const rooms = {};

app.get('/', (req, res) => {
  res.render('index', {
    room: 'leonzalion'
  });
});

app.get('/log', (req, res) => {
  res.json(rooms);
});

app.get('/clear', (req, res) => {
  for (const room in rooms) delete rooms[room];
  res.json(rooms);
})

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

  socket.on('takeScreenshot', function(room, fn) {
    if (rooms[room] && rooms[room].isUserOnline) {
      const schedules = rooms[room].schedules;
      for (const schedule of schedules) {
        const start = new Date(schedule.start);
        const end = new Date(schedule.end);
        const now = new Date();

        if (now >= start && now <= end) {
          socket.to(rooms[room].userSocketId).emit('takeScreenshot', room, rooms[room].screenshotWidth);
          return fn(true);
        }
      }
      return fn(false, 'The user has not scheduled Paranoia for this time.');
    } else {
      return fn(false, 'User is not online.');
    }
  });

  socket.on('tookScreenshot', function(room, base64Screenshots) {
    socket.to(room).emit('tookScreenshot', room, base64Screenshots);
  });

  socket.on('getSchedules', function(room, fn) {
    fn(rooms[room] ? rooms[room].schedules || [] : []);
  });

  socket.on('setSchedules', function(room, newSchedules) {
    rooms[room].schedules = newSchedules;
    socket.to(room).emit('setSchedules', room, newSchedules);
  });

  socket.on('connectUser', function(room, onComplete) {
    socket.join(room);
    rooms[room] = rooms[room] || {};
    rooms[room].userSocketId = socket.id;
    rooms[room].isUserOnline = true;
    rooms[room].screenshotWidth = rooms[room].screenshotWidth || 100;
    rooms[room].schedules = rooms[room].schedules || [];
    onComplete();
  });

  socket.on('joinRoom', function(room, onComplete) {
    socket.join(room);
    onComplete();
  });

  socket.on('setScreenshotWidth', function(room, screenshotWidth) {
    if (rooms[room]) {
      rooms[room].screenshotWidth = screenshotWidth;
    }
  });

  socket.on('getScreenshotWidth', function(room, fn) {
    fn(rooms[room].screenshotWidth);
  });
});
