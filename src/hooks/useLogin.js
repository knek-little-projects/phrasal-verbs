import { useState, useEffect } from 'react';

const useLogin = () => {
  const [playerName, _setPlayerName] = useState(localStorage.getItem('playerName'));

  function setPlayerName(name) {
    if (!name) {
        throw new Error('setPlayerName name is required');
    }
    localStorage.setItem('playerName', playerName);
    _setPlayerName(name);
  }

  return { playerName, setPlayerName };
};

export default useLogin; 