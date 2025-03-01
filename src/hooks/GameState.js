class GameState {
  constructor() {
    this.deck = [];
    this.players = [];
    this.currentPlayer = 0;
    this.tableCards = [];
    this.cardPositions = [];
    this.winner = null;
    this.error = null;
    this.playerNames = [];
    this.joinedPlayers = 0;
    this.gameStarted = false;
    this.playerCount = 0;
    this.startDealtCardsCount = 0;
  }
}

export default GameState; 