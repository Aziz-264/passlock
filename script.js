// ============================================
// PassLock System JavaScript
// ============================================

// Variables
let userPass = 24680;
let adminPass = 99999;
let wrongAttempts = 0;
let systemLocked = false;

// Keypad layout
let keypadLayout = ['0','1','2','3','4','5','6','7','8','9'];

// Attempt log
let attemptHistory = [];

// Current input
let currentInput = '';

// Admin access flag
let adminAuthenticated = false;

// ============================================
// CORE FUNCTIONS
// ============================================

function shuffleKeypad() {
    for(let i = keypadLayout.length - 1; i > 0; i--) {
        let r = Math.floor(Math.random() * (i + 1));
        let temp = keypadLayout[i];
        keypadLayout[i] = keypadLayout[r];
        keypadLayout[r] = temp;
    }
    renderKeypad();
}

function renderKeypad() {
    const keypadEl = document.getElementById('keypad');
    if (!keypadEl) return;
    
    keypadEl.innerHTML = '';
    
    // Row 1: keys 1, 2, 3
    for(let i = 1; i <= 3; i++) {
        const key = document.createElement('button');
        key.className = 'key';
        key.textContent = keypadLayout[i];
        key.onclick = () => handleKeyPress(keypadLayout[i]);
        keypadEl.appendChild(key);
    }
    
    // Row 2: keys 4, 5, 6
    for(let i = 4; i <= 6; i++) {
        const key = document.createElement('button');
        key.className = 'key';
        key.textContent = keypadLayout[i];
        key.onclick = () => handleKeyPress(keypadLayout[i]);
        keypadEl.appendChild(key);
    }
    
    // Row 3: keys 7, 8, 9
    for(let i = 7; i <= 9; i++) {
        const key = document.createElement('button');
        key.className = 'key';
        key.textContent = keypadLayout[i];
        key.onclick = () => handleKeyPress(keypadLayout[i]);
        keypadEl.appendChild(key);
    }
    
    // Zero key
    const zeroKey = document.createElement('button');
    zeroKey.className = 'key zero';
    zeroKey.textContent = keypadLayout[0];
    zeroKey.onclick = () => handleKeyPress(keypadLayout[0]);
    keypadEl.appendChild(zeroKey);
}

function convertFullInput(input) {
    let result = 0;
    
    for (let i = 0; i < input.length; i++) {
        let digit = input[i];
        let position = keypadLayout.indexOf(digit);
        
        if (position !== -1) {
            result = result * 10 + position;
        } else {
            result = result * 10 + parseInt(digit);
        }
    }
    
    return result;
}

function saveFailedAttempt(code, adminTry = false) {
    const now = new Date();
    const timeStamp = now.toLocaleTimeString();
    
    attemptHistory.push({
        time: timeStamp,
        code: code,
        type: adminTry ? 'Admin' : 'User'
    });
    
    if (adminAuthenticated) {
        renderLog();
    }
}

function checkAdminCode(code) {
    let s = code.toString();
    
    if(s.length !== 5) {
        return false;
    }
    
    let first = parseInt(s[0]);
    if(first % 2 !== 0 || first === 0) {
        return false;
    }
    
    return true;
}

function activateLock() {
    systemLocked = true;
    showMessage("!!! SYSTEM LOCKED (5 wrong attempts)\nOnly admin can unlock.", "error");
}

// ============================================
// LOGIN FUNCTIONS
// ============================================

function userLogin() {
    if(systemLocked) {
        showMessage("System locked! Only admin can unlock.", "error");
        return false;
    }
    
    if(currentInput.length !== 5) {
        showMessage("Please enter 5 digits", "error");
        return false;
    }
    
    let displayedInput = currentInput;
    let actualInput = convertFullInput(displayedInput);
    
    showConversionInfo(displayedInput, actualInput);
    
    if(actualInput === userPass) {
        showMessage("ACCESS GRANTED", "success");
        wrongAttempts = 0;
        clearInput();
        shuffleKeypad();
        return true;
    } else {
        wrongAttempts++;
        showMessage(`Wrong code! Failed attempts: ${wrongAttempts}/5`, "error");
        saveFailedAttempt(actualInput, false);
        
        if(wrongAttempts >= 5) {
            activateLock();
        }
        
        clearInput();
        shuffleKeypad();
        return false;
    }
}

