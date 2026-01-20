"use strict";
// --- DOM-ЭЛЕМЕНТЫ ---
const num1Input = document.getElementById('num1');
const num2Input = document.getElementById('num2');
const operationSelect = document.getElementById('operation');
const calculateBtn = document.getElementById('calculate-btn');
const resultSection = document.getElementById('result-section');
const resultText = document.getElementById('result-text');
const errorSection = document.getElementById('error-section');
const errorText = document.getElementById('error-text');
const newCalculationBtn = document.getElementById('new-calculation-btn');
const retryBtn = document.getElementById('retry-btn');
const themeToggle = document.getElementById('theme-toggle');
// --- ЭЛЕМЕНТЫ ДЛЯ ИСТОРИИ ---
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');
// --- МОДУЛИ (адаптированные) ---
const IOModule = {
    // Вывод результата в DOM
    displayMessage(message) {
        resultText.textContent = message;
        resultSection.style.display = 'block';
        errorSection.style.display = 'none';
    },
    // Вывод ошибки в DOM
    displayError(message) {
        console.error(`[Ошибка] ${message}`);
        errorText.textContent = `Ошибка: ${message}`;
        errorSection.style.display = 'block';
        resultSection.style.display = 'none';
    },
    // Сброс всех полей ввода и скрытие секций
    resetInterface() {
        num1Input.value = '';
        num2Input.value = '';
        operationSelect.selectedIndex = 0;
        num1Input.focus();
        resultSection.style.display = 'none';
        errorSection.style.display = 'none';
    }
};
const OperationModule = {
    operations: {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => {
            if (b === 0) throw new Error("Деление на ноль невозможно.");
            return a / b;
        },
        '**': (a, b) => Math.pow(a, b),
        '%': (a, b) => {
            if (b === 0) throw new Error("Деление на ноль невозможно при вычислении остатка.");
            return a % b;
        }
    },
    performCalculation(num1, op, num2) {
        const operation = this.operations[op];
        if (!operation) {
            throw new Error(`Неподдерживаемая операция: ${op}`);
        }
        return operation(num1, num2);
    }
};
const ValidationModule = {
    isValidNumber(input) {
        return !isNaN(parseFloat(input)) && isFinite(input);
    },

    isValidOperation(op) {
        return Object.keys(OperationModule.operations).includes(op);
    }
};
// --- МОДУЛЬ ИСТОРИИ ---
const HistoryModule = {
    // Максимальное количество записей в истории
    maxHistoryLength: 10,
    // Массив для хранения истории
    history: [],
    // Добавить новую запись в историю
    addEntry(num1, op, num2, result) {
        const entry = {
            num1: num1,
            op: op,
            num2: num2,
            result: result,
            timestamp: new Date().toLocaleTimeString() // Добавляем время
        };
        // Добавляем в начало массива
        this.history.unshift(entry);
        // Ограничиваем длину истории
        if (this.history.length > this.maxHistoryLength) {
            this.history.pop();
        }
        // Обновляем отображение
        this.renderHistory();
    },
    // Очистить историю
    clearHistory() {
        this.history = [];
        this.renderHistory();
    },
    // Отобразить историю в DOM
    renderHistory() {
        // Очищаем список
        historyList.innerHTML = '';
        // Проверяем, есть ли записи
        if (this.history.length === 0) {
            historySection.style.display = 'none'; // Скрыть секцию, если нет истории
            return;
        }
        historySection.style.display = 'block'; // Показать секцию, если есть записи
        // Создаём элементы списка для каждой записи
        this.history.forEach((entry, index) => {
            const li = document.createElement('li');
            // Формат: HH:MM:SS - 5 + 3 = 8
            li.textContent = `${entry.timestamp} - ${entry.num1} ${entry.op} ${entry.num2} = ${entry.result}`;
            // Добавляем обработчик клика для повтора вычисления
            li.addEventListener('click', () => {
                num1Input.value = entry.num1;
                operationSelect.value = entry.op;
                num2Input.value = entry.num2;
                // Автоматически вычисляем результат
                calculateBtn.click();
            });
            // Стили для элемента истории (необязательно, можно задать в CSS)
            li.style.cursor = 'pointer';
            li.style.padding = '2px 0';
            li.style.borderBottom = '1px dashed var(--border-color)'; // Используем переменную из CSS
            historyList.appendChild(li);
        });
    }
};
// --- ОСНОВНАЯ ЛОГИКА ---
function getValidInputs() {
    const num1Str = num1Input.value.trim();
    const op = operationSelect.value;
    const num2Str = num2Input.value.trim();
    if (!ValidationModule.isValidNumber(num1Str)) {
        IOModule.displayError("Введите действительное первое число.");
        return null;
    }
    if (!ValidationModule.isValidOperation(op)) {
        IOModule.displayError("Неверная операция.");
        return null;
    }
    if (!ValidationModule.isValidNumber(num2Str)) {
        IOModule.displayError("Введите действительное второе число.");
        return null;
    }
    const num1 = parseFloat(num1Str);
    const num2 = parseFloat(num2Str);
    return { num1, op, num2 };
}
// Обработчик кнопки "Вычислить"
calculateBtn.addEventListener('click', () => {
    const inputs = getValidInputs();
    if (inputs) {
        const { num1, op, num2 } = inputs;
        try {
            const result = OperationModule.performCalculation(num1, op, num2);
            IOModule.displayMessage(`${num1} ${op} ${num2} = ${result}`);
            // Добавляем успешное вычисление в историю
            HistoryModule.addEntry(num1, op, num2, result);
        } catch (e) {
            IOModule.displayError(e.message);
        }
    }
});
// Обработчики кнопок "Новый расчёт" и "Повторить ввод"
newCalculationBtn.addEventListener('click', IOModule.resetInterface);
retryBtn.addEventListener('click', IOModule.resetInterface);
// Обработчик кнопки "Очистить историю"
clearHistoryBtn.addEventListener('click', HistoryModule.clearHistory);
// --- ПЕРЕКЛЮЧЕНИЕ ТЕМЫ (из CSS) ---
themeToggle.addEventListener('click', () => {
    document.body.setAttribute('data-theme',
        document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    );
});
// --- КЛАВИАТУРНЫЙ ВВОД ---
document.addEventListener('keydown', (event) => {
    const activeElement = document.activeElement;
    const isInputFocused = activeElement === num1Input || activeElement === num2Input || activeElement === operationSelect;
    if (event.key === 'Enter' && isInputFocused) {
        event.preventDefault();
        calculateBtn.click();
    }
    if (event.key === 'Escape') {
        IOModule.resetInterface();
    }
});
// --- ИНИЦИАЛИЗАЦИЯ ---
IOModule.resetInterface();
HistoryModule.renderHistory(); // Инициализация отображения истории (должна быть пустой)