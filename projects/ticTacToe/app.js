// Game Configuration
const gameBoard = document.querySelector('#gameBoard');
const turnInfo = document.querySelector('#turnInfo');
const player1NameInput = document.querySelector('#player1Name');
const player2NameInput = document.querySelector('#player2Name');
const startGameButton = document.querySelector('#startGame');
const restartGameButton = document.querySelector('#restartGame');
const resetScoresButton = document.querySelector('#resetScores');
const newPlayersButton = document.querySelector('#newPlayers');
const player1ScoreDisplay = document.querySelector('#player1Score');
const player2ScoreDisplay = document.querySelector('#player2Score');

// Game State
let currentPlayer = 'circle';
let gameActive = false;
let boardState = ['', '', '', '', '', '', '', '', ''];
let player1Name = '';
let player2Name = '';
let player1Score = 0;
let player2Score = 0;

// Winning Combinations
const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
    [0, 4, 8], [2, 4, 6]              // Diagonals
];

// Initialize Game
function initializeGame() {
    player1Name = player1NameInput.value.trim() || 'Player 1';
    player2Name = player2NameInput.value.trim() || 'Player 2';

    if (!player1Name || !player2Name) {
        alert('Please enter names for both players');
        return;
    }

    // Reset game state
    boardState = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'circle';
    gameActive = true;

    // Clear board
    gameBoard.innerHTML = '';
    createBoard();

    // Update UI
    turnInfo.textContent = `${player1Name}'s turn (Circle)`;
    gameBoard.classList.remove('disabled');
    startGameButton.disabled = true;
    restartGameButton.disabled = false;
    resetScoresButton.disabled = false;
    newPlayersButton.disabled = false;
    player1NameInput.disabled = true;
    player2NameInput.disabled = true;
}

function createBoard() {
    boardState.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('square');
        cellElement.id = index;
        cellElement.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cellElement);
    });
}

function handleCellClick(e) {
    const cellIndex = e.target.id;
    
    // Check if cell is already filled or game is not active
    if (boardState[cellIndex] || !gameActive) return;

    // Mark cell
    boardState[cellIndex] = currentPlayer;
    e.target.classList.add(currentPlayer);

    // Check for win or draw
    if (checkWin(currentPlayer)) {
        endGame(false);
    } else if (checkDraw()) {
        endGame(true);
    } else {
        // Switch players
        switchPlayer();
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'circle' ? 'cross' : 'circle';
    turnInfo.textContent = currentPlayer === 'circle' 
        ? `${player1Name}'s turn (Circle)` 
        : `${player2Name}'s turn (Cross)`;
}

function checkWin(player) {
    return winningCombos.some(combo => 
        combo.every(index => boardState[index] === player)
    );
}

function checkDraw() {
    return boardState.every(cell => cell !== '');
}

function endGame(isDraw) {
    gameActive = false;

    if (!isDraw) {
        // Update scores
        if (currentPlayer === 'circle') {
            player1Score++;
            player1ScoreDisplay.textContent = player1Score;
            turnInfo.textContent = `${player1Name} wins!`;
        } else {
            player2Score++;
            player2ScoreDisplay.textContent = player2Score;
            turnInfo.textContent = `${player2Name} wins!`;
        }
    } else {
        turnInfo.textContent = "It's a draw!";
    }

    // Disable further moves
    gameBoard.classList.add('disabled');
    restartGameButton.disabled = false;
}

function restartGame() {
    // Reset board state
    boardState = ['', '', '', '', '', '', '', '', ''];
    gameBoard.innerHTML = '';
    createBoard();

    // Reset game state
    currentPlayer = 'circle';
    gameActive = true;

    // Update UI
    turnInfo.textContent = `${player1Name}'s turn (Circle)`;
    gameBoard.classList.remove('disabled');
}

function resetScores() {
    player1Score = 0;
    player2Score = 0;
    player1ScoreDisplay.textContent = '0';
    player2ScoreDisplay.textContent = '0';
}

function startNewPlayers() {
    // Reset all game elements
    boardState = ['', '', '', '', '', '', '', '', ''];
    gameBoard.innerHTML = '';
    player1Score = 0;
    player2Score = 0;
    player1ScoreDisplay.textContent = '0';
    player2ScoreDisplay.textContent = '0';
    
    // Reset UI
    turnInfo.textContent = '';
    gameBoard.classList.add('disabled');
    startGameButton.disabled = false;
    restartGameButton.disabled = true;
    resetScoresButton.disabled = true;
    newPlayersButton.disabled = true;

    // Enable name inputs
    player1NameInput.value = '';
    player2NameInput.value = '';
    player1NameInput.disabled = false;
    player2NameInput.disabled = false;
}

// Event Listeners
startGameButton.addEventListener('click', initializeGame);
restartGameButton.addEventListener('click', restartGame);
resetScoresButton.addEventListener('click', resetScores);
newPlayersButton.addEventListener('click', startNewPlayers);