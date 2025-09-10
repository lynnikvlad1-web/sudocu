class SudokuStats {
    constructor() {
        this.storageKey = 'sudokuStats_v1'; // Версионирование для будущих обновлений
        this.stats = this.loadStats();
    }

    // Загрузка статистики из localStorage с версионированием
    loadStats() {
        try {
            const savedStats = localStorage.getItem(this.storageKey);
            if (savedStats) {
                const parsed = JSON.parse(savedStats);
                // Проверяем структуру данных
                if (parsed && typeof parsed === 'object') {
                    return {
                        easy: Array.isArray(parsed.easy) ? parsed.easy : [],
                        medium: Array.isArray(parsed.medium) ? parsed.medium : [],
                        hard: Array.isArray(parsed.hard) ? parsed.hard : []
                    };
                }
            }
        } catch (e) {
            console.log('Не удалось загрузить статистику, используем пустую');
        }
        
        // Возвращаем структуру по умолчанию
        return {
            easy: [],
            medium: [],
            hard: []
        };
    }

    // Сохранение статистики в localStorage
    saveStats() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
        } catch (e) {
            console.log('Не удалось сохранить статистику (возможно, закончилось место)');
        }
    }

    // Добавление новой записи в статистику
    addRecord(difficulty, timeInSeconds, moves) {
        // Проверяем корректность данных
        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            console.log('Некорректная сложность:', difficulty);
            return;
        }

        const record = {
            id: Date.now(),
            date: new Date().toLocaleDateString('ru-RU'),
            time: Math.max(0, timeInSeconds), // Защита от отрицательных значений
            moves: Math.max(0, moves), // Защита от отрицательных значений
            timestamp: Date.now()
        };

        this.stats[difficulty].push(record);
        this.sortStats();
        this.saveStats();
    }

    // Сортировка статистики
    sortStats() {
        Object.keys(this.stats).forEach(difficulty => {
            this.stats[difficulty].sort((a, b) => {
                // Сначала по времени (меньше - лучше)
                if (a.time !== b.time) {
                    return a.time - b.time;
                }
                // Затем по количеству ходов (меньше - лучше)
                return a.moves - b.moves;
            });
        });
    }

    // Получение статистики для конкретной сложности
    getStatsForDifficulty(difficulty) {
        return this.stats[difficulty] || [];
    }

    // Получение всех статистик
    getAllStats() {
        return this.stats;
    }

    // Форматирование времени в строку
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Создание HTML для отображения статистики
    generateStatsHTML() {
        let html = `
            <div class="stats-modal">
                <div class="stats-content">
                    <div class="stats-header">
                        <h2>🏆 Статистика игр</h2>
                        <button class="close-stats" id="closeStats">×</button>
                    </div>
                    <div class="stats-body">
        `;

        const difficulties = {
            'easy': 'Легко',
            'medium': 'Средне', 
            'hard': 'Сложно'
        };

        Object.keys(difficulties).forEach(difficulty => {
            const records = this.getStatsForDifficulty(difficulty);
            html += `
                <div class="difficulty-section">
                    <h3>${difficulties[difficulty]} (${records.length})</h3>
                    ${records.length > 0 ? `
                        <div class="stats-table">
                            <div class="table-header">
                                <div class="table-cell">Дата</div>
                                <div class="table-cell">Время</div>
                                <div class="table-cell">Ходы</div>
                                <div class="table-cell">Рейтинг</div>
                            </div>
                            ${records.slice(0, 10).map((record, index) => `
                                <div class="table-row ${index === 0 ? 'best-record' : ''}">
                                    <div class="table-cell">${record.date}</div>
                                    <div class="table-cell">${this.formatTime(record.time)}</div>
                                    <div class="table-cell">${record.moves}</div>
                                    <div class="table-cell">${index + 1}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="no-records">Нет записей</div>'}
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    // Отображение модального окна со статистикой
    showStats() {
        // Удаляем существующее модальное окно, если есть
        const existingModal = document.querySelector('.stats-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Создаем и показываем модальное окно
        const statsHTML = this.generateStatsHTML();
        document.body.insertAdjacentHTML('beforeend', statsHTML);

        // Добавляем обработчик закрытия
        const closeBtn = document.getElementById('closeStats');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.querySelector('.stats-modal').remove();
            });
        }

        // Закрытие по клику вне модального окна
        const modal = document.querySelector('.stats-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Очистка всей статистики
    clearAllStats() {
        if (confirm('Вы уверены, что хотите очистить всю статистику?')) {
            this.stats = {
                easy: [],
                medium: [],
                hard: []
            };
            this.saveStats();
            this.showStats(); // Обновляем отображение
        }
    }

    // Экспорт статистики (для резервного копирования)
    exportStats() {
        const dataStr = JSON.stringify(this.stats, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sudoku-stats-export.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    // Импорт статистики
    importStats(jsonString) {
        try {
            const importedStats = JSON.parse(jsonString);
            if (importedStats && typeof importedStats === 'object') {
                this.stats = {
                    easy: Array.isArray(importedStats.easy) ? importedStats.easy : [],
                    medium: Array.isArray(importedStats.medium) ? importedStats.medium : [],
                    hard: Array.isArray(importedStats.hard) ? importedStats.hard : []
                };
                this.sortStats();
                this.saveStats();
                return true;
            }
        } catch (e) {
            console.log('Ошибка импорта статистики:', e);
        }
        return false;
    }
}

// Экспортируем класс
window.SudokuStats = SudokuStats;