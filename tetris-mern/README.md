# 🎮 Tetris MERN Stack Game

A full-featured Tetris game built with the MERN stack (MongoDB, Express.js, React, Node.js) and Python integration. Features single-player and multiplayer modes with real-time gameplay, leaderboards, and user profiles.

## ✨ Features

### Core Game Features
- **10x20 Playfield**: Classic Tetris grid
- **7 Tetromino Shapes**: I, O, T, S, Z, J, and L pieces
- **Responsive Controls**: 
  - Arrow keys for movement and rotation
  - Soft drop (↓) and hard drop (Space)
- **Line Clearing**: Complete horizontal lines to clear them
- **Progressive Scoring System**:
  - Single line: 100 points
  - Double: 300 points
  - Triple: 500 points
  - Tetris (4 lines): 800 points
  - Soft/Hard drop bonus: 5 points per block
- **Level System**: Level up every 10 lines cleared
- **Speed Progression**: Game speed increases with each level
- **Next Piece Preview**: See upcoming pieces (1-3 ahead)

### Multiplayer Features
- **Real-time Battles**: Head-to-head multiplayer mode
- **Garbage Lines**: Send incomplete lines to opponents
  - Double (2 lines) → 1 garbage line
  - Triple (3 lines) → 2 garbage lines
  - Tetris (4 lines) → 4 garbage lines
- **Split Screen**: Side-by-side gameplay
- **Win/Loss Tracking**: Track multiplayer statistics

### User Features
- **User Authentication**: Register and login system
- **Profile Management**: View stats and achievements
- **Leaderboards**: Global and mode-specific rankings
- **Game History**: Track all your games and scores
- **Statistics**: High scores, levels reached, lines cleared

## 🚀 Tech Stack

- **Frontend**: React 18, React Router, Axios, Socket.io Client
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Real-time**: Socket.io for multiplayer
- **Authentication**: JWT (JSON Web Tokens)
- **Python Service**: Flask (for future AI/analytics features)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Python 3.8+ (for Python service)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/tetris
JWT_SECRET=your-secret-key-here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Python Service Setup (Optional)

1. Navigate to python-service directory:
```bash
cd python-service
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Start the Python service:
```bash
python app.py
```

The Python service will run on `http://localhost:8001`

## 🎮 How to Play

### Controls
- **← →**: Move piece left/right
- **↑**: Rotate piece clockwise
- **↓**: Soft drop (faster fall)
- **Space**: Hard drop (instant drop)
- **P**: Pause/Resume

### Gameplay
1. Pieces fall from the top of the playfield
2. Move and rotate pieces to create complete horizontal lines
3. Clear lines to score points and level up
4. Game ends when a new piece can't spawn (blocking out)
5. Try to achieve the highest score possible!

### Multiplayer
1. Select "Multiplayer" mode from the dashboard
2. Create or join a room
3. Play simultaneously with your opponent
4. Clear multiple lines to send garbage lines to your opponent
5. Last player standing wins!

## 📁 Project Structure

```
tetris-mern/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React context
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Game logic utilities
│   │   └── App.js
│   └── package.json
├── python-service/
│   ├── app.py           # Flask application
│   └── requirements.txt
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Scores
- `POST /api/scores` - Save game score
- `GET /api/scores/leaderboard` - Get leaderboard
- `GET /api/scores/user/:userId` - Get user scores
- `GET /api/scores/personal-best` - Get personal best

### Games
- `POST /api/games` - Create new game
- `GET /api/games/:id` - Get game by ID
- `PUT /api/games/:id/state` - Update game state

## 🎯 Future Enhancements

- [ ] AI opponent mode
- [ ] Tournament system
- [ ] Custom themes and skins
- [ ] Mobile app version
- [ ] Advanced statistics and analytics
- [ ] Replay system
- [ ] Social features (friends, challenges)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Classic Tetris game mechanics
- Modern UI/UX design patterns
- MERN stack community

---

**Enjoy playing Tetris! 🎮**

