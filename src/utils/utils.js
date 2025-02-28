/**
 * Checks if a card can be played on top of the current top card based on category matches and first word matches
 * @param {Object} card - The card to be played
 * @param {Object} topCard - The current top card on the table
 * @returns {boolean} - Whether the card can be played
 */
export const isCardPlayable = (card, topCard) => {
  if (!topCard) return true;

  // Check category matches
  if (card.matches && topCard.matches) {
    const intersection = card.matches.filter(category => 
      topCard.matches.includes(category)
    );
    if (intersection.length > 0) return true;
  } else if (card.matches) {
    if (card.matches.includes(topCard.category)) return true;
  } else if (topCard.matches) {
    if (topCard.matches.includes(card.category)) return true;
  } else {
    if (card.category === topCard.category) return true;
  }

  // Check first word matches
  const cardFirstWord = card.word.split(' ')[0];
  const topCardFirstWord = topCard.word.split(' ')[0];
  return cardFirstWord === topCardFirstWord;
}; 