function adminLogin() {
    if(currentInput.length !== 5) {
        showMessage("Please enter 5 digits", "error");
        return false;
    }
    
    let displayedInput = currentInput;
    let actualInput = convertFullInput(displayedInput);
    
    showConversionInfo(displayedInput, actualInput);
    
    if(actualInput === adminPass) {
        showMessage("ADMIN ACCESS GRANTED\nSystem unlocked.", "success");
        systemLocked = false;
        wrongAttempts = 0;
        clearInput();
        shuffleKeypad();
        return true;
    } else {
        wrongAttempts++;
        showMessage(`Wrong admin code! Failed attempts: ${wrongAttempts}/5`, "error");
        saveFailedAttempt(actualInput, true);
        
        if(wrongAttempts >= 5) {
            activateLock();
        }
        
        clearInput();
        shuffleKeypad();
        return false;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function handleKeyPress(digit) {
    if(currentInput.length >= 5) return;
    
    currentInput += digit;
    updateDisplay();
}

function updateDisplay() {
    const digits = ['digit1', 'digit2', 'digit3', 'digit4', 'digit5'];
    
    for(let i = 0; i < 5; i++) {
        const digitEl = document.getElementById(digits[i]);
        if(digitEl) {
            if(i < currentInput.length) {
                digitEl.textContent = '•';
                digitEl.classList.remove('empty');
            } else {
                digitEl.textContent = '_';
                digitEl.classList.add('empty');
            }
        }
    }
}

function clearInput() {
    currentInput = '';
    updateDisplay();
    const conversionInfo = document.getElementById('conversionInfo');
    if(conversionInfo) conversionInfo.textContent = '';
}

function showMessage(text, type) {
    const msgEl = document.getElementById('message');
    if (!msgEl) return;
    
    msgEl.textContent = text;
    msgEl.className = `message ${type}`;
    
    setTimeout(() => {
        msgEl.textContent = '';
        msgEl.className = 'message';
    }, 3000);
}

function showConversionInfo(displayed, actual) {
    const conversionInfo = document.getElementById('conversionInfo');
    if (conversionInfo) {
        conversionInfo.textContent = `Displayed: ${displayed} → Actual: ${actual}`;
        conversionInfo.style.color = '#4cc9f0';
    }
}

function showAdminMenu() {
    const adminMenu = document.getElementById('adminMenu');
    const adminControls = document.getElementById('adminControls');
    const logContainer = document.getElementById('logContainer');
    const adminMenuCode = document.getElementById('adminMenuCode');
    
    if(adminMenu) adminMenu.style.display = 'block';
    if(adminControls) adminControls.style.display = 'none';
    if(logContainer) logContainer.style.display = 'none';
    if(adminMenuCode) {
        adminMenuCode.value = '';
        adminMenuCode.focus();
    }
}

function hideAdminMenu() {
    const adminMenu = document.getElementById('adminMenu');
    if(adminMenu) adminMenu.style.display = 'none';
    adminAuthenticated = false;
}

function verifyAdminForMenu() {
    const adminMenuCode = document.getElementById('adminMenuCode');
    if(!adminMenuCode) return;
    
    const code = adminMenuCode.value;
    
    if(code.length !== 5) {
        showMessage("Please enter 5 digits", "error");
        return;
    }
    
    const displayedInput = code;
    const actualInput = convertFullInput(displayedInput);
    
    if(actualInput === adminPass) {
        adminAuthenticated = true;
        const adminControls = document.getElementById('adminControls');
        const logContainer = document.getElementById('logContainer');
        if(adminControls) adminControls.style.display = 'block';
        if(logContainer) logContainer.style.display = 'block';
        showMessage("Admin verified. Access granted.", "success");
        
        renderLog();
        shuffleKeypad();
    } else {
        wrongAttempts++;
        showMessage(`Wrong admin code! Failed attempts: ${wrongAttempts}/5`, "error");
        saveFailedAttempt(actualInput, true);
        adminMenuCode.value = '';
        
        if(wrongAttempts >= 5) {
            activateLock();
            hideAdminMenu();
        }
        
        shuffleKeypad();
    }
}

function changeUserCode() {
    if(!adminAuthenticated) {
        showMessage("Admin verification required", "error");
        return;
    }
    
    const input = document.getElementById('newUserCodeInput');
    if(!input) return;
    
    const newCode = parseInt(input.value);
    
    if(isNaN(newCode) || newCode.toString().length !== 5) {
        showMessage("User code must be 5 digits", "error");
        return;
    }
    
    if(!checkAdminCode(newCode)) {
        showMessage("User code must start with even number (not zero)", "error");
        return;
    }
    
    userPass = newCode;
    input.value = '';
    showMessage("User code updated", "success");
    shuffleKeypad();
}

function changeAdminCode() {
    if(!adminAuthenticated) {
        showMessage("Admin verification required", "error");
        return;
    }
    
    const input = document.getElementById('newAdminCodeInput');
    if(!input) return;
    
    const newCode = parseInt(input.value);
    
    if(isNaN(newCode) || newCode.toString().length !== 5) {
        showMessage("Admin code must be 5 digits", "error");
        return;
    }
    
    if(!checkAdminCode(newCode)) {
        showMessage("Admin code must start with even number (not zero)", "error");
        return;
    }
    
    adminPass = newCode;
    input.value = '';
    showMessage("Admin code updated", "success");
    shuffleKeypad();
}

function renderLog() {
    const container = document.getElementById('logContent');
    if (!container) return;
    
    container.innerHTML = '';
    
    if(attemptHistory.length === 0) {
        container.innerHTML = '<div class="log-entry">No failed attempts yet.</div>';
        return;
    }
    
    const reversedHistory = [...attemptHistory].reverse();
    
    reversedHistory.forEach((attempt, i) => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
            <div><strong>#${attemptHistory.length - i}</strong> ${attempt.time}</div>
            <div>Code: ${attempt.code} | Type: ${attempt.type}</div>
        `;
        container.appendChild(entry);
    });
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    shuffleKeypad();
    
    document.addEventListener('keydown', (e) => {
        if(e.key >= '0' && e.key <= '9') {
            if(keypadLayout.includes(e.key)) {
                handleKeyPress(e.key);
            }
        } else if(e.key === 'Enter') {
            userLogin();
        } else if(e.key === 'Escape') {
            clearInput();
        } else if(e.key === 'Backspace') {
            currentInput = currentInput.slice(0, -1);
            updateDisplay();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}