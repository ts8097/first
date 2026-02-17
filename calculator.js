const ROMAN_VALUES = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100,  'C'], [90,  'XC'], [50,  'L'], [40,  'XL'],
  [10,   'X'], [9,   'IX'], [5,   'V'], [4,   'IV'],
  [1,    'I'],
];

function toRoman(num) {
  if (num <= 0 || num > 3999 || !Number.isInteger(num)) return null;
  let result = '';
  for (const [value, numeral] of ROMAN_VALUES) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

function fromRoman(str) {
  str = str.toUpperCase().trim();
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const curr = map[str[i]];
    const next = map[str[i + 1]];
    if (!curr) return null;
    if (next && curr < next) {
      result -= curr;
    } else {
      result += curr;
    }
  }
  return result > 0 ? result : null;
}

// --- Calculator state ---
let currentInput = '';   // the numeral string being built
let operator = null;
let operandA = null;     // integer value of first operand
let justEvaluated = false;

const display = document.getElementById('display');
const history = document.getElementById('history');

function updateDisplay(text, subtitle = '') {
  display.textContent = text || 'O';  // O looks like 0 in roman context
  history.textContent = subtitle;
}

function appendNumeral(numeral) {
  if (justEvaluated) {
    currentInput = '';
    justEvaluated = false;
  }

  const candidate = currentInput + numeral;
  const val = fromRoman(candidate);

  // Allow partial valid inputs by checking character-level validity
  // Only block if the string can't possibly be valid Roman numerals
  if (val === null && candidate.length > 0) {
    // Try to give feedback but don't block entry of individual chars
    // We validate on operator/equals press instead
  }
  currentInput = candidate;
  updateDisplay(currentInput || 'O');
}

function pressOperator(op) {
  if (currentInput === '' && operandA !== null) {
    // Allow changing operator
    operator = op;
    updateDisplay(toRoman(operandA), `${toRoman(operandA)} ${op}`);
    return;
  }

  const val = fromRoman(currentInput);
  if (val === null && currentInput !== '') {
    showError('Invalid Roman numeral');
    return;
  }

  if (operandA !== null && operator && currentInput !== '') {
    // Chain operations: evaluate first
    const result = evaluate(operandA, val, operator);
    if (result === null) return;
    operandA = result;
    updateDisplay(toRoman(result), `${toRoman(result)} ${op}`);
  } else {
    operandA = val !== null ? val : operandA;
    updateDisplay(toRoman(operandA), `${toRoman(operandA)} ${op}`);
  }

  operator = op;
  currentInput = '';
  justEvaluated = false;
}

function evaluate(a, b, op) {
  let result;
  switch (op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': {
      if (b === 0) { showError('Cannot divide by O'); return null; }
      result = Math.round(a / b);
      break;
    }
  }
  if (result <= 0 || result > 3999) {
    showError(`Result out of range (must be I–MMMCMXCIX)`);
    return null;
  }
  return result;
}

function pressEquals() {
  if (operator === null || operandA === null) return;

  const valB = fromRoman(currentInput);
  if (valB === null) {
    showError('Invalid Roman numeral');
    return;
  }

  const aRoman = toRoman(operandA);
  const bRoman = toRoman(valB);
  const result = evaluate(operandA, valB, operator);
  if (result === null) return;

  const resultRoman = toRoman(result);
  history.textContent = `${aRoman} ${operator} ${bRoman} =`;
  display.textContent = resultRoman;

  operandA = result;
  currentInput = '';
  operator = null;
  justEvaluated = true;
}

function pressBackspace() {
  if (justEvaluated) {
    pressClear();
    return;
  }
  currentInput = currentInput.slice(0, -1);
  updateDisplay(currentInput || 'O');
}

function pressClear() {
  currentInput = '';
  operator = null;
  operandA = null;
  justEvaluated = false;
  updateDisplay('O', '');
}

function showError(msg) {
  display.textContent = msg;
  history.textContent = '';
  currentInput = '';
  operator = null;
  operandA = null;
  justEvaluated = false;
  setTimeout(() => updateDisplay('O', ''), 2000);
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  const key = e.key.toUpperCase();
  const romanChars = ['I', 'V', 'X', 'L', 'C', 'D', 'M'];
  if (romanChars.includes(key)) { appendNumeral(key); return; }
  if (['+', '-', '*', '/'].includes(e.key)) { pressOperator(e.key); return; }
  if (e.key === 'Enter' || e.key === '=') { pressEquals(); return; }
  if (e.key === 'Backspace') { pressBackspace(); return; }
  if (e.key === 'Escape') { pressClear(); return; }
});
