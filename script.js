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
            // История удалена: больше не добавляем сюда запись
        } catch (e) {
            IOModule.displayError(e.message);
        }
    }
});

// Обработчики кнопок "Новый расчёт" и "Повторить ввод"
newCalculationBtn.addEventListener('click', IOModule.resetInterface);
retryBtn.addEventListener('click', IOModule.resetInterface);

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
// История удалена: больше не инициализируем её здесь
