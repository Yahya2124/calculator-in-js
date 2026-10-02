const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');
const buttons = document.querySelectorAll('.btn');

let expression = '';
let justEvaluated = false;

function updateDisplay() {
  expressionDisplay.textContent = expression || '0';
  resultDisplay.textContent = expression ? '0' : '0';
}

function appendNumber(value) {
  if (justEvaluated && /\d/.test(value)) {
    expression = '';
    justEvaluated = false;
  }

  if (justEvaluated && value === '.') {
    expression = '';
    justEvaluated = false;
  }

  if (value === '.' && expression.includes('.')) {
    const lastOperatorIndex = Math.max(
      expression.lastIndexOf('+'),
      expression.lastIndexOf('-'),
      expression.lastIndexOf('*'),
      expression.lastIndexOf('/'),
      expression.lastIndexOf('%')
    );

    const currentNumber = expression.slice(lastOperatorIndex + 1);
    if (currentNumber.includes('.')) {
      return;
    }
  }

  expression += value;
  justEvaluated = false;
  updateDisplay();
}

function appendOperator(value) {
  if (!expression) {
    return;
  }

  const lastChar = expression.slice(-1);
  if (['+', '-', '*', '/', '%'].includes(lastChar)) {
    expression = expression.slice(0, -1) + value;
  } else {
    expression += value;
  }

  justEvaluated = false;
  updateDisplay();
}

function clearAll() {
  expression = '';
  justEvaluated = false;
  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  justEvaluated = false;
  updateDisplay();
}

function calculateResult() {
  if (!expression) {
    return;
  }

  try {
    const safeExpression = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/%/g, '/100');

    const result = Function(`"use strict"; return (${safeExpression});`)();

    if (!Number.isFinite(result)) {
      throw new Error('Invalid calculation');
    }

    expression = Number.isInteger(result)
      ? String(result)
      : Number(result.toFixed(10)).toString();

    justEvaluated = true;
    expressionDisplay.textContent = expression;
    resultDisplay.textContent = expression;
  } catch (error) {
    expression = 'Error';
    justEvaluated = true;
    expressionDisplay.textContent = expression;
    resultDisplay.textContent = '0';
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (action === 'clear') {
      clearAll();
      return;
    }

    if (action === 'delete') {
      deleteLast();
      return;
    }

    if (action === 'equals') {
      calculateResult();
      return;
    }

    if (/[0-9]/.test(value)) {
      appendNumber(value);
      return;
    }

    if (value === '.') {
      appendNumber(value);
      return;
    }

    if (['+', '-', '*', '/', '%'].includes(value)) {
      appendOperator(value);
    }
  });
});

document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    appendNumber(key);
    return;
  }

  if (['+', '-', '*', '/', '%', '.'].includes(key)) {
    if (key === '%') {
      appendOperator('%');
      return;
    }

    if (['+', '-', '*', '/'].includes(key)) {
      appendOperator(key);
      return;
    }

    appendNumber('.');
    return;
  }

  if (key === 'Enter' || key === '=') {
    calculateResult();
    return;
  }

  if (key === 'Backspace') {
    deleteLast();
  }

  if (key === 'Escape') {
    clearAll();
  }
});

updateDisplay();
