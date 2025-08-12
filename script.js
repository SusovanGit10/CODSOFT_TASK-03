const inputDisplay = document.querySelector('.input-display');
const resultDisplay = document.querySelector('.result-display');
const historyList = document.getElementById('history-list');
let current = '0';
let previous = '';
let operator = null;
let memory = 0;
let history = [];
const maxHistory = 20;
let isNew = true;
let isMu = false;
let muCost = 0;
let showProfit = false;
let lastAnswer = '0';

function updateInputDisplay(expr) {
    inputDisplay.textContent = expr || '0';
}

function updateResultDisplay(result) {
    resultDisplay.textContent = result || '0';
    lastAnswer = result || '0';
}

function addToHistory(entry) {
    history.push(entry);
    if (history.length > maxHistory) history.shift();
    historyList.innerHTML = history.map(h => `<p>${h}</p>`).join('');
}

document.querySelector('.grid').addEventListener('click', e => {
    if (!e.target.matches('button')) return;
    handleInput(e.target.dataset.action);
});

document.addEventListener('keydown', e => {
    let key = e.key;
    if (key === 'Enter') key = '=';
    if (key === 'Backspace') key = 'DEL';
    if (key === 'Escape') key = 'AC';
    if (key === '*') key = '*';
    if (key === '/') key = '/';
    if (key === '%') key = '%';
    if (key === 'r') key = 'sqrt';
    if (key === 'n') key = '+/-';
    if (/[0-9.+\-*=/%]/.test(key) || ['DEL', 'AC', 'sqrt', '+/-'].includes(key)) {
        handleInput(key);
    }
});

function handleInput(key) {
    let expr = '';
    if (/\d/.test(key)) {
        current = (isNew || current === '0') ? key : current + key;
        isNew = false;
        expr = current;
    } else if (key === '00') {
        current = (isNew || current === '0') ? '0' : current + '00';
        isNew = false;
        expr = current;
    } else if (key === '.') {
        if (isNew) current = '0.';
        else if (!current.includes('.')) current += '.';
        isNew = false;
        expr = current;
    } else if (key === 'DEL') {
        current = current.length > 1 ? current.slice(0, -1) : '0';
        expr = current;
    } else if (key === 'AC') {
        current = '0';
        previous = '';
        operator = null;
        isNew = true;
        isMu = false;
        showProfit = false;
        expr = '0';
    } else if (key === '+/-') {
        current = (-parseFloat(current)).toString();
        expr = current;
    } else if (key === 'sqrt') {
        current = Math.sqrt(parseFloat(current)).toString();
        expr = `√${current}`;
    } else if (['+', '-', '*', '/'].includes(key)) {
        if (operator && !isNew) calculate();
        previous = current;
        operator = key;
        isNew = true;
        expr = `${previous} ${operator}`;
    } else if (key === '%') {
        if (isMu) {
            let rate = parseFloat(current);
            let selling = muCost / (1 - rate / 100);
            current = selling.toString();
            addToHistory(`${muCost} MU ${rate}% = ${current}`);
            isMu = false;
            showProfit = true;
            isNew = true;
            expr = `${muCost} MU ${rate}% = ${current}`;
        } else if (operator) {
            let perc = parseFloat(current) / 100;
            current = (['+', '-'].includes(operator) ? parseFloat(previous) * perc : perc).toString();
            expr = `${previous} ${operator} ${current}%`;
        } else {
            current = (parseFloat(current) / 100).toString();
            expr = `${current}%`;
        }
    } else if (key === '=') {
        if (showProfit) {
            let profit = parseFloat(current) - muCost;
            current = profit.toString();
            addToHistory(`Profit = ${current}`);
            showProfit = false;
            expr = `Profit = ${current}`;
        } else if (operator) {
            expr = `${previous} ${operator} ${current} = `;
            calculate();
            addToHistory(expr + current);
        }
    } else if (key === 'MU') {
        muCost = parseFloat(current);
        isMu = true;
        isNew = true;
        expr = `MU set to ${muCost}`;
    } else if (key === 'M+') {
        memory += parseFloat(current);
        expr = `M+ ${current}`;
    } else if (key === 'M-') {
        memory -= parseFloat(current);
        expr = `M- ${current}`;
    } else if (key === 'MR') {
        current = memory.toString();
        expr = `MR = ${current}`;
    } else if (key === 'MC') {
        memory = 0;
        expr = 'MC';
    } else if (key === 'Ans') {
        current = lastAnswer;
        isNew = false;
        expr = `Ans = ${current}`;
    }
    updateInputDisplay(expr);
    updateResultDisplay(current);
}

function calculate() {
    let a = parseFloat(previous);
    let b = parseFloat(current);
    switch (operator) {
        case '+': current = (a + b).toString(); break;
        case '-': current = (a - b).toString(); break;
        case '*': current = (a * b).toString(); break;
        case '/': current = b === 0 ? 'Error' : (a / b).toString(); break;
    }
    operator = null;
    isNew = true;
}

updateInputDisplay();
updateResultDisplay();