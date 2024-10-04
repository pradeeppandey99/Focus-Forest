let timeLeft = 30;
let timerId;
let isGameOver = false;

const timerDisplay = document.querySelector('.timer-display');
const dialogOverlay = document.getElementById('dialogOverlay');
const successMessage = document.getElementById('successMessage');
const failureMessage = document.getElementById('failureMessage');
const sapling = document.querySelector('.sapling');
const tree = document.querySelector('.tree');

function updateTimer() {
    timerDisplay.textContent = timeLeft;
    if (timeLeft === 0) {
        endGame(true);
    } else {
        timeLeft--;
        timerId = setTimeout(updateTimer, 1000);
    }
}

function endGame(success) {
    isGameOver = true;
    clearTimeout(timerId);
    if (success) {
        sapling.style.display = 'none';
        tree.style.display = 'block';
        tree.classList.add('animate-grow');
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
            dialogOverlay.style.display = 'flex';
        }, 2000);
    } else {
        sapling.classList.add('animate-withering');
        failureMessage.style.display = 'block';
        setTimeout(() => {
            failureMessage.style.display = 'none';
            restartGame();
        }, 3000);
    }
}

function restartGame() {
    isGameOver = false;
    timeLeft = 30;
    sapling.style.display = 'block';
    tree.style.display = 'none';
    sapling.classList.remove('animate-withering');
    dialogOverlay.style.display = 'none';
    updateTimer();
}

function handleVisibilityChange() {
    if (document.hidden && !isGameOver) {
        endGame(false);
    }
}

document.addEventListener('visibilitychange', handleVisibilityChange);

updateTimer();
