
/**
 * Calculates Expected Score
 * @param {number} ratingA - Rating of Player A
 * @param {number} ratingB - Rating of Player B
 * @returns {number} Expected score for Player A
 */
const getExpectedScore = (ratingA, ratingB) => {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

/**
 * Calculates new ELO ratings for two players after a match.
 * @param {number} winnerElo - Current ELO of the winner
 * @param {number} loserElo - Current ELO of the loser
 * @param {number} kFactor - K-factor determines sensitivity (default 32)
 * @returns {{newWinnerElo: number, newLoserElo: number}}
 */
export const calculateNewRatings = (winnerElo, loserElo, kFactor = 50) => {
    const expectedWinner = getExpectedScore(winnerElo, loserElo);
    const expectedLoser = getExpectedScore(loserElo, winnerElo);

    // Winner gets 1, Loser gets 0
    const newWinnerElo = Math.round(winnerElo + kFactor * (1 - expectedWinner));
    const newLoserElo = Math.round(loserElo + kFactor * (0 - expectedLoser));

    return { newWinnerElo, newLoserElo };
};
