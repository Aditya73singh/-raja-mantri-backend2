// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://raja-mantri-frontend2.vercel.app',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', gameRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.IO Logic
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('create_room', (username) => {
    const roomId = generateRoomId();
    rooms.set(roomId, {
      players: [{ id: socket.id, username, points: 0 }],
      status: 'waiting'
    });
    socket.join(roomId);
    socket.emit('room_created', roomId);
    io.to(roomId).emit('user_joined', rooms.get(roomId).players);
  });

  socket.on('join_room', ({ roomId, username }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }
    if (room.players.length >= 4) {
      socket.emit('error', 'Room is full');
      return;
    }

    room.players.push({ id: socket.id, username, points: 0 });
    socket.join(roomId);
    io.to(roomId).emit('user_joined', room.players);

    if (room.players.length === 4) {
      assignRoles(roomId);
    }
  });

  socket.on('make_guess', ({ roomId, guessedUserId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const mantri = room.players.find(p => p.role === 'Mantri');
    const chor = room.players.find(p => p.role === 'Chor');
    
    if (socket.id !== mantri.id) return;

    const success = guessedUserId === chor.id;
    if (!success) {
      // Swap points if guess is wrong
      const mantriPoints = mantri.points;
      mantri.points = chor.points;
      chor.points = mantriPoints;
    }

    io.to(roomId).emit('guess_result', { success, players: room.players });
  });

  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomId).emit('user_left', room.players);
        if (room.players.length === 0) {
          rooms.delete(roomId);
        }
        break;
      }
    }
  });
});

function assignRoles(roomId) {
  const room = rooms.get(roomId);
  const roles = shuffleArray(['Raja', 'Mantri', 'Sipahi', 'Chor']);
  const points = { Raja: 1000, Mantri: 900, Sipahi: 700, Chor: 0 };

  room.players = room.players.map((player, index) => ({
    ...player,
    role: roles[index],
    points: points[roles[index]],
    isMe: true // Will be filtered client-side
  }));

  room.status = 'playing';
  io.to(roomId).emit('roles_assigned', room.players.map(p => ({
    ...p,
    isMe: p.id === socket.id
  })));
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
