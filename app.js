const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port);
// WARNING: app.listen(80) will NOT work here!

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('takeScreenshot', function() {
    socket.broadcast.emit('takeScreenshot');
  });

  socket.on('tookScreenshot', function(base64Screenshots) {
    socket.broadcast.emit('tookScreenshots', base64Screenshots);
  });
});
