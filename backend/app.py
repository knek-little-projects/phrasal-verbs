"""
Usage:
  app.py [--prod]

Options:
  --prod  Run the app in production mode with SSL.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import json
import os
import datetime
from docopt import docopt  # Import docopt


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
VERBS_FILE = os.path.join(os.path.dirname(__file__), '../src/constants/verbs.json')


class GameState:
    def __init__(self, player_count, start_dealt_cards_count, game_id):
        assert player_count > 1, 'Player count must be greater than 0'
        assert start_dealt_cards_count > 0, 'Start dealt cards count must be greater than 0'
        assert game_id is not None, 'Game ID is required'

        self.game_id = game_id
        self.player_count = player_count
        self.start_dealt_cards_count = start_dealt_cards_count
        self.deck = []
        self.players = []
        self.current_player = 0
        self.table_cards = []
        self.card_positions = []
        self.winner = None
        self.last_played_time = datetime.datetime.now().isoformat()
        self.player_names = []
        self.joined_players = 0  # Track how many players have joined
        self.game_started = False  # Track if the game has started
        
        # Load verbs data
        with open(VERBS_FILE) as f:
            self.verbs_data = json.load(f)
            
        # Don't initialize the game yet, wait until all players join
        # self.initialize_game()

    def initialize_game(self):
        # Create deck similar to React version
        all_verbs = []
        for category in self.verbs_data['categories']:
            for card in category['cards']:
                all_verbs.append({
                    'phrasal_verb': card['phrasal_verb'],
                    'related_word': random.choice(card['related_words']),
                    'category': category['name'],
                    'color': category['color'],
                    'matches': category.get('matches')
                })

        self.deck = [
            {
                'id': idx,
                'word': verb['phrasal_verb'],
                'hint': verb['related_word'],
                'category': verb['category'],
                'color': verb['color'],
                'matches': verb['matches']
            }
            for idx, verb in enumerate(all_verbs)
        ]
        
        random.shuffle(self.deck)
        
        self.players = []
        for i in range(self.player_count):
            self.players.append({
                'id': i,
                'cards': self.deck[:self.start_dealt_cards_count]
            })
            self.deck = self.deck[self.start_dealt_cards_count:]
            
        self.current_player = 0
        self.table_cards = []
        self.card_positions = []
        self.winner = None
        self.game_started = True

        # Check for winner after initialization
        for player in self.players:
            if len(player['cards']) == 0:
                self.winner = player['id']
                break

    def is_card_playable(self, card):
        if not self.table_cards:
            return True

        top_card = self.table_cards[-1]
        
        if card.get('matches') and top_card.get('matches'):
            intersection = set(card['matches']) & set(top_card['matches'])
            if intersection:
                return True
        elif card.get('matches'):
            if top_card['category'] in card['matches']:
                return True
        elif top_card.get('matches'):
            if card['category'] in top_card['matches']:
                return True
        else:
            if card['category'] == top_card['category']:
                return True

        card_first_word = card['word'].split()[0]
        top_card_first_word = top_card['word'].split()[0]
        return card_first_word == top_card_first_word

    def to_dict(self):
        return {
            'id': self.game_id,
            'deck': self.deck,
            'players': self.players,
            'currentPlayer': self.current_player,
            'tableCards': self.table_cards,
            'cardPositions': self.card_positions,
            'winner': self.winner,
            'playerNames': self.player_names,
            'joinedPlayers': self.joined_players,
            'playerCount': self.player_count,
            'startDealtCardsCount': self.start_dealt_cards_count,
            'gameStarted': self.game_started,
            'waitingForPlayers': self.joined_players < self.player_count and not self.game_started,
            'isFinished': self.winner is not None,
            'hasWinner': self.winner is not None,
            'lastPlayedTime': self.last_played_time,
        }

game_states = {}

@app.route('/api/game/initialize', methods=['POST'])
def initialize_game():
    data = request.json

    game_id = data.get('gameId')
    if game_id in game_states:
        return jsonify({'error': 'Game already exists.'}), 400

    player_count = data.get('playerCount')
    if not player_count:
        return jsonify({'error': 'Player count is required.'}), 400

    start_dealt_cards = data.get('startDealtCardsCount')
    if not start_dealt_cards:
        return jsonify({'error': 'Start dealt cards count is required.'}), 400

    player_name = data.get('playerName')
    if not player_name:
        return jsonify({'error': 'Player name is required.'}), 400

    # Initialize a new game if it doesn't exist
    game_states[game_id] = GameState(player_count, start_dealt_cards, game_id)
    game = game_states[game_id]
    
    # Set the first player's name if provided
    game.player_names.append(player_name)
    
    # Mark the first player as joined
    game.joined_players = 1
    
    return jsonify(game.to_dict())

@app.route('/api/game/join', methods=['POST'])
def join_game():
    data = request.json
    game_id = data.get('gameId')
    player_name = data.get('playerName', '')
    
    if not player_name:
        return jsonify({'error': 'Player name is required.'}), 400

    if game_id not in game_states:
        return jsonify({'error': 'Game not found'}), 404
    
    game = game_states[game_id]
    game.last_played_time = datetime.datetime.now().isoformat()
    
    # Check if the game is already full
    if game.joined_players >= game.player_count:
        return jsonify({'error': 'Game is full'}), 400
    

    # Allow the player to join again without reinitializing the game
    if player_name not in game.player_names[:game.joined_players]:
        
        # Update player name if provided
        game.player_names.append(player_name)
        
        # Increment joined players count
        game.joined_players += 1
        
        if game.joined_players == game.player_count:
            game.initialize_game()
            game.game_started = True

    
    return jsonify(game.to_dict())

@app.route('/api/game/play-card', methods=['POST'])
def play_card():
    data = request.json
    game_id = data['gameId']
    card_index = data['cardIndex']
    game = game_states[game_id]
    
    game.last_played_time = datetime.datetime.now().isoformat()
    
    card = game.players[game.current_player]['cards'][card_index]
    
    if not game.is_card_playable(card):
        return jsonify({'error': 'Card not playable'}), 400
        
    # Remove card from player's hand
    game.players[game.current_player]['cards'].pop(card_index)
    game.table_cards.append(card)
    
    # Check for winner
    if len(game.players[game.current_player]['cards']) == 0:
        game.winner = game.current_player
    else:
        game.current_player = (game.current_player + 1) % game.player_count
        
    return jsonify({
        'players': game.players,
        'currentPlayer': game.current_player,
        'tableCards': game.table_cards,
        'winner': game.winner
    })

@app.route('/api/game/skip-turn', methods=['POST'])
def skip_turn():
    data = request.json
    game_id = data['gameId']
    game = game_states[game_id]
    
    game.last_played_time = datetime.datetime.now().isoformat()
    
    if game.deck:
        new_card = game.deck.pop(0)
        game.players[game.current_player]['cards'].append(new_card)
        
    game.current_player = (game.current_player + 1) % game.player_count
        
    return jsonify({
        'deck': game.deck,
        'players': game.players,
        'currentPlayer': game.current_player
    })

@app.route('/api/game/status', methods=['GET'])
def check_game_status():
    game_id = request.args.get('gameId')
    
    if game_id in game_states:
        game = game_states[game_id]
        return jsonify({
            'exists': True,
            'started': game.game_started,
            'joinedPlayers': game.joined_players,
            'playerCount': game.player_count,
            'playerNames': game.player_names
        }), 200
    else:
        return jsonify({'exists': False, 'started': False}), 404

@app.route('/api/game/restart', methods=['POST'])
def restart_game():
    data = request.json
    game_id = data.get('gameId')
    
    if game_id in game_states:
        player_count = len(game_states[game_id].players)
        start_dealt_cards = game_states[game_id].start_dealt_cards_count
        player_names = game_states[game_id].player_names  # Save player names
        
        # Create a new game state with the same settings
        game_states[game_id] = GameState(player_count, start_dealt_cards, game_id)
        game = game_states[game_id]
        
        # Restore player names
        game.player_names = player_names
        game.joined_players = player_count
        
        # Initialize the game since all players are already joined
        game.initialize_game()
        
        return jsonify(game.to_dict())
    else:
        return jsonify({'error': 'Game not found'}), 404

@app.route('/api/game/active', methods=['GET'])
def get_active_games():
    active_games = []
    for _, game in game_states.items():
        active_games.append(game.to_dict())
    
    # Sort by last played time (newest first) and limit to 100
    active_games.sort(key=lambda g: g['lastPlayedTime'], reverse=True)
    active_games = active_games[:100]
    
    return jsonify({'games': active_games})

@app.route('/api/game/state', methods=['GET'])
def get_game_state():
    game_id = request.args.get('gameId')
    
    if game_id not in game_states:
        return jsonify({'error': 'Game not found'}), 404
    
    game = game_states[game_id]
    
    return jsonify(game.to_dict())

if __name__ == '__main__':
    arguments = docopt(__doc__)  # Parse the command-line arguments

    if arguments['--prod']:
        ssl_context = ( 
            "/etc/letsencrypt/live/my-test-server.ru/fullchain.pem",
            "/etc/letsencrypt/live/my-test-server.ru/privkey.pem"
        )
        host = "0.0.0.0"
        port = 443
        app.run(ssl_context=ssl_context, host=host, port=port)
    else:
        app.run(debug=True)  # Run in debug mode if not in production 