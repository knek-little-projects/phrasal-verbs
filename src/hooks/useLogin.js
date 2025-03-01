import { useState, useEffect } from 'react';

const useLogin = () => {
  const [playerName, _setPlayerName] = useState(localStorage.getItem('playerName'));

  function setPlayerName(playerName) {
    if (!playerName) {
        throw new Error('setPlayerName playerName is required');
    }
    localStorage.setItem('playerName', playerName);
    _setPlayerName(playerName);
  }

  return { playerName, setPlayerName };
};

export default useLogin; 