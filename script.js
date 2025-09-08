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
        this.currentDifficulty = 'medium';
        
        if (!this.loadProgress()) {
            this.initializeGame();
        }
        this.setupEventListeners();
    }

    // Генерация полного решенного судоку
    generateCompleteSudoku() {
        const board = Array(9).fill().map(() => Array(9).fill(0));
        
        // Заполняем первую строку случайными цифрами
        const firstRow = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(firstRow);
        board[0] = firstRow;
        
        // Решаем судоку методом бэктрекинга
        if (this.solveSudoku(board)) {
            return board;
        }
        return null;
    }

    // Перемешивает массив
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Проверяет, можно ли поставить цифру в позицию
    isValidPlacement(board, row, col, num) {
        // Проверка строки
        for (let j = 0; j < 9; j++) {
            if (board[row][j] === num) return false;
        }

        // Проверка столбца
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) return false;
        }

        // Проверка 3x3 квадрата
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] === num) return false;
            }
        }

        return true;
    }

    // Решает судоку методом бэктрекинга
    solveSudoku(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    this.shuffleArray(numbers);
                    
                    for (let num of numbers) {
                        if (this.isValidPlacement(board, row, col, num)) {
                            board[row][col] = num;
                            if (this.solveSudoku(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Создает головоломку из решенного судоку по уровню сложности
    createPuzzleFromSolution(solution, difficulty) {
        const puzzle = this.deepCopy(solution);
        
        // Настройки сложности: количество клеток, которые нужно заполнить
        const difficultySettings = {
            easy: 40,    // 40 заполненных клеток (41 пустая)
            medium: 33,  // 33 заполненных клетки (48 пустых)
            hard: 27     // 27 заполненных клеток (54 пустых)
        };

        const cellsToKeep = difficultySettings[difficulty] || 33;
        const cellsToRemove = 81 - cellsToKeep;

        // Создаем массив всех позиций
        const positions = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }

        // Перемешиваем позиции
        this.shuffleArray(positions);

        // Удаляем цифры
        let removed = 0;
        for (let i = 0; i < positions.length && removed < cellsToRemove; i++) {
            const [row, col] = positions[i];
            const backup = puzzle[row][col];
            puzzle[row][col] = 0;
            removed++;
        }

        return puzzle;
    }

    // Генерация случайного судоку
    generateSudoku(difficulty = 'medium') {
        console.log('Генерируем новое судоку...');
        
        // Генерируем решенное судоку
        const solution = this.generateCompleteSudoku();
        if (!solution) {
            console.error('Не удалось сгенерировать решенное судоку');
            return null;
        }

        // Создаем головоломку из решения
        const puzzle = this.createPuzzleFromSolution(solution, difficulty);
        
        console.log('Судоку сгенерировано успешно!');
        
        return {
            puzzle: puzzle,
            solution: solution
        };
    }

    initializeGame() {
        const generated = this.generateSudoku(this.currentDifficulty);
        if (generated) {
            this.originalBoard = generated.puzzle;
            this.solution = generated.solution;
            this.board = this.deepCopy(this.originalBoard);
            this.moves = 0;
            this.renderBoard();
            this.startNewGame();
        } else {
            // Резервный вариант с предопределенными головоломками
            this.fallbackToPredefined();
        }
    }

    fallbackToPredefined() {
        console.log('Используем резервные головоломки');
        const puzzles = {
            easy: {
                puzzle: [
                    [5, 3, 0, 0, 7, 0, 0, 0, 0],
                    [6, 0, 0, 1, 9, 5, 0, 0, 0],
                    [0, 9, 8, 0, 0, 0, 0, 6, 0],
                    [8, 0, 0, 0, 6, 0, 0, 0, 3],
                    [4, 0, 0, 8, 0, 3, 0, 0, 1],
                    [7, 0, 0, 0, 2, 0, 0, 0, 6],
                    [0, 6, 0, 0, 0, 0, 2, 8, 0],
                    [0, 0, 0, 4, 1, 9, 0, 0, 5],
                    [0, 0, 0, 0, 8, 0, 0, 7, 9]
                ],
                solution: [
                    [5, 3, 4, 6, 7, 8, 9, 1, 2],
                    [6, 7, 2, 1, 9, 5, 3, 4, 8],
                    [1, 9, 8, 3, 4, 2, 5, 6, 7],
                    [8, 5, 9, 7, 6, 1, 4, 2, 3],
                    [4, 2, 6, 8, 5, 3, 7, 9, 1],
                    [7, 1, 3, 9, 2, 4, 8, 5, 6],
                    [9, 6, 1, 5, 3, 7, 2, 8, 4],
                    [2, 8, 7, 4, 1, 9, 6, 3, 5],
                    [3, 4, 5, 2, 8, 6, 1, 7, 9]
                ]
            }
        };

        const selected = puzzles.easy;
        this.originalBoard = selected.puzzle;
        this.solution = selected.solution;
        this.board = this.deepCopy(this.originalBoard);
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
        if (this.originalBoard[row][col] !== 0) {
            return;
        }

        if (this.selectedCell) {
            const prevCell = document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);
            if (prevCell) prevCell.classList.remove('selected');
        }

        this.selectedCell = { row, col };
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');
    }

    handleNumberInput(number) {
        if (!this.selectedCell || !this.isGameActive) return;

        const { row, col } = this.selectedCell;
        const value = parseInt(number);

        // Считаем ход только при вводе цифры
        this.moves++;
        this.board[row][col] = value;
        
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = value;
        cell.classList.add('user-input');
        cell.classList.remove('error', 'correct');

        document.getElementById('moves').textContent = this.moves;
        this.saveProgress();

        if (this.isSolved()) {
            this.endGame(true);
        }
    }

    handleDelete() {
        if (!this.selectedCell || !this.isGameActive) return;

        const { row, col } = this.selectedCell;
        
        if (this.originalBoard[row][col] === 0 && this.board[row][col] !== 0) {
            // Удаление не считается за ход
            this.board[row][col] = 0;
            
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            cell.textContent = '';
            cell.classList.remove('user-input', 'error', 'correct');

            // Не увеличиваем счетчик ходов
            this.saveProgress();
        }
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

    saveProgress() {
        if (!this.isGameActive) return;

        const progress = {
            board: this.board,
            originalBoard: this.originalBoard,
            solution: this.solution,
            moves: this.moves,
            startTime: this.startTime,
            currentTime: Date.now(),
            difficulty: this.currentDifficulty,
            selectedCell: this.selectedCell
        };

        try {
            localStorage.setItem('sudokuProgress', JSON.stringify(progress));
        } catch (e) {
            console.log('Не удалось сохранить прогресс');
        }
    }

    loadProgress() {
        try {
            const savedProgress = localStorage.getItem('sudokuProgress');
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                
                const timeDiff = Date.now() - progress.currentTime;
                if (timeDiff < 24 * 60 * 60 * 1000) {
                    this.board = progress.board;
                    this.originalBoard = progress.originalBoard;
                    this.solution = progress.solution;
                    this.moves = progress.moves;
                    this.startTime = progress.startTime;
                    this.currentDifficulty = progress.difficulty;
                    this.selectedCell = progress.selectedCell;
                    
                    this.isGameActive = true;
                    this.renderBoard();
                    document.getElementById('moves').textContent = this.moves;
                    
                    this.startTimer();
                    
                    if (this.selectedCell) {
                        const cell = document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);
                        if (cell) cell.classList.add('selected');
                    }
                    
                    return true;
                } else {
                    this.clearProgress();
                }
            }
        } catch (e) {
            console.log('Не удалось загрузить прогресс');
        }
        return false;
    }

    clearProgress() {
        try {
            localStorage.removeItem('sudokuProgress');
        } catch (e) {
            console.log('Не удалось очистить прогресс');
        }
    }

    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('check').addEventListener('click', () => this.checkSolution());
        document.getElementById('solve').addEventListener('click', () => this.solvePuzzle());

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

        document.addEventListener('keydown', (event) => {
            if (!this.selectedCell || !this.isGameActive) return;

            if (event.key >= '1' && event.key <= '9') {
                this.handleNumberInput(event.key);
            } else if (event.key === 'Backspace' || event.key === 'Delete') {
                this.handleDelete();
            }
        });

        // Обработчик изменения сложности
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.currentDifficulty = e.target.value;
                this.startNewGame();
            });
        }

        window.addEventListener('beforeunload', () => {
            if (this.isGameActive) {
                this.saveProgress();
            }
        });
    }

    startNewGame() {
        this.clearProgress();
        
        // Показываем индикатор загрузки
        const messageEl = document.getElementById('message');
        messageEl.className = 'message';
        messageEl.textContent = '🎲 Генерируем новое судоку...';
        
        // Генерируем судоку асинхронно
        setTimeout(() => {
            const generated = this.generateSudoku(this.currentDifficulty);
            if (generated) {
                this.originalBoard = generated.puzzle;
                this.solution = generated.solution;
                this.board = this.deepCopy(this.originalBoard);
                this.moves = 0;
                this.startTime = Date.now();
                this.isGameActive = true;
                
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
            } else {
                this.fallbackToPredefined();
            }
        }, 100);
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
                
                if (elapsed % 30 === 0) {
                    this.saveProgress();
                }
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

        this.clearProgress();

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

document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
