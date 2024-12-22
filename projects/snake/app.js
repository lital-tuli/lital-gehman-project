// Game configuration
let blockSize = 25;
let rows = 20;
let cols = 20;
let board;
let context; 

// Snake properties
let snakeX, snakeY, velocityX, velocityY;
let snakeBody;

// Game state
let gameOver;
let score;
let leaderboard;

// UI Elements
let startButton, restartButton, playerNameInput, scoreDisplay, leaderboardList;

// Initialize game elements
window.onload = function() {
    board = document.getElementById('board');
    board.width = blockSize * cols;
    board.height = blockSize * rows;
    context = board.getContext('2d');

    startButton = document.getElementById('startGame');
    restartButton = document.getElementById('restartButton');
    playerNameInput = document.getElementById('playerName');
    scoreDisplay = document.getElementById('scoreDisplay');
    leaderboardList = document.getElementById('leaderboardList');

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    document.addEventListener('keyup', changeDirection);

    // Load leaderboard from local storage
    leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
    updateLeaderboardDisplay();
}

function startGame() {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }

    // Reset game state
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    gameOver = false;
    score = 0;

    // Update UI
    scoreDisplay.textContent = score;
    startButton.disabled = true;
    restartButton.disabled = false;
    playerNameInput.disabled = true;

    // Start game loop
    placeFood();
    gameInterval = setInterval(update, 1000/5); // Slower speed (5 FPS instead of 10)
}

function restartGame() {
    // Stop current game
    clearInterval(gameInterval);
    
    // Reset UI
    startButton.disabled = false;
    restartButton.disabled = true;
    playerNameInput.disabled = false;
    playerNameInput.value = '';
    scoreDisplay.textContent = '0';

    // Clear canvas
    context.fillStyle = 'black';
    context.fillRect(0, 0, board.width, board.height);
}

function update() {
    if (gameOver) return;

    // Clear board
    context.fillStyle = 'black';
    context.fillRect(0, 0, board.width, board.height);

    // Draw food
    context.fillStyle = 'red';
    context.fillRect(foodX, foodY, blockSize, blockSize);

    // Check food collision
    if(snakeX === foodX && snakeY === foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood();
        score++;
        scoreDisplay.textContent = score;
    }

    // Move snake body
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    // Move and draw snake
    context.fillStyle = 'lime';
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;
    context.fillRect(snakeX, snakeY, blockSize, blockSize);
    for(let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    // Game over conditions
    if (snakeX < 0 || snakeX >= board.width || snakeY < 0 || snakeY >= board.height) {
        endGame();
    }

    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
            endGame();
        }
    }
}

function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    
    const playerName = playerNameInput.value.trim();
    
    // Add to leaderboard
    leaderboard.push({
        name: playerName,
        score: score
    });

    // Sort leaderboard and keep top 10
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);

    // Save to local storage
    localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));

    // Update leaderboard display
    updateLeaderboardDisplay();

    alert(`Game Over! Your score: ${score}`);

    // Reset UI
    restartButton.disabled = false;
    startButton.disabled = true;
}

function updateLeaderboardDisplay() {
    leaderboardList.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

function placeFood() {
    foodX = Math.floor(Math.random() * cols) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;
}

function changeDirection(event) {
    if (gameOver) return;

    // Prevent 180-degree turns
    if (event.code === 'ArrowUp' && velocityY != 1) {
        velocityX = 0;
        velocityY = -1; 
    }
    else if (event.code === 'ArrowDown' && velocityY != -1) {
        velocityX = 0;
        velocityY = 1; 
    } else if (event.code === 'ArrowLeft' && velocityX != 1) {
        velocityX = -1;
        velocityY = 0; 
    } else if (event.code === 'ArrowRight' && velocityX != -1) {
        velocityX = 1;
        velocityY = 0; 
    }
}