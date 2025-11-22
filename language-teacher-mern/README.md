# 🌍 Language Teacher - MERN Stack Application

A full-stack language learning application built with MERN (MongoDB, Express, React, Node.js) and Python. Practice conversations with AI, track your progress, compete with friends, and unlock achievements!

## ✨ Features

### Core Features
- **Multi-language Support**: Practice 10+ languages (Spanish, French, German, Italian, Portuguese, Japanese, Chinese, Korean, Arabic, Russian)
- **AI-Powered Conversations**: Real-time chat practice with adaptive AI teacher
- **Performance Evaluation**: Detailed feedback with scores, strengths, and areas for improvement
- **User Management**: Complete authentication and user profiles
- **Progress Tracking**: History of all sessions with statistics
- **Level System**: XP-based leveling with achievements
- **Friends System**: Add friends and view their achievements and levels
- **Gamification**: Achievements, streaks, and XP rewards

### Enhanced Features
- **Goal-Oriented Sessions**: Scenario-based or skill-focused practice
- **Adaptive Difficulty**: AI adjusts complexity based on performance
- **Multiple AI Personas**: Choose from different teaching styles
- **Bilingual Mode**: See translations alongside target language
- **Friend Challenges**: Compete with friends on specific scenarios

## 🏗️ Architecture

```
language-teacher-mern/
├── backend/          # Node.js/Express API
├── frontend/         # React application
├── python-service/   # Python Flask service for AI integration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (local or MongoDB Atlas)
- Groq API key ([Get one free](https://console.groq.com/keys)) - Add to backend .env file

### Installation

1. **Clone the repository**
   ```bash
   cd language-teacher-mern
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI, JWT secret, and GROQ_API_KEY
   # Get your Groq API key at: https://console.groq.com/keys
   npm run dev
   ```

3. **Python Service Setup**
   ```bash
   cd python-service
   pip install -r requirements.txt
   cp .env.example .env
   python app.py
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Environment Variables

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/language-teacher
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
PYTHON_SERVICE_URL=http://localhost:8001
NODE_ENV=development
GROQ_API_KEY=your-groq-api-key-here
```

**Python Service (.env)**
```
PORT=8001
FLASK_ENV=development
```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/:id` - Get specific conversation
- `POST /api/conversations/:id/messages` - Add message
- `POST /api/conversations/:id/ai-response` - Get AI response

### Evaluations
- `POST /api/evaluations` - Create evaluation
- `GET /api/evaluations` - Get user's evaluations
- `GET /api/evaluations/stats/summary` - Get evaluation statistics

### Friends
- `POST /api/friends/request` - Send friend request
- `GET /api/friends/requests` - Get friend requests
- `PUT /api/friends/requests/:id` - Accept/reject request
- `GET /api/friends` - Get friends list
- `GET /api/friends/:id/profile` - Get friend's profile

### Achievements
- `GET /api/achievements` - Get all achievements
- `POST /api/achievements/check` - Check and unlock achievements

### History
- `GET /api/history` - Get performance history
- `GET /api/history/stats` - Get detailed statistics

## 🗄️ Database Models

### User
- Authentication (username, email, password)
- Profile (avatar, XP, level, streak)
- Friends and friend requests
- Languages practiced
- Achievements

### Conversation
- User reference
- Language and settings
- Messages array
- Status (active, completed, evaluated)

### Evaluation
- Conversation reference
- Score and feedback
- Strengths and improvements
- Mistakes and recommendations
- XP awarded

### Challenge
- Creator and opponent
- Challenge type and target score
- Scores and winner
- Status tracking

## 🎮 Usage

1. **Register/Login**: Create an account or sign in
2. **Select Language**: Choose a language to practice (API key is configured in backend)
4. **Customize Session**: Select scenario, skill focus, or free conversation
5. **Chat**: Practice conversations with AI teacher
6. **Evaluate**: Get detailed performance feedback
7. **Track Progress**: View history and statistics
8. **Add Friends**: Search and add friends to see their progress
9. **Unlock Achievements**: Complete challenges to earn achievements

## 🔧 Development

### Backend
```bash
cd backend
npm run dev  # Development with nodemon
npm start    # Production
```

### Python Service
```bash
cd python-service
python app.py  # Development
```

### Frontend
```bash
cd frontend
npm start  # Development server (port 3000)
npm build  # Production build
```

## 📝 Notes

- The Groq API key is stored in backend .env file (secure server-side configuration)
- Python service handles all AI/Groq API calls using the API key from backend
- MongoDB stores all user data, conversations, and evaluations
- JWT tokens are used for authentication
- Friends system allows viewing achievements and levels

## 🐛 Troubleshooting

- **MongoDB Connection**: Ensure MongoDB is running and URI is correct
- **Python Service**: Check that Flask service is running on port 8001
- **CORS Issues**: Verify backend CORS settings
- **API Key**: Ensure GROQ_API_KEY is set in backend .env file and is valid

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🙏 Acknowledgments

- Built with OpenAI/Groq API
- MERN stack architecture
- Python Flask for AI service integration

---

**Happy Learning! 🎉**

