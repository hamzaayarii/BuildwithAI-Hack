"""
Python Service for Tetris Game
Provides AI opponent, analytics, and advanced game calculations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
PORT = int(os.getenv('PORT', 8001))

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'Tetris Python Service',
        'version': '1.0.0'
    })

@app.route('/api/ai/best-move', methods=['POST'])
def calculate_best_move():
    """
    Calculate the best move for AI opponent
    Future implementation for AI opponent mode
    """
    try:
        data = request.json
        board = data.get('board', [])
        current_piece = data.get('currentPiece', {})
        next_pieces = data.get('nextPieces', [])
        
        # TODO: Implement AI algorithm (e.g., genetic algorithm, minimax)
        # For now, return a placeholder response
        
        return jsonify({
            'success': True,
            'move': {
                'x': 0,
                'y': 0,
                'rotation': 0,
                'action': 'move'
            },
            'note': 'AI opponent feature coming soon'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analytics/game-stats', methods=['POST'])
def analyze_game_stats():
    """
    Analyze game statistics and provide insights
    """
    try:
        data = request.json
        game_history = data.get('gameHistory', [])
        
        # Calculate statistics
        total_games = len(game_history)
        avg_score = sum(game.get('score', 0) for game in game_history) / total_games if total_games > 0 else 0
        avg_level = sum(game.get('level', 0) for game in game_history) / total_games if total_games > 0 else 0
        avg_lines = sum(game.get('linesCleared', 0) for game in game_history) / total_games if total_games > 0 else 0
        
        return jsonify({
            'success': True,
            'stats': {
                'totalGames': total_games,
                'averageScore': round(avg_score, 2),
                'averageLevel': round(avg_level, 2),
                'averageLinesCleared': round(avg_lines, 2),
                'improvementTrend': 'positive'  # TODO: Calculate actual trend
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai/difficulty', methods=['POST'])
def adjust_difficulty():
    """
    Adjust game difficulty based on player performance
    """
    try:
        data = request.json
        player_stats = data.get('stats', {})
        
        # Calculate appropriate difficulty
        level = player_stats.get('level', 0)
        lines_cleared = player_stats.get('linesCleared', 0)
        
        # Simple difficulty calculation
        difficulty = min(10, max(1, level + (lines_cleared // 20)))
        
        return jsonify({
            'success': True,
            'difficulty': difficulty,
            'recommendedSpeed': max(50, 1000 - (difficulty * 50))
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print(f'🐍 Starting Python Tetris Service on port {PORT}...')
    app.run(host='0.0.0.0', port=PORT, debug=True)

