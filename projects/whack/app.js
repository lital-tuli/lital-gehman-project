let currMoleTile;
let currPlantTile;
let score = 0;
let gameOver = false;
let gamePaused = false;
let gameTimer;
let timeLeft = 30;
let currentDifficulty = 'easy';
let moleInterval;
let plantInterval;
let isGameStarted = false;

const difficulties = {
    easy: { moleInterval: 1500, plantInterval: 2500 },
    medium: { moleInterval: 1000, plantInterval: 2000 },
    hard: { moleInterval: 750, plantInterval: 1500 }
};

window.onload = function() {
    document.getElementById("startButton").addEventListener("click", startGame);
    document.getElementById("pauseButton").addEventListener("click", togglePause);
    document.getElementById("resumeButton").addEventListener("click", togglePause);
    document.getElementById("difficulty").addEventListener("change", changeDifficulty);
    document.getElementById("playAgainButton").addEventListener("click", resetGame);
    
    // Leaderboard tab functionality
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            displayLeaderboard(e.target.dataset.difficulty);
        });
    });

    displayLeaderboard('easy');
}

function startGame() {
    if (gameOver) resetGame();
    
    isGameStarted = true;
    gamePaused = false;
    setGame();
    document.getElementById("startButton").disabled = true;
    document.getElementById("pauseButton").disabled = false;
    document.getElementById("difficulty").disabled = true;
    
    // Start timer
    timeLeft = 30;
    updateTimer();
    gameTimer = setInterval(() => {
        if (!gamePaused) {
            timeLeft--;
            updateTimer();
            if (timeLeft <= 0) endGame();
        }
    }, 1000);

    startIntervals();
}

function togglePause() {
    if (!isGameStarted || gameOver) return;

    gamePaused = !gamePaused;
    const pauseButton = document.getElementById("pauseButton");
    const pauseModal = document.getElementById("pauseModal");

    if (gamePaused) {
        clearIntervals();
        pauseButton.textContent = "Resume";
        pauseButton.classList.add("resume");
        pauseModal.style.display = "flex";
    } else {
        startIntervals();
        pauseButton.textContent = "Pause";
        pauseButton.classList.remove("resume");
        pauseModal.style.display = "none";
    }
}

function startIntervals() {
    const { moleInterval: moleDelay, plantInterval: plantDelay } = difficulties[currentDifficulty];
    
    clearIntervals(); // Clear any existing intervals
    
    moleInterval = setInterval(() => {
        if (!gamePaused) setMole();
    }, moleDelay);
    
    plantInterval = setInterval(() => {
        if (!gamePaused) setPlant();
    }, plantDelay);
}

function clearIntervals() {
    if (moleInterval) clearInterval(moleInterval);
    if (plantInterval) clearInterval(plantInterval);
}

function updateTimer() {
    document.getElementById("timeLeft").textContent = timeLeft;
}

function setGame() {
    // Clear existing board
    const board = document.getElementById("board");
    board.innerHTML = '';
    
    // Create tiles
    for (let i = 0; i < 9; i++) {
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener("click", selectTile);
        board.appendChild(tile);
    }
}

function changeDifficulty(e) {
    currentDifficulty = e.target.value;
}

function getRandomTile() {
    let num = Math.floor(Math.random() * 9);
    return num.toString();
}

function setMole() {
    if (gameOver) return;
    
    if (currMoleTile) {
        currMoleTile.innerHTML = "";
    }
    
    let mole = document.createElement("img");
    mole.src = "./monty-mole.png";

    let num = getRandomTile();
    while (currPlantTile && currPlantTile.id === num) {
        num = getRandomTile();
    }
    
    currMoleTile = document.getElementById(num);
    currMoleTile.appendChild(mole);
}

function setPlant() {
    if (gameOver) return;
    
    if (currPlantTile) {
        currPlantTile.innerHTML = "";
    }
    
    let plant = document.createElement("img");
    plant.src = "./piranha-plant.png";

    let num = getRandomTile();
    while (currMoleTile && currMoleTile.id === num) {
        num = getRandomTile();
    }
    
    currPlantTile = document.getElementById(num);
    currPlantTile.appendChild(plant);
}

function selectTile() {
    if (gameOver || gamePaused) return;
    
    if (this == currMoleTile) {
        score += getDifficultyPoints();
        document.getElementById("score").textContent = score;
        
        // Visual feedback
        this.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
        setTimeout(() => {
            this.style.backgroundColor = '';
        }, 100);
        
        // Immediately remove the mole when hit
        currMoleTile.innerHTML = "";
        currMoleTile = null;
    }
    else if (this == currPlantTile) {
        endGame();
    }
}

function getDifficultyPoints() {
    const points = {
        easy: 10,
        medium: 20,
        hard: 30
    };
    return points[currentDifficulty];
}

function endGame() {
    gameOver = true;
    isGameStarted = false;
    clearInterval(gameTimer);
    clearIntervals();
    
    document.getElementById("finalScore").textContent = score;
    document.getElementById("gameOverModal").style.display = "flex";
    document.getElementById("pauseButton").disabled = true;
    
    saveScore(score);
}

function resetGame() {
    gameOver = false;
    gamePaused = false;
    isGameStarted = false;
    score = 0;
    timeLeft = 30;
    document.getElementById("score").textContent = "0";
    document.getElementById("timeLeft").textContent = "30";
    document.getElementById("startButton").disabled = false;
    document.getElementById("pauseButton").disabled = true;
    document.getElementById("difficulty").disabled = false;
    document.getElementById("gameOverModal").style.display = "none";
    document.getElementById("pauseModal").style.display = "none";
    
    clearIntervals();
    if (currMoleTile) currMoleTile.innerHTML = "";
    if (currPlantTile) currPlantTile.innerHTML = "";
    
    // Clear board
    document.getElementById("board").innerHTML = '';
}

function saveScore(newScore) {
    const difficulty = currentDifficulty;
    let scores = JSON.parse(localStorage.getItem(`scores_${difficulty}`)) || [];
    scores.push({
        score: newScore,
        date: new Date().toLocaleDateString()
    });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5); // Keep top 5 scores
    localStorage.setItem(`scores_${difficulty}`, JSON.stringify(scores));
    displayLeaderboard(difficulty);
}

function displayLeaderboard(difficulty) {
    let scores = JSON.parse(localStorage.getItem(`scores_${difficulty}`)) || [];
    let leaderboard = document.getElementById("leaderboard-scores");
    leaderboard.innerHTML = "";
    
    if (scores.length === 0) {
        leaderboard.innerHTML = "<p>No scores yet!</p>";
        return;
    }
    
    scores.forEach((scoreData, index) => {
        let scoreElement = document.createElement("div");
        scoreElement.className = "score-entry";
        scoreElement.innerHTML = `
            <span>${index + 1}. ${scoreData.score}</span>
            <span>${scoreData.date}</span>
        `;
        leaderboard.appendChild(scoreElement);
    });
}