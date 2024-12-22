let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

// Game state
let gameStarted = false;
let gameOver = false;
let score = 0;
let highScore = 0;

// Dino
let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;
let dinoImg;
let dinoDuckImg;
let isDucking = false;

let dino = {
    x: dinoX,
    y: dinoY,
    width: dinoWidth,
    height: dinoHeight
}

// Cactus
let cactusArray = [];
let cactus1Width = 34;
let cactus2Width = 69;
let cactus3Width = 102;
let cactusHeight = 70;
let cactusX = 700;
let cactusY = boardHeight - cactusHeight;
let cactus1Img;
let cactus2Img;
let cactus3Img;

// Physics
let velocityX = -8;
let velocityY = 0;
let gravity = 0.4;
let jumpForce = -12;
let isJumping = false;

// Animation
let animationId = null;
//score
let storedHighScore = sessionStorage.getItem('dinoHighScore');
highScore = storedHighScore ? parseInt(storedHighScore) : 0;
// Initialize game
window.onload = function() {
    setupGame();
    loadImages();
    setupEventListeners();
    drawInitialScreen();
}

function setupGame() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    const scale = containerWidth / boardWidth;
    
    if (containerWidth < boardWidth) {
        board.style.width = '100%';
        board.style.height = `${boardHeight * scale}px`;
    } else {
        board.style.width = `${boardWidth}px`;
        board.style.height = `${boardHeight}px`;
    }
}

function loadImages() {
    dinoImg = new Image();
    dinoImg.src = "./images/dino.png";
    
    dinoDuckImg = new Image();
    dinoDuckImg.src = "./images/dino-duck1.png";
    
    cactus1Img = new Image();
    cactus1Img.src = "./images/cactus1.png";
    
    cactus2Img = new Image();
    cactus2Img.src = "./images/cactus2.png";
    
    cactus3Img = new Image();
    cactus3Img.src = "./images/cactus3.png";
}

function setupEventListeners() {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.getElementById("startBtn").addEventListener("click", startGame);
    document.getElementById("restartBtn").addEventListener("click", restartGame);
    
    // Touch events for mobile
    board.addEventListener('touchstart', handleTouch);
}

function handleKeyDown(e) {
    if (!gameStarted || gameOver) return;
    
    if ((e.code == "Space" || e.code == "ArrowUp") && !isJumping && dino.y == dinoY) {
        jump();
    } else if (e.code == "ArrowDown") {
        duck(true);
    }
}

function handleKeyUp(e) {
    if (e.code == "ArrowDown") {
        duck(false);
    }
}

function handleTouch(e) {
    if (!gameStarted || gameOver) return;
    
    if (!isJumping && dino.y == dinoY) {
        e.preventDefault();
        jump();
    }
}

function jump() {
    velocityY = jumpForce;
    isJumping = true;
}

function duck(isDucking) {
    if (isDucking) {
        dino.height = dinoHeight * 0.5;
        dino.y = boardHeight - dino.height;
        this.isDucking = true;
    } else {
        dino.height = dinoHeight;
        dino.y = boardHeight - dino.height;
        this.isDucking = false;
    }
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameOver = false;
        score = 0;
        document.getElementById("startBtn").disabled = true;
        document.getElementById("gameOverScreen").classList.remove('show');
        requestAnimationFrame(update);
        setInterval(placeCactus, 1000);
    }
}

function restartGame() {
    cancelAnimationFrame(animationId);
    resetGameState();
    startGame();
}

function resetGameState() {
    cactusArray = [];
    velocityY = 0;
    dino.y = dinoY;
    dino.height = dinoHeight;
    isJumping = false;
    isDucking = false;
    dinoImg.src = "./images/dino.png";
    document.getElementById("gameOverScreen").classList.remove('show');
}

function update() {
    if (!gameStarted || gameOver) return;
    
    animationId = requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);
    
    velocityY += gravity;
    const minY = boardHeight * 0.2;
    dino.y = Math.min(Math.max(dino.y + velocityY, minY), dinoY);
    if (dino.y == dinoY) {
        isJumping = false;
    }
    
    const currentDinoImg = isDucking ? dinoDuckImg : dinoImg;
    context.drawImage(currentDinoImg, dino.x, dino.y, dino.width, dino.height);
    
    // Update cactuses
    updateCactuses();
    
    // Update score
    updateScore();
}
function updateCactuses() {
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);
        
        if (detectCollision(dino, cactus)) {
            handleGameOver();
            return;
        }
    }
    
    // Remove off-screen cactuses
    cactusArray = cactusArray.filter(cactus => cactus.x + cactus.width > 0);
}

function updateScore() {
    score++;
    document.getElementById("score").textContent = score;
}
function handleGameOver() {
    gameOver = true;
    gameStarted = false;
    document.getElementById("startBtn").disabled = false;
    
    dinoImg.src = "./images/dino-dead.png";
    dinoImg.onload = () => {
        // Clear the canvas
        context.clearRect(0, 0, board.width, board.height);
        
        // Draw the final frame with dead dino
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
        
        // Draw the cactuses in their final position
        cactusArray.forEach(cactus => {
            context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);
        });
    };
    
    // Update high score and session storage
    if (score > highScore) {
        highScore = score;
        sessionStorage.setItem('dinoHighScore', highScore.toString());
    }
    
    // Show game over screen
    document.getElementById("finalScore").textContent = score;
    document.getElementById("highScore").textContent = highScore;
    document.getElementById("gameOverScreen").classList.add('show');
}
function placeCactus() {
    if (!gameStarted || gameOver) return;
    
    // Check if there are any cactuses too close to the spawn point
    const lastCactus = cactusArray[cactusArray.length - 1];
    if (lastCactus && lastCactus.x > cactusX - 200) {
        return; // Skip spawning if the last cactus is too close
    }
    
    // Check if we already have 2 cactuses on screen
    if (cactusArray.length >= 2) {
        return;
    }
    
    let cactus = {
        img: null,
        x: cactusX,
        y: cactusY,
        width: null,
        height: cactusHeight
    }
    
    let placeCactusChance = Math.random();
    
    if (placeCactusChance > 0.90) {
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
        cactusArray.push(cactus);
    } else if (placeCactusChance > 0.70) {
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
        cactusArray.push(cactus);
    } else if (placeCactusChance > 0.50) {
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
        cactusArray.push(cactus);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function drawInitialScreen() {
    context.fillStyle = "var(--primary-color)";
    context.font = "20px courier";
    context.textAlign = "center";
    context.fillText("Press 'Start Game' to begin!", boardWidth/2, boardHeight/2);
}