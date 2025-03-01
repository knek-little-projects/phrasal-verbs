const API_BASE_URL = 'http://localhost:5000/api';

export const initializeGame = async ({
  gameId, 
  playerCount, 
  startDealtCardsCount, 
  playerName
}) => {
  
  console.log(`Initializing game with gameId: ${gameId}, playerCount: ${playerCount}, startDealtCardsCount: ${startDealtCardsCount}, playerName: ${playerName}`);

  const response = await fetch(`${API_BASE_URL}/game/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameId,
      playerCount,
      startDealtCardsCount,
      playerName,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to connect to game server');
  }
  return await response.json();
};

export const joinGame = async (gameId, playerName) => {
  const response = await fetch(`${API_BASE_URL}/game/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameId,
      playerName,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to join game');
  }
  return await response.json();
};

export const checkGameStatus = async (gameId) => {
  const response = await fetch(`${API_BASE_URL}/game/status?gameId=${gameId}`);
  if (!response.ok) {
    throw new Error('Failed to check game status');
  }
  return await response.json();
};

export const playCard = async (gameId, cardIndex) => {
  const response = await fetch(`${API_BASE_URL}/game/play-card`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameId,
      cardIndex,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to play card');
  }
  return await response.json();
};

export const skipTurn = async (gameId) => {
  const response = await fetch(`${API_BASE_URL}/game/skip-turn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameId,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to skip turn');
  }
  return await response.json();
};

export const restartGame = async (gameId, playerName) => {
  const response = await fetch(`${API_BASE_URL}/game/restart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      gameId,
      playerName 
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to restart game');
  }
  return await response.json();
};

export const getGameState = async (gameId) => {
  const response = await fetch(`${API_BASE_URL}/game/state?gameId=${gameId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get game state');
  }
  return await response.json();
};

export const fetchActiveGames = async () => {
  const response = await fetch(`${API_BASE_URL}/game/active`);
  if (!response.ok) {
    throw new Error('Failed to fetch active games');
  }
  return await response.json();
};

export const fetchGameStatus = async (gameId) => {
  const response = await fetch(`${API_BASE_URL}/game/status?gameId=${gameId}`);
  if (!response.ok) {
    throw new Error('Failed to check game status');
  }
  return await response.json();
}; 