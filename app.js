let timeLeft = 25 * 60;
let isActive = false;
let trees = [];
let isWithering = false;
let isDying = false;
let wakeLock = null;
const SESSION_TIME = 25 * 60;

const timer = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const forestButton = document.getElementById('forestButton');
const tree = document.getElementById('tree');
const successMessage = document.getElementById('successMessage');
const failureMessage = document.getElementById('failureMessage');

startButton.addEventListener('click', handleStart);

function handleStart() {
    if (!isActive) {
        isActive = true;
        isWithering = false;
        isDying = false;
        startButton.textContent = 'In Progress';
        startButton.disabled = true;
        startButton.classList.add('bg-green-300', 'text-green-700', 'cursor-not-allowed');
        startButton.classList.remove('bg-green-500', 'text-white', 'hover:bg-green-600', 'hover:shadow-lg');
        startTimer();
        requestWakeLock();
    }
}

function startTimer() {
    const interval = setInterval(() => {
        if (timeLeft > 0 && isActive) {
            timeLeft--;
            updateTimer();
            updateTree();
        } else if (timeLeft === 0) {
            clearInterval(interval);
            isActive = false;
            trees.push({ id: Date.now() });
            showSuccessMessage();
            resetTimer();
            updateForestButton();
            releaseWakeLock();
        }
    }, 1000);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden && isActive) {
            clearInterval(interval);
            isActive = false;
            isWithering = true;
            isDying = true;
            showFailureMessage();
            setTimeout(() => {
                isWithering = false;
                isDying = false;
                resetTimer();
            }, 5000);
            releaseWakeLock();
        }
    });
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTree() {
    const progress = ((SESSION_TIME - timeLeft) / SESSION_TIME) * 100;
    const baseSize = 48;
    const maxSize = 120;
    const currentSize = baseSize + (progress / 100) * (maxSize - baseSize);
    const treeColor = isWithering ? '#EF4444' : '#15803D';
    
    tree.setAttribute('width', currentSize);
    tree.setAttribute('height', currentSize);
    
    if (progress < 50) {
        tree.innerHTML = `
            <path d="M12 8C12 8 12 2 18 2C18 8 12 8 12 8" stroke="${treeColor}" fill="${treeColor}" stroke-width="0.5"/>
            <path d="M12 8C12 8 12 2 6 2C6 8 12 8 12 8" stroke="${treeColor}" fill="${treeColor}" stroke-width="0.5"/>
            <line x1="12" y1="8" x2="12" y2="24" stroke="${treeColor}" stroke-width="2"/>
            <path d="M12 14C12 14 12 8 18 8C18 14 12 14 12 14" stroke="${treeColor}" fill="${treeColor}" stroke-width="0.5"/>
            <path d="M12 14C12 14 12 8 6 8C6 14 12 14 12 14" stroke="${treeColor}" fill="${treeColor}" stroke-width="0.5"/>
        `;
    } else {
        tree.innerHTML = `
            <path d="M12,2L8,9L16,9Z" stroke="${treeColor}" fill="${treeColor}" stroke-width="0.5"/>
            <path d="M12,6L7,14L17,14Z" stroke="${treeColor}" fill="${treeColor}" stroke-width="0.5"/>
            <path d="M12,10L6,19L18,19Z" stroke="${treeColor}" fill="${treeColor}" stroke-width="0.5"/>
            <rect x="11" y="19" width="2" height="5" fill="#5B3E31"/>
        `;
    }
    
    if (isDying) {
        tree.classList.add('animate-disintegrate');
    } else {
        tree.classList.remove('animate-disintegrate');
    }
}

function resetTimer() {
    timeLeft = SESSION_TIME;
    updateTimer();
    startButton.textContent = 'Start Focus';
    startButton.disabled = false;
    startButton.classList.remove('bg-green-300', 'text-green-700', 'cursor-not-allowed');
    startButton.classList.add('bg-green-500', 'text-white', 'hover:bg-green-600', 'hover:shadow-lg');
}

function updateForestButton() {
    forestButton.textContent = `Your Forest (${trees.length})`;
}

function showSuccessMessage() {
    successMessage.classList.remove('hidden');
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 5000);
}

function showFailureMessage() {
    failureMessage.classList.remove('hidden');
    setTimeout(() => {
        failureMessage.classList.add('hidden');
    }, 5000);
}

async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

function releaseWakeLock() {
    if (wakeLock != null) {
        wakeLock.release()
            .then(() => {
                wakeLock = null;
            });
    }
}

// Initialize
updateTimer();
updateTree();
