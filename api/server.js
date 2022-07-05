//Require &  Import Section
var crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
require('dotenv/config');
bodyParser = require('body-parser');
jsonwebtoken = require('jsonwebtoken');
User = require('./models/UserModel');
Quiz = require('./models/QuizModel');
var ytpl = require('ytpl');
var routes = require('./routes/Routes');
var cors = require('cors');
const socketIo = require('socket.io');
/// Server Section
app = express();
port = process.env.PORT || 8000;
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

//Socket Handling
const rooms = [];
io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  const { userName, roomID, userID } = socket.handshake.query;
  rooms[roomID].users.push({ userName, userID, id: socket.id, score: 0 });
  socket.join(roomID);

  io.in(roomID).emit('ROOM_UPDATE', rooms[roomID]);

  socket.on('disconnect', () => {
    id = socket.id;
    console.log(rooms[roomID].users);
    console.log(id);
    const index = rooms[roomID].users.findIndex((user) => user.id === id);
    console.log(index);
    if (index !== -1) {
      rooms[roomID].users.splice(index, 1);
    }
    io.in(roomID).emit('ROOM_UPDATE', rooms[roomID]);

    socket.leave(roomID);
  });

  socket.on('NEXT', () => {
    rooms[roomID].current = rooms[roomID].current + 1;
    if (rooms[roomID].current < rooms[roomID].quiz.songs.length) {
      rooms[roomID].messages.push({
        message: 'Playing new song. ',
        type: 3,
      });
      io.in(roomID).emit('MSG_UPDATE', rooms[roomID].messages);
      io.in(roomID).emit('ROOM_UPDATE', rooms[roomID]);
      io.in(roomID).emit(
        'PLAY_NEXT',
        rooms[roomID].quiz.songs[rooms[roomID].current].url
      );
    } else {
      rooms[roomID].messages.push({
        message: 'Game Over',
        type: 3,
      });
      io.in(roomID).emit('MSG_UPDATE', rooms[roomID].messages);
    }
  });
  socket.on('SEND_MSG', (msg) => {
    rooms[roomID].messages.push(msg);
    userAns = msg.message.toLowerCase();
    ans = rooms[roomID].quiz.songs[rooms[roomID].current].answer.toLowerCase();
    io.in(roomID).emit('MSG_UPDATE', rooms[roomID].messages);
    console.log(ans);
    console.log(userAns);
    if (userAns.includes(ans) || ans.includes(userAns)) {
      rooms[roomID].messages.push({
        message: 'Correct Answer !! ' + msg.muser.name,
        type: 1,
        muser: msg.muser,
      });
      id = socket.id;
      const index = rooms[roomID].users.findIndex((user) => user.id === id);
      console.log(index);
      if (index !== -1) {
        rooms[roomID].users[index].score = rooms[roomID].users[index].score + 1;
      }
      io.in(roomID).emit('ROOM_UPDATE', rooms[roomID]);
      setTimeout(() => {
        rooms[roomID].current = rooms[roomID].current + 1;
        if (rooms[roomID].current < rooms[roomID].quiz.songs.length) {
          rooms[roomID].messages.push({
            message: 'Playing new song. ',
            type: 3,
            muser: msg.muser,
          });
          io.in(roomID).emit('MSG_UPDATE', rooms[roomID].messages);

          io.in(roomID).emit('ROOM_UPDATE', rooms[roomID]);
          io.in(roomID).emit(
            'PLAY_NEXT',
            rooms[roomID].quiz.songs[rooms[roomID].current].url
          );
        } else {
          rooms[roomID].messages.push({
            message: 'Game Over',
            type: 3,
            muser: msg.muser,
          });
          io.in(roomID).emit('MSG_UPDATE', rooms[roomID].messages);
        }
      }, 1000);
    } else {
      rooms[roomID].messages.push({
        message: 'Incorrect Answer !! ' + msg.muser.name,
        type: 2,
        muser: msg.muser,
      });
    }
    io.in(roomID).emit('MSG_UPDATE', rooms[roomID].messages);
  });
});
server.listen(8001, () => {
  console.log(`Listening on port ${port}`);
});

//Mongoose Setup

const option = {
  socketTimeoutMS: 30000,
  keepAlive: true,

  useUnifiedTopology: true,
  useNewUrlParser: true,
};

mongoose.connect(process.env.MONGO_URL, option).then(
  function () {
    console.log('Connected to Mongoose');
  },
  function (err) {
    console.log('Error While Connecting', err);
  }
);

//Server Settings

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    jsonwebtoken.verify(
      req.headers.authorization.split(' ')[1],
      'RESTFULAPIs',
      function (err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
});
function shuffle(array) {
  var currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
app.route('/room').get((req, res) => {
  id = req.query.roomID;
  console.log(id);
  console.log(rooms);
  data = rooms[id];
  console.log(data);
  return res.json({ success: true, data });
});
app.route('/room/create').get((req, res) => {
  var roomId = crypto.randomBytes(20).toString('hex');
  while (rooms.indexOf(roomId) != -1) {
    var roomId = crypto.randomBytes(20).toString('hex');
  }
  rooms[roomId] = {};
  rooms[roomId].adminID = req.query.userID;
  quizID = req.query.quizID;
  Quiz = mongoose.model('Quiz');
  Quiz.findOne({ _id: quizID }).then((result, err) => {
    if (err) {
      return res.status(401).json({ message: 'Error Fetching Data' });
    }

    newData = shuffle(result.songs);
    result.songs = newData;
    rooms[roomId].quiz = result;
    rooms[roomId].users = [];
    rooms[roomId].messages = [];
    rooms[roomId].current = -1;
    return res.json({ success: true, data: roomId });
  });
});
app.route('/getsongs').get((req, res) => {
  id = req.query.id;
  console.log(id);
  ytpl(id)
    .then((result) => {
      return res.json({ error: false, data: result });
    })
    .catch((err) => {
      return res.json({ error: true, msg: err });
    });
});

//Route Section
routes(app);
app.use(function (req, res) {
  res.status(404).send({ url: req.originalUrl + ' not found' });
});

// Server Started here
app.listen(port);
console.log(' RESTful API server started on: ' + port);
module.exports = app;
