const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.ejs');
});

app.get('/:slug', (req, res) => {
  res.render('pages/index', {
    slug: req.params.slug
  });
});

let schedules = [];
let isUserOnline = false;

let userSocketId = null;

io.on('connection', (socket) => {
  socket.on('disconnect', function() {
    if (socket.id === userSocketId) {
      isUserOnline = false;
    }
  });

  socket.on('takeScreenshot', function() {
    socket.broadcast.emit('takeScreenshot');
  });

  socket.on('tookScreenshot', function(base64Screenshots) {
    socket.broadcast.emit('tookScreenshot', base64Screenshots);
  });

  socket.on('getSchedules', function(fn) {
    fn(schedules);
  });

  socket.on('setSchedules', function(newSchedules) {
    schedules = newSchedules;
    socket.broadcast.emit('setSchedules', schedules);
  });

  socket.on('connectUser', function() {
    userSocketId = socket.id;
  });
});
