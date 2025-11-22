const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/games', require('./routes/games'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tetris API is running' });
});

// Socket.io for multiplayer
const rooms = new Map(); // roomId -> { players: [], status: 'waiting' | 'playing' }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Find or create a room for matchmaking
  socket.on('find-match', (userData) => {
    // Find a room with only one player waiting
    let availableRoom = null;
    for (const [roomId, room] of rooms.entries()) {
      if (room.status === 'waiting' && room.players.length === 1) {
        availableRoom = roomId;
        break;
      }
    }

    if (availableRoom) {
      // Join existing room
      const room = rooms.get(availableRoom);
      room.players.push({ socketId: socket.id, userId: userData.userId, username: userData.username });
      room.status = 'playing';
      
      socket.join(availableRoom);
      socket.roomId = availableRoom;
      
      // Notify both players that match is ready
      io.to(availableRoom).emit('match-found', {
        roomId: availableRoom,
        players: room.players
      });
      
      console.log(`Match found in room ${availableRoom}`);
    } else {
      // Create new room
      const newRoomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      rooms.set(newRoomId, {
        players: [{ socketId: socket.id, userId: userData.userId, username: userData.username }],
        status: 'waiting'
      });
      
      socket.join(newRoomId);
      socket.roomId = newRoomId;
      
      socket.emit('waiting-for-opponent', { roomId: newRoomId });
      console.log(`Created new room ${newRoomId}, waiting for opponent`);
    }
  });

  // Join specific room (for reconnection or direct join)
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId;
    
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      socket.emit('room-joined', {
        roomId,
        players: room.players,
        status: room.status
      });
    }
  });

  // Send game state to opponent - real-time synchronization
  socket.on('game-state', (data) => {
    if (socket.roomId) {
      // Broadcast to all other players in the room (excluding sender)
      // This ensures both players see each other's moves in real-time
      socket.to(socket.roomId).emit('opponent-state', {
        board: data.board,
        score: data.score,
        level: data.level,
        linesCleared: data.linesCleared,
        currentPiece: data.currentPiece,
        nextPieces: data.nextPieces
      });
    }
  });

  // Send garbage lines to opponent
  socket.on('garbage-lines', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('receive-garbage', {
        lines: data.lines,
        fromPlayer: data.fromPlayer
      });
    }
  });

  // Handle game over
  socket.on('game-over', (data) => {
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        // Notify opponent that this player lost
        socket.to(socket.roomId).emit('opponent-lost', {
          winner: data.userId,
          finalScore: data.score,
          finalLevel: data.level
        });
        
        // Clean up room after game ends
        setTimeout(() => {
          rooms.delete(socket.roomId);
        }, 60000); // Clean up after 1 minute
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        // Remove player from room
        room.players = room.players.filter(p => p.socketId !== socket.id);
        
        // Notify opponent if game was in progress
        if (room.status === 'playing' && room.players.length > 0) {
          socket.to(socket.roomId).emit('opponent-disconnected');
        }
        
        // Clean up empty rooms
        if (room.players.length === 0) {
          rooms.delete(socket.roomId);
        } else {
          room.status = 'waiting';
        }
      }
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tetris', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Export io for use in routes
app.set('io', io);

