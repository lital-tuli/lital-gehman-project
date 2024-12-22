const API_URLS = {
    easy: "https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple&encode=url3986",
    medium: "https://opentdb.com/api.php?amount=10&difficulty=medium&type=multiple&encode=url3986",
    hard: "https://opentdb.com/api.php?amount=10&difficulty=hard&type=multiple&encode=url3986"
};

const quizContainer = document.getElementById("quiz-container");
const resultContainer = document.getElementById("result-container");
const resultMessage = document.getElementById("result-message");
const scoreElement = document.getElementById("score");
const restartBtn = document.getElementById("restart-btn");
const leaderboardContainer = document.getElementById("leaderboard-container");
const leaderboard = document.getElementById("leaderboard");
const difficultySelector = document.getElementById("difficulty-selector");
const loadingSpinner = document.getElementById("loading-spinner");
const questionCounter = document.getElementById("question-counter");

let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let playerName = '';
let difficulty = 'easy';
let timer;
let timeLeft;

document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    setupDifficultySelector();
    setupStartGame();
    restartBtn.addEventListener('click', startNewGame);
});

function setupDifficultySelector() {
    difficultySelector.value = difficulty;
    difficultySelector.addEventListener('change', (e) => {
        difficulty = e.target.value;
    });
}

function setupStartGame() {
    const startForm = document.getElementById('start-form');
    startForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('player-name');
        if (!nameInput.value.trim()) {
            showError("Please enter your name");
            return;
        }
        playerName = nameInput.value.trim();
        startNewGame();
    });
}

async function fetchTriviaQuestions() {
    try {
        showLoading(true);
        const response = await fetch(API_URLS[difficulty]);
        if (!response.ok) throw new Error("Failed to fetch questions.");
        const data = await response.json();
        if (!data.results || !data.results.length) {
            throw new Error("No questions received");
        }
        return data.results.map(question => ({
            ...question,
            question: decodeURIComponent(question.question),
            correct_answer: decodeURIComponent(question.correct_answer),
            incorrect_answers: question.incorrect_answers.map(answer => decodeURIComponent(answer))
        }));
    } catch (error) {
        console.error("Error fetching trivia questions:", error);
        showError("Unable to load quiz questions. Please try again later.");
        return [];
    } finally {
        showLoading(false);
    }
}

function displayQuestion() {
    if (!questions.length) {
        showError("No questions available");
        return;
    }

    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }

    const question = questions[currentQuestionIndex];
    const answers = shuffleArray([...question.incorrect_answers, question.correct_answer]);
    
    updateQuestionCounter();
    startTimer();

    quizContainer.innerHTML = `
        <div class="question-header">
            <div class="timer" id="timer"></div>
            <h2 class="question-text">${question.question}</h2>
        </div>
        <div class="answers-grid">
            ${answers.map((answer, index) => `
                <button class="answer-btn" onclick="checkAnswer('${answer.replace(/'/g, "\\'")}')" data-index="${index}">
                    ${answer}
                </button>
            `).join('')}
        </div>
    `;
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 30;
    updateTimer();
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer('');
        }
    }, 1000);
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = `Time: ${timeLeft}s`;
        if (timeLeft <= 10) {
            timerElement.classList.add('timer-warning');
        }
    }
}

function checkAnswer(selectedAnswer) {
    if (!questions[currentQuestionIndex]) return;
    
    clearInterval(timer);
    
    // Remove any existing feedback first
    const existingFeedback = document.querySelector('.feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Disable all answer buttons
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(button => {
        button.disabled = true;
        
        if (button.textContent.trim() === selectedAnswer) {
            button.style.backgroundColor = '#e0e0e0';
        }
    });
    
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correct_answer;
    
    if (isCorrect) {
        correctAnswers++;
        showFeedback(true);
    } else {
        showFeedback(false, question.correct_answer);
    }

    setTimeout(() => {
        // Remove feedback message
        const feedbackElement = document.querySelector('.feedback');
        if (feedbackElement) {
            feedbackElement.remove();
        }
        
        currentQuestionIndex++;
        displayQuestion();
    }, 1000);
}

function showFeedback(isCorrect, correctAnswer = '') {
    // Remove any existing feedback
    const existingFeedback = document.querySelector('.feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    const feedbackElement = document.createElement('div');
    feedbackElement.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackElement.textContent = isCorrect 
        ? 'Correct!' 
        : `Incorrect. The correct answer was: ${correctAnswer}`;
    document.body.appendChild(feedbackElement);
}

function updateQuestionCounter() {
    if (questionCounter) {
        questionCounter.textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
    }
}

function endQuiz() {
    clearInterval(timer);
    quizContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    const percentage = (correctAnswers / questions.length) * 100;
    const performance = getPerformanceMessage(percentage);

    resultMessage.textContent = `Quiz Complete - ${performance}`;
    scoreElement.innerHTML = `
        <p>You answered ${correctAnswers} out of ${questions.length} questions correctly.</p>
        <p>Score: ${percentage.toFixed(1)}%</p>
    `;
    
    updateLeaderboard(playerName, correctAnswers, difficulty);
}

function getPerformanceMessage(percentage) {
    if (percentage >= 90) return "Outstanding!";
    if (percentage >= 70) return "Great job!";
    if (percentage >= 50) return "Good effort!";
    return "Keep practicing!";
}

function startNewGame() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    document.getElementById('start-screen').classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    
    fetchTriviaQuestions().then(fetchedQuestions => {
        if (fetchedQuestions.length) {
            questions = fetchedQuestions;
            displayQuestion();
        }
    });
}

function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 3000);
}

function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function updateLeaderboard(name, score) {
    let leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardData.push({ name, score });
    leaderboardData.sort((a, b) => b.score - a.score);
    leaderboardData = leaderboardData.slice(0, 5);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
    displayLeaderboard();
}

function loadLeaderboard() {
    displayLeaderboard();
}

function displayLeaderboard() {
    if (!leaderboard) return;
    
    leaderboard.innerHTML = '';
    const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardData.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.name}: ${entry.score}`;
        leaderboard.appendChild(listItem);
    });
}