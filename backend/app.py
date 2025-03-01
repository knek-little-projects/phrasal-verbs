from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import json
import os
import datetime


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
VERBS_FILE = os.path.join(os.path.dirname(__file__), '../src/constants/verbs.json')

class GameState:
    def __init__(self, player_count=4, start_dealt_cards_count=8):
        self.player_count = player_count
        self.start_dealt_cards_count = start_dealt_cards_count
        self.deck = []
        self.players = []
        self.current_player = 0
        self.table_cards = []
        self.card_positions = []
        self.winner = None
        self.last_played_time = datetime.datetime.now().isoformat()
        self.player_names = ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6"][:player_count]
        
        # Load verbs data
        with open(VERBS_FILE) as f:
            self.verbs_data = json.load(f)
            
        self.initialize_game()

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

game_states = {}

@app.route('/api/game/initialize', methods=['POST'])
def initialize_game():
    data = request.json
    game_id = data.get('gameId')
    player_count = data.get('playerCount', 4)
    start_dealt_cards = data.get('startDealtCardsCount', 8)
    player_name = data.get('playerName', 'Player 1')
    
    # Check if the game already exists
    if game_id in game_states:
        game = game_states[game_id]
        game.last_played_time = datetime.datetime.now().isoformat()
        
        # Update player name if provided
        if player_name and player_name != 'Player 1':
            if player_name not in game.player_names:
                for i in range(len(game.player_names)):
                    if game.player_names[i].startswith('Player '):
                        game.player_names[i] = player_name
                        break
        
        return jsonify({
            'deck': game.deck,
            'players': game.players,
            'currentPlayer': game.current_player,
            'tableCards': game.table_cards,
            'cardPositions': game.card_positions,
            'winner': game.winner,
            'playerNames': game.player_names
        })
    
    # Initialize a new game if it doesn't exist
    game_states[game_id] = GameState(player_count, start_dealt_cards)
    
    # Set the first player's name if provided
    if player_name and player_name != 'Player 1':
        game_states[game_id].player_names[0] = player_name
    
    return jsonify({
        'deck': game_states[game_id].deck,
        'players': game_states[game_id].players,
        'currentPlayer': game_states[game_id].current_player,
        'tableCards': game_states[game_id].table_cards,
        'cardPositions': game_states[game_id].card_positions,
        'winner': game_states[game_id].winner,
        'playerNames': game_states[game_id].player_names
    })

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
        return jsonify({'started': True}), 200
    else:
        return jsonify({'started': False}), 404

@app.route('/api/game/restart', methods=['POST'])
def restart_game():
    data = request.json
    game_id = data.get('gameId')
    
    if game_id in game_states:
        player_count = len(game_states[game_id].players)
        start_dealt_cards = game_states[game_id].start_dealt_cards_count
        game_states[game_id] = GameState(player_count, start_dealt_cards)
        
        return jsonify({
            'deck': game_states[game_id].deck,
            'players': game_states[game_id].players,
            'currentPlayer': game_states[game_id].current_player,
            'tableCards': game_states[game_id].table_cards,
            'cardPositions': game_states[game_id].card_positions,
            'winner': game_states[game_id].winner
        })
    else:
        return jsonify({'error': 'Game not found'}), 404

@app.route('/api/game/active', methods=['GET'])
def get_active_games():
    active_games = []
    for game_id, game in game_states.items():
        active_games.append({
            'id': game_id,
            'playerCount': game.player_count,
            'startDealtCardsCount': game.start_dealt_cards_count,
            'currentPlayer': game.current_player,
            'hasWinner': game.winner is not None,
            'lastPlayedTime': game.last_played_time,
            'playerNames': game.player_names
        })
    
    # Sort by last played time (newest first) and limit to 100
    active_games.sort(key=lambda g: g['lastPlayedTime'], reverse=True)
    active_games = active_games[:100]
    
    return jsonify({'games': active_games})

if __name__ == '__main__':
    app.run(debug=True) 