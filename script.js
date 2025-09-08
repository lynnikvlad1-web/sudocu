class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.originalBoard = [];
        this.selectedCell = null;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isGameActive = false;
        this.userMoves = new Set();
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        // Пример судоку (0 - пустая клетка)
        this.originalBoard = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ];

        // Решение для проверки
        this.solution = [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ];

        this.board = this.deepCopy(this.originalBoard);
        this.userMoves.clear();
        this.moves = 0;
        this.renderBoard();
        this.startNewGame();
    }

    deepCopy(arr) {
        return arr.map(row => [...row]);
    }

    renderBoard() {
        const grid = document.getElementById('sudoku-grid');
        grid.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                if (this.board[i][j] !== 0) {
                    cell.textContent = this.board[i][j];
                    if (this.originalBoard[i][j] !== 0) {
                        cell.classList.add('fixed');
                    } else {
                        cell.classList.add('user-input');
                    }
                }

                cell.addEventListener('click', () => this.selectCell(i, j));
                grid.appendChild(cell);
            }
        }
    }

    selectCell(row, col) {
        // Нельзя выбирать фиксированные клетки
        if (this.originalBoard[row][col] !== 0) {
            return;
        }

        // Убираем выделение с предыдущей клетки
        if (this.selectedCell) {
            const prevCell = document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);
            if (prevCell) prevCell.classList.remove('selected');
        }

        // Выделяем новую клетку
        this.selectedCell = { row, col };
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');
    }

    // Новый метод для обработки нажатий на цифровую панель
    handleNumberInput(number) {
        if (!this.selectedCell || !this.isGameActive) return;

        const { row, col } = this.selectedCell;
        const value = parseInt(number);
        const moveKey = `${row},${col},${value}`;

        const oldValue = this.board[row][col];
        this.board[row][col] = value;
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = value;
        cell.classList.add('user-input');
        cell.classList.remove('error', 'correct');

        // Считаем ход только если значение изменилось
        if (oldValue !== value) {
            if (!this.userMoves.has(moveKey)) {
                this.moves++;
                this.userMoves.add(moveKey);
                document.getElementById('moves').textContent = this.moves;
            }
        }

        // Проверяем, решено ли судоку
        if (this.isSolved()) {
            this.endGame(true);
        }
    }

    // Новый метод для удаления значения
    handleDelete() {
        if (!this.selectedCell || !this.isGameActive) return;

        const { row, col } = this.selectedCell;
        
        if (this.originalBoard[row][col] === 0 && this.board[row][col] !== 0) {
            const oldValue = this.board[row][col];
            this.board[row][col] = 0;
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            cell.textContent = '';
            cell.classList.remove('user-input', 'error', 'correct');

            // Удаляем ход из набора
            const moveKey = `${row},${col},${oldValue}`;
            if (this.userMoves.has(moveKey)) {
                this.userMoves.delete(moveKey);
                this.recalculateMoves();
            }
        }
    }

    // Пересчитываем ходы после удаления
    recalculateMoves() {
        this.moves = this.userMoves.size;
        document.getElementById('moves').textContent = this.moves;
    }

    isSolved() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] === 0 || this.board[i][j] !== this.solution[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('check').addEventListener('click', () => this.checkSolution());
        document.getElementById('solve').addEventListener('click', () => this.solvePuzzle());

        // Добавляем обработчики для цифровой панели
        const numberButtons = document.querySelectorAll('.number-btn[data-number]');
        numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleNumberInput(button.dataset.number);
            });
        });

        const deleteButton = document.querySelector('.number-btn[data-action="delete"]');
        deleteButton.addEventListener('click', () => {
            this.handleDelete();
        });

        // Также оставляем поддержку клавиатуры для десктопа
        document.addEventListener('keydown', (event) => {
            if (!this.selectedCell || !this.isGameActive) return;

            if (event.key >= '1' && event.key <= '9') {
                this.handleNumberInput(event.key);
            } else if (event.key === 'Backspace' || event.key === 'Delete') {
                this.handleDelete();
            }
        });
    }

    startNewGame() {
        this.board = this.deepCopy(this.originalBoard);
        this.userMoves.clear();
        this.moves = 0;
        this.startTime = Date.now();
        this.isGameActive = true;
        
        // Снимаем выделение с ячейки
        if (this.selectedCell) {
            const prevCell = document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);
            if (prevCell) prevCell.classList.remove('selected');
            this.selectedCell = null;
        }
        
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('message').className = 'message';
        document.getElementById('message').textContent = '';
        
        this.renderBoard();
        this.startTimer();
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            if (this.isGameActive) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                document.getElementById('timer').textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    checkSolution() {
        let hasErrors = false;
        let correctCount = 0;
        let totalCount = 0;
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                if (this.originalBoard[i][j] === 0) {
                    totalCount++;
                    if (this.board[i][j] !== 0) {
                        if (this.board[i][j] === this.solution[i][j]) {
                            cell.classList.add('correct');
                            cell.classList.remove('error');
                            correctCount++;
                        } else {
                            cell.classList.add('error');
                            cell.classList.remove('correct');
                            hasErrors = true;
                        }
                    } else {
                        cell.classList.remove('error', 'correct');
                        hasErrors = true;
                    }
                }
            }
        }

        const messageEl = document.getElementById('message');
        if (hasErrors) {
            const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
            messageEl.className = 'message error';
            messageEl.textContent = `❌ ${correctCount}/${totalCount} правильных (${accuracy}% точность)`;
        } else if (totalCount > 0) {
            messageEl.className = 'message success';
            messageEl.textContent = '✅ Все правильно! Продолжай в том же духе!';
        } else {
            messageEl.className = 'message';
            messageEl.textContent = '📝 Заполни ячейки и нажми "Проверить"';
        }
    }

    solvePuzzle() {
        this.board = this.deepCopy(this.solution);
        this.renderBoard();
        this.endGame(false);
    }

    endGame(isWin) {
        this.isGameActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        const messageEl = document.getElementById('message');
        if (isWin) {
            messageEl.className = 'message success';
            messageEl.textContent = `🎉 Поздравляем! Ты решил судоку за ${this.moves} ходов и ${document.getElementById('timer').textContent}!`;
        } else {
            messageEl.className = 'message';
            messageEl.textContent = '💡 Вот решение судоку.';
        }
    }
}

// Запускаем игру при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});