// Tetris Game Logic

// Tetromino shapes (I, O, T, S, Z, J, L)
export const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00f0f0'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#f0f000'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#a000f0'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00f000'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#f00000'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000f0'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#f0a000'
  }
};

// Board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Create empty board
export const createBoard = () => {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
};

// Get random tetromino
export const getRandomTetromino = () => {
  const types = Object.keys(TETROMINOES);
  return types[Math.floor(Math.random() * types.length)];
};

// Rotate tetromino 90 degrees clockwise
export const rotatePiece = (piece, rotation) => {
  let rotated = piece;
  for (let i = 0; i < rotation % 4; i++) {
    rotated = rotated[0].map((_, index) =>
      rotated.map(row => row[index]).reverse()
    );
  }
  return rotated;
};

// Check if piece can be placed at position
export const isValidPosition = (board, piece, x, y) => {
  for (let row = 0; row < piece.length; row++) {
    for (let col = 0; col < piece[row].length; col++) {
      if (piece[row][col]) {
        const newX = x + col;
        const newY = y + row;
        
        // Check boundaries
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }
        
        // Check if position is already filled (ignore top overflow)
        if (newY >= 0 && board[newY][newX] !== 0) {
          return false;
        }
      }
    }
  }
  return true;
};

// Place piece on board
export const placePiece = (board, piece, x, y, color) => {
  const newBoard = board.map(row => [...row]);
  
  for (let row = 0; row < piece.length; row++) {
    for (let col = 0; col < piece[row].length; col++) {
      if (piece[row][col]) {
        const newX = x + col;
        const newY = y + row;
        if (newY >= 0 && newY < BOARD_HEIGHT && newX >= 0 && newX < BOARD_WIDTH) {
          newBoard[newY][newX] = color;
        }
      }
    }
  }
  
  return newBoard;
};

// Clear completed lines
export const clearLines = (board) => {
  const newBoard = [];
  let linesCleared = 0;
  
  for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
    if (board[row].every(cell => cell !== 0)) {
      linesCleared++;
    } else {
      newBoard.unshift(board[row]);
    }
  }
  
  // Add empty rows at top
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }
  
  return { board: newBoard, linesCleared };
};

// Calculate score
export const calculateScore = (linesCleared, level, softDropCount = 0, hardDropCount = 0) => {
  let score = 0;
  
  // Line clearing scores (base values as per requirements)
  switch (linesCleared) {
    case 1:
      score = 100;
      break;
    case 2:
      score = 300;
      break;
    case 3:
      score = 500;
      break;
    case 4:
      score = 800;
      break;
    default:
      score = 0;
  }
  
  // Optional: Multiply by level for progressive difficulty reward
  // score = score * (level + 1);
  
  // Soft drop and hard drop bonuses (5 points per block)
  score += (softDropCount + hardDropCount) * 5;
  
  return score;
};

// Calculate level from lines cleared
export const calculateLevel = (linesCleared) => {
  return Math.floor(linesCleared / 10);
};

// Calculate drop speed based on level
export const getDropSpeed = (level) => {
  // Fixed speed: 1 second (1000ms) per drop
  return 1000;
};

// Add garbage lines to board
export const addGarbageLines = (board, count) => {
  const newBoard = [...board];
  
  for (let i = 0; i < count; i++) {
    // Create garbage line with one random empty column
    const emptyCol = Math.floor(Math.random() * BOARD_WIDTH);
    const garbageLine = Array(BOARD_WIDTH).fill('#666666').map((_, idx) => 
      idx === emptyCol ? 0 : '#666666'
    );
    
    newBoard.pop(); // Remove top line
    newBoard.unshift(garbageLine); // Add garbage at bottom
  }
  
  return newBoard;
};

