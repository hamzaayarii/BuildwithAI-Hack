import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import {
  createBoard,
  getRandomTetromino,
  TETROMINOES,
  isValidPosition,
  placePiece,
  clearLines,
  calculateScore,
  calculateLevel,
  getDropSpeed,
  rotatePiece,
  addGarbageLines,
  BOARD_WIDTH,
  BOARD_HEIGHT
} from '../utils/tetris';
import './Game.css';

const CELL_SIZE = 30;
const PREVIEW_SIZE = 20;

const Game = () => {
  const { mode = 'single' } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Player state
  const [board, setBoard] = useState(createBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPieces, setNextPieces] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [softDropCount, setSoftDropCount] = useState(0);
  const [hardDropCount, setHardDropCount] = useState(0);
  const [tetrises, setTetrises] = useState(0);
  
  // Multiplayer state
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentFound, setOpponentFound] = useState(false);
  const [opponentBoard, setOpponentBoard] = useState(createBoard());
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentLevel, setOpponentLevel] = useState(0);
  const [opponentLinesCleared, setOpponentLinesCleared] = useState(0);
  const [opponentCurrentPiece, setOpponentCurrentPiece] = useState(null);
  const [opponentNextPieces, setOpponentNextPieces] = useState([]);
  const [opponentUsername, setOpponentUsername] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  
  const canvasRef = useRef(null);
  const opponentCanvasRef = useRef(null);
  const previewRef = useRef(null);
  const gameLoopRef = useRef(null);
  const dropTimerRef = useRef(null);
  const socketRef = useRef(null);
  const lastDropTimeRef = useRef(Date.now());
  const gameStartTimeRef = useRef(null);
  const stateUpdateIntervalRef = useRef(null);

  // Initialize game
  useEffect(() => {
    if (gameStarted && !gameOver) {
      initializeGame();
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (dropTimerRef.current) {
        clearTimeout(dropTimerRef.current);
      }
      if (stateUpdateIntervalRef.current) {
        clearInterval(stateUpdateIntervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [gameStarted, gameOver]);

  // Multiplayer setup
  useEffect(() => {
    if (mode === 'multiplayer') {
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
      
      socketRef.current.on('connect', () => {
        console.log('✅ Connected to server:', socketRef.current.id);
        setSocketConnected(true);
        // If we're in multiplayer mode and waiting, try to find match again
        if (mode === 'multiplayer' && user && !gameStarted) {
          console.log('🔍 Socket connected, starting matchmaking...');
          socketRef.current.emit('find-match', {
            userId: user._id || user.id,
            username: user.username
          });
        }
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        setSocketConnected(false);
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setSocketConnected(false);
      });
      
      socketRef.current.on('reconnect', () => {
        console.log('🔄 Reconnected to server');
        setSocketConnected(true);
      });
      
      socketRef.current.on('waiting-for-opponent', (data) => {
        setWaitingForOpponent(true);
        setRoomId(data.roomId);
      });

      socketRef.current.on('match-found', (data) => {
        console.log('🎮 Match found!', data);
        setWaitingForOpponent(false);
        setOpponentFound(true);
        setRoomId(data.roomId);
        const otherPlayer = data.players.find(p => p.userId !== (user._id || user.id));
        if (otherPlayer) {
          setOpponentUsername(otherPlayer.username || 'Opponent');
          console.log('👤 Opponent:', otherPlayer.username);
        }
        // Start game when match is found
        if (!gameStarted) {
          console.log('🚀 Starting game...');
          setGameStarted(true);
        }
      });

      socketRef.current.on('opponent-state', (opponentState) => {
        // Update opponent state immediately for real-time sync
        // Update all state at once to prevent partial updates
        setOpponentBoard(prev => opponentState.board || prev);
        setOpponentScore(opponentState.score ?? 0);
        setOpponentLevel(opponentState.level ?? 0);
        setOpponentLinesCleared(opponentState.linesCleared ?? 0);
        setOpponentCurrentPiece(opponentState.currentPiece || null);
        setOpponentNextPieces(opponentState.nextPieces || []);
      });

      socketRef.current.on('receive-garbage', (data) => {
        console.log(`📥 Received ${data.lines} garbage line(s) from opponent`);
        setBoard(prev => {
          const newBoard = addGarbageLines(prev, data.lines);
          return newBoard;
        });
      });

      socketRef.current.on('opponent-lost', (data) => {
        setGameWon(true);
        setGameOver(true);
        // Update user stats for win
        if (user) {
          axios.post('/api/scores', {
            score,
            level,
            linesCleared,
            gameMode: 'multiplayer',
            gameDuration: Math.floor((Date.now() - gameStartTimeRef.current) / 1000),
            piecesPlaced: linesCleared + Math.floor(score / 100),
            tetrises,
            won: true
          }).catch(err => console.error('Error saving win:', err));
        }
      });

      socketRef.current.on('opponent-disconnected', () => {
        setGameWon(true);
        setGameOver(true);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [mode, user]);

  // Start matchmaking for multiplayer (only when socket is connected)
  useEffect(() => {
    if (mode === 'multiplayer' && socketRef.current && user && !gameStarted) {
      if (socketRef.current.connected) {
        console.log('🔍 Starting matchmaking...');
        setSocketConnected(true);
        socketRef.current.emit('find-match', {
          userId: user._id || user.id,
          username: user.username
        });
      } else {
        // Wait for connection
        console.log('⏳ Waiting for socket connection...');
        socketRef.current.once('connect', () => {
          console.log('🔍 Socket connected, starting matchmaking...');
          socketRef.current.emit('find-match', {
            userId: user._id || user.id,
            username: user.username
          });
        });
      }
    }
  }, [mode, user, gameStarted]);

  // Send game state updates to opponent (multiplayer) - very frequent for real-time sync
  useEffect(() => {
    if (mode === 'multiplayer' && gameStarted && !gameOver && socketRef.current && roomId && opponentFound) {
      // Send state updates every 100ms for smooth real-time synchronization
      stateUpdateIntervalRef.current = setInterval(() => {
        if (socketRef.current && socketRef.current.connected && roomId) {
          socketRef.current.emit('game-state', {
            roomId,
            board,
            score,
            level,
            linesCleared,
            currentPiece,
            nextPieces
          });
        }
      }, 100);
    }

    return () => {
      if (stateUpdateIntervalRef.current) {
        clearInterval(stateUpdateIntervalRef.current);
      }
    };
  }, [mode, gameStarted, gameOver, roomId, board, score, level, linesCleared, currentPiece, nextPieces, opponentFound]);
  
  // Send immediate updates when piece moves or rotates (no debounce for instant sync)
  useEffect(() => {
    if (mode === 'multiplayer' && gameStarted && !gameOver && socketRef.current && roomId && socketConnected && currentPiece) {
      // Send immediately when piece moves/rotates for instant synchronization
      if (socketRef.current && socketRef.current.connected && roomId) {
        socketRef.current.emit('game-state', {
          roomId,
          board,
          score,
          level,
          linesCleared,
          currentPiece,
          nextPieces
        });
      }
    }
  }, [mode, gameStarted, gameOver, roomId, socketConnected, currentPiece?.x, currentPiece?.y, currentPiece?.rotation, board, score, level, linesCleared, nextPieces]);

  // Define drawOpponent before game loop so it can be used in useEffect
  const drawOpponent = useCallback(() => {
    const canvas = opponentCanvasRef.current;
    if (!canvas || mode !== 'multiplayer' || !opponentFound) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw opponent board
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        
        if (opponentBoard && opponentBoard[row] && opponentBoard[row][col] !== 0) {
          ctx.fillStyle = opponentBoard[row][col];
          ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(x, y, CELL_SIZE - 1, 5);
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.strokeRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }

    // Draw opponent current piece
    if (opponentCurrentPiece && opponentCurrentPiece.shape) {
      ctx.fillStyle = opponentCurrentPiece.color;
      for (let row = 0; row < opponentCurrentPiece.shape.length; row++) {
        for (let col = 0; col < opponentCurrentPiece.shape[row].length; col++) {
          if (opponentCurrentPiece.shape[row][col]) {
            const x = (opponentCurrentPiece.x + col) * CELL_SIZE;
            const y = (opponentCurrentPiece.y + row) * CELL_SIZE;
            
            if (y >= 0) {
              ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
              
              ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
              ctx.fillRect(x, y, CELL_SIZE - 1, 5);
              ctx.fillStyle = opponentCurrentPiece.color;
            }
          }
        }
      }
    }
  }, [mode, opponentBoard, opponentCurrentPiece, opponentFound]);

  // Game loop - continuous rendering for real-time updates
  useEffect(() => {
    let animationId;
    
    const gameLoop = () => {
      if (gameStarted && !gameOver && !paused) {
        if (currentPiece) {
          const now = Date.now();
          const dropSpeed = getDropSpeed(level);
          
          if (now - lastDropTimeRef.current >= dropSpeed) {
            handleDrop();
            lastDropTimeRef.current = now;
          }
        }

        // Always render both boards for real-time sync
        draw();
        if (mode === 'multiplayer' && opponentFound) {
          drawOpponent();
        }
      }
      
      // Continue the loop
      animationId = requestAnimationFrame(gameLoop);
    };

    if (gameStarted && !gameOver && !paused) {
      animationId = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameStarted, gameOver, paused, currentPiece, board, level, mode, opponentFound, drawOpponent, opponentBoard, opponentCurrentPiece]);

  const initializeGame = () => {
    const newBoard = createBoard();
    setBoard(newBoard);
    setScore(0);
    setLevel(0);
    setLinesCleared(0);
    setGameOver(false);
    setGameWon(false);
    setSoftDropCount(0);
    setHardDropCount(0);
    setTetrises(0);
    gameStartTimeRef.current = Date.now();

    // Initialize next pieces queue
    const initialNextPieces = [
      getRandomTetromino(),
      getRandomTetromino(),
      getRandomTetromino()
    ];
    setNextPieces(initialNextPieces);

    // Spawn first piece
    spawnPiece(initialNextPieces[0], initialNextPieces.slice(1));
  };

  const spawnPiece = (pieceType, remainingNext) => {
    const piece = TETROMINOES[pieceType];
    const startX = Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2);
    const startY = 0;

    const newPiece = {
      type: pieceType,
      x: startX,
      y: startY,
      rotation: 0,
      shape: piece.shape,
      color: piece.color
    };

    // Check if game over
    if (!isValidPosition(board, newPiece.shape, newPiece.x, newPiece.y)) {
      setGameOver(true);
      // In multiplayer, notify opponent
      if (mode === 'multiplayer' && socketRef.current && roomId) {
        socketRef.current.emit('game-over', {
          roomId,
          userId: user._id || user.id,
          score,
          level
        });
        // Update user stats for loss
        saveScore(false);
      } else {
        saveScore();
      }
      return;
    }

    setCurrentPiece(newPiece);

    // Add new piece to queue
    const newNext = [...remainingNext, getRandomTetromino()];
    setNextPieces(newNext);
  };

  const handleDrop = () => {
    if (!currentPiece) return;

    const newY = currentPiece.y + 1;
    if (isValidPosition(board, currentPiece.shape, currentPiece.x, newY)) {
      setCurrentPiece(prev => ({ ...prev, y: newY }));
    } else {
      lockPiece();
    }
  };

  const lockPiece = () => {
    if (!currentPiece) return;

    const newBoard = placePiece(board, currentPiece.shape, currentPiece.x, currentPiece.y, currentPiece.color);
    const { board: clearedBoard, linesCleared: cleared } = clearLines(newBoard);
    
    setBoard(clearedBoard);
    
    if (cleared > 0) {
      const newLinesCleared = linesCleared + cleared;
      const newLevel = calculateLevel(newLinesCleared);
      const points = calculateScore(cleared, newLevel, 0, 0);
      
      setLinesCleared(newLinesCleared);
      setLevel(newLevel);
      setScore(prev => prev + points);
      
      if (cleared === 4) {
        setTetrises(prev => prev + 1);
      }

      // Multiplayer: Send garbage lines to opponent immediately
      if (mode === 'multiplayer' && socketRef.current && socketConnected && roomId) {
        let garbageLines = 0;
        if (cleared === 2) garbageLines = 1;
        else if (cleared === 3) garbageLines = 2;
        else if (cleared === 4) garbageLines = 4;
        
        if (garbageLines > 0 && socketRef.current.connected) {
          socketRef.current.emit('garbage-lines', {
            roomId,
            lines: garbageLines,
            fromPlayer: user.username
          });
          console.log(`📤 Sent ${garbageLines} garbage line(s) to opponent`);
        }
      }
    }

    // Spawn next piece
    if (nextPieces.length > 0) {
      spawnPiece(nextPieces[0], nextPieces.slice(1));
    }
  };

  const movePiece = (direction) => {
    if (!currentPiece || gameOver || paused) return;

    const dx = direction === 'left' ? -1 : 1;
    const newX = currentPiece.x + dx;

    if (isValidPosition(board, currentPiece.shape, newX, currentPiece.y)) {
      setCurrentPiece(prev => ({ ...prev, x: newX }));
    }
  };

  const rotatePieceClockwise = () => {
    if (!currentPiece || gameOver || paused) return;

    const baseShape = TETROMINOES[currentPiece.type].shape;
    const newRotation = (currentPiece.rotation + 1) % 4;
    const rotatedShape = rotatePiece(baseShape, newRotation);

    if (isValidPosition(board, rotatedShape, currentPiece.x, currentPiece.y)) {
      setCurrentPiece(prev => ({
        ...prev,
        rotation: newRotation,
        shape: rotatedShape
      }));
    } else {
      // Try wall kicks
      const offsets = [-1, 1, -2, 2];
      for (const offset of offsets) {
        if (isValidPosition(board, rotatedShape, currentPiece.x + offset, currentPiece.y)) {
          setCurrentPiece(prev => ({
            ...prev,
            rotation: newRotation,
            shape: rotatedShape,
            x: prev.x + offset
          }));
          return;
        }
      }
    }
  };

  const softDrop = () => {
    if (!currentPiece || gameOver || paused) return;
    handleDrop();
    setSoftDropCount(prev => prev + 1);
    setScore(prev => prev + 5);
  };

  const hardDrop = () => {
    if (!currentPiece || gameOver || paused) return;

    let dropDistance = 0;
    let testY = currentPiece.y;

    while (isValidPosition(board, currentPiece.shape, currentPiece.x, testY + 1)) {
      testY++;
      dropDistance++;
    }

    if (dropDistance > 0) {
      setCurrentPiece(prev => ({ ...prev, y: testY }));
      setHardDropCount(prev => prev + 1);
      setScore(prev => prev + dropDistance * 5);
      lockPiece();
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        
        if (board[row][col] !== 0) {
          ctx.fillStyle = board[row][col];
          ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(x, y, CELL_SIZE - 1, 5);
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.strokeRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const x = (currentPiece.x + col) * CELL_SIZE;
            const y = (currentPiece.y + row) * CELL_SIZE;
            
            if (y >= 0) {
              ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
              
              ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
              ctx.fillRect(x, y, CELL_SIZE - 1, 5);
              ctx.fillStyle = currentPiece.color;
            }
          }
        }
      }
    }

    drawPreview();
  };

  const drawPreview = () => {
    const canvas = previewRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nextPieces.slice(0, 3).forEach((pieceType, idx) => {
      const piece = TETROMINOES[pieceType];
      const offsetY = idx * 80;
      
      ctx.fillStyle = piece.color;
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const x = col * PREVIEW_SIZE + 10;
            const y = row * PREVIEW_SIZE + offsetY + 10;
            ctx.fillRect(x, y, PREVIEW_SIZE - 1, PREVIEW_SIZE - 1);
          }
        }
      }
    });
  };

  const saveScore = async (won = false) => {
    if (!user) return;

    const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);

    try {
      await axios.post('/api/scores', {
        score,
        level,
        linesCleared,
        gameMode: mode,
        gameDuration,
        piecesPlaced: linesCleared + Math.floor(score / 100),
        tetrises,
        won: mode === 'multiplayer' ? won : undefined
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleKeyPress = useCallback((e) => {
    if (!gameStarted || gameOver) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        movePiece('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        movePiece('right');
        break;
      case 'ArrowUp':
        e.preventDefault();
        rotatePieceClockwise();
        break;
      case 'ArrowDown':
        e.preventDefault();
        softDrop();
        break;
      case ' ':
        e.preventDefault();
        hardDrop();
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        setPaused(prev => !prev);
        break;
      default:
        break;
    }
  }, [gameStarted, gameOver, currentPiece, board]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startGame = () => {
    if (mode === 'multiplayer') {
      // Matchmaking will start automatically via useEffect
      setWaitingForOpponent(true);
    } else {
      setGameStarted(true);
      initializeGame();
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setGameWon(false);
    setPaused(false);
    setWaitingForOpponent(false);
    setOpponentFound(false);
    initializeGame();
  };

  if (!gameStarted && mode === 'multiplayer' && waitingForOpponent) {
    return (
      <div className="game-container">
        <div className="game-start-screen">
          <h1>🎮 Tetris Multiplayer</h1>
          <p>🔍 Searching for opponent...</p>
          <div className="loading-spinner"></div>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="game-container">
        <div className="game-start-screen">
          <h1>🎮 Tetris</h1>
          <p>Ready to play {mode === 'multiplayer' ? 'Multiplayer' : 'Single Player'}?</p>
          <button className="btn btn-primary" onClick={startGame}>
            Start Game
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="game-container">
        <div className="game-over-screen">
          <h1>{gameWon ? '🎉 You Won!' : 'Game Over!'}</h1>
          {mode === 'multiplayer' && gameWon && (
            <p className="winner-message">Your opponent blocked out! You're the winner!</p>
          )}
          <div className="final-stats">
            <div className="stat-item">
              <span className="stat-label">Final Score</span>
              <span className="stat-value">{score.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Level Reached</span>
              <span className="stat-value">{level}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Lines Cleared</span>
              <span className="stat-value">{linesCleared}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tetrises</span>
              <span className="stat-value">{tetrises}</span>
            </div>
          </div>
          <div className="game-over-actions">
            <button className="btn btn-primary" onClick={resetGame}>
              Play Again
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`game-container ${mode === 'multiplayer' ? 'multiplayer-mode' : ''}`}>
      <div className="game-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        {mode === 'multiplayer' && opponentFound && (
          <div className="opponent-info">
            <span>vs {opponentUsername}</span>
            <span className={`connection-status ${socketConnected ? 'connected' : 'disconnected'}`}>
              {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        )}
        <button className="pause-btn" onClick={() => setPaused(prev => !prev)}>
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      <div className={`game-layout ${mode === 'multiplayer' ? 'split-screen' : ''}`}>
        {mode === 'multiplayer' && (
          <div className="opponent-section">
            <div className="opponent-header">
              <h3>{opponentUsername || 'Opponent'}</h3>
              <div className="opponent-stats">
                <span>Score: {opponentScore.toLocaleString()}</span>
                <span>Level: {opponentLevel}</span>
                <span>Lines: {opponentLinesCleared}</span>
              </div>
            </div>
            <div className="game-board-container opponent-board">
              <canvas
                ref={opponentCanvasRef}
                width={BOARD_WIDTH * CELL_SIZE}
                height={BOARD_HEIGHT * CELL_SIZE}
                className="game-canvas"
              />
            </div>
          </div>
        )}

        <div className="player-section">
          <div className="game-sidebar">
            <div className="game-stat">
              <div className="stat-label">Score</div>
              <div className="stat-value">{score.toLocaleString()}</div>
            </div>
            <div className="game-stat">
              <div className="stat-label">Level</div>
              <div className="stat-value">{level}</div>
            </div>
            <div className="game-stat">
              <div className="stat-label">Lines</div>
              <div className="stat-value">{linesCleared}</div>
            </div>
            <div className="next-pieces">
              <div className="next-label">Next Pieces</div>
              <canvas
                ref={previewRef}
                width={100}
                height={260}
                className="preview-canvas"
              />
            </div>
          </div>

          <div className="game-board-container">
            <div className="player-header">
              <h3>{user?.username || 'You'}</h3>
            </div>
            <canvas
              ref={canvasRef}
              width={BOARD_WIDTH * CELL_SIZE}
              height={BOARD_HEIGHT * CELL_SIZE}
              className="game-canvas"
            />
            {paused && (
              <div className="pause-overlay">
                <h2>Paused</h2>
                <p>Press P to resume</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
