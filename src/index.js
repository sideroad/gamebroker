var express = require('express');
var app = express();
var cors = require('cors');
var uuid = require('uuid/v4');

const rooms = {};

setInterval(function(){
  const expire = Date.now();
  Object.keys(rooms).forEach(function(service){
    const room = rooms[service];
    if ((room.createdAt + 3600000) < expire) {
      delete rooms[service];
    }
  });
}, 60000);


app.use(cors());

app.get('/:service/join', (req, res) => {
  const service = req.params.service;
  if (!rooms[service]) {
    rooms[service] = [];
  }
  const room = rooms[service].find(room => room.clients.length < (req.query.max || 2));
  if (room) {
    console.log("find room", room);
    res.json({
      id: room.id,
      clients: room.clients
    });
    room.clients.push(req.query.id);
  } else {
    const id = uuid();
    console.log("make new room", id);
    const newRoom = {
      id: id,
      clients: [],
      createdAt: Date.now()
    };
    res.json(newRoom);
    newRoom.clients.push(req.query.id);
    rooms[service].push(newRoom);
  }
});


app.listen(process.env.PORT || 3030, function () {
  console.log('Listening on 3030')
})
