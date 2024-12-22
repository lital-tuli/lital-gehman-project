class Minesweeper {
    constructor() {
        this.difficulties = {
            beginner: { rows: 8, columns: 8, mines: 10 },
            intermediate: { rows: 16, columns: 16, mines: 40 },
            expert: { rows: 24, columns: 24, mines: 99 }
        };
        
        this.initializeGame('beginner');
        this.addEventListeners();
    }

    initializeGame(difficulty = 'beginner') {
        this.resetGameState(difficulty);
        this.createBoard();
        this.setMines();
    }

    resetGameState(difficulty) {
        const config = this.difficulties[difficulty];
        this.rows = config.rows;
        this.columns = config.columns;
        this.minesCount = config.mines;
        this.board = [];
        this.minesLocation = [];
        this.tilesClicked = 0;
        this.flagEnabled = false;
        this.gameOver = false;

        document.getElementById('board').innerHTML = '';
        document.getElementById('mines-count').innerText = this.minesCount;
        document.getElementById('flag-button').style.backgroundColor = 'lightgray';
    }

    addEventListeners() {
        document.getElementById('flag-button').addEventListener('click', () => this.toggleFlag());
        document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
        document.getElementById('difficulty').addEventListener('change', (e) => this.changeDifficulty(e.target.value));
    }

    toggleFlag() {
        this.flagEnabled = !this.flagEnabled;
        document.getElementById('flag-button').style.backgroundColor = this.flagEnabled ? 'darkgray' : 'lightgray';
    }

    restartGame() {
        const currentDifficulty = document.getElementById('difficulty').value;
        this.initializeGame(currentDifficulty);
    }

    changeDifficulty(difficulty) {
        this.initializeGame(difficulty);
    }

    createBoard() {
        const boardElement = document.getElementById('board');
        boardElement.style.gridTemplateColumns = `repeat(${this.columns}, 1fr)`;
        // In the createBoard method, add this line:

    // Remove any existing difficulty classes
    boardElement.classList.remove('beginner', 'intermediate', 'expert');
    
    // Add the current difficulty class
    boardElement.classList.add(document.getElementById('difficulty').value);

    // Rest of the existing createBoard method remains the same
    boardElement.style.gridTemplateColumns = `repeat(${this.columns}, 1fr)`;

        for (let r = 0; r < this.rows; r++) {
            let row = [];
            for (let c = 0; c < this.columns; c++) {
                let tile = document.createElement('div');
                tile.id = `${r}-${c}`;
                tile.addEventListener('click', (e) => this.clickTile(e.target));
                tile.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.rightClickTile(e.target);
                });
                boardElement.appendChild(tile);
                row.push(tile);
            }
            this.board.push(row);
        }
    }

    setMines() {
        let minesLeft = this.minesCount;
        while (minesLeft > 0) { 
            let r = Math.floor(Math.random() * this.rows);
            let c = Math.floor(Math.random() * this.columns);
            let id = `${r}-${c}`;

            if (!this.minesLocation.includes(id)) {
                this.minesLocation.push(id);
                minesLeft -= 1;
            }
        }
    }

    clickTile(tile) {
        if (this.gameOver || tile.classList.contains('tile-clicked')) return;

        if (this.flagEnabled) {
            this.rightClickTile(tile);
            return;
        }

        if (this.minesLocation.includes(tile.id)) {
            this.gameOver = true;
            this.revealMines();
            return;
        }

        let [r, c] = tile.id.split('-').map(Number);
        this.checkMine(r, c);
    }

    rightClickTile(tile) {
        if (tile.classList.contains('tile-clicked')) return;

        if (tile.innerText === '') {
            tile.innerText = '🚩';
        } else if (tile.innerText === '🚩') {
            tile.innerText = '';
        }
    }

    revealMines() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                let tile = this.board[r][c];
                if (this.minesLocation.includes(tile.id)) {
                    tile.innerText = '💣';
                    tile.style.backgroundColor = 'red';                
                }
            }
        }
    }

    checkMine(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.columns) return;
        if (this.board[r][c].classList.contains('tile-clicked')) return;

        this.board[r][c].classList.add('tile-clicked');
        this.tilesClicked += 1;

        let minesFound = this.countAdjacentMines(r, c);

        if (minesFound > 0) {
            this.board[r][c].innerText = minesFound;
            this.board[r][c].classList.add(`x${minesFound}`);
        } else {
            this.board[r][c].innerText = '';
            this.expandEmptyTiles(r, c);
        }

        if (this.tilesClicked === this.rows * this.columns - this.minesCount) {
            document.getElementById('mines-count').innerText = 'Cleared';
            this.gameOver = true;
        }
    }

    countAdjacentMines(r, c) {
        let minesFound = 0;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (let [dr, dc] of directions) {
            const newR = r + dr;
            const newC = c + dc;
            if (this.isValidTile(newR, newC) && this.isMine(newR, newC)) {
                minesFound++;
            }
        }

        return minesFound;
    }

    expandEmptyTiles(r, c) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (let [dr, dc] of directions) {
            const newR = r + dr;
            const newC = c + dc;
            if (this.isValidTile(newR, newC) && !this.board[newR][newC].classList.contains('tile-clicked')) {
                this.checkMine(newR, newC);
            }
        }
    }

    isValidTile(r, c) {
        return r >= 0 && r < this.rows && c >= 0 && c < this.columns;
    }

    isMine(r, c) {
        return this.minesLocation.includes(`${r}-${c}`);
    }
}

window.onload = () => {
    new Minesweeper();
}