let timerInterval;
let seconds = 0;
let isGrowing = false;
let treeStage = 0;
const maxStage = 5;
const growthInterval = 10;
let dialogVisible = false;

const tree = document.getElementById('tree');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const dialogOverlay = document.getElementById('dialog-overlay');
const dialogContent = document.getElementById('dialog-content');
const closeDialog = document.getElementById('close-dialog');

function updateTimer() {
  seconds++;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  timerDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;

  if (seconds % growthInterval === 0 && treeStage < maxStage) {
    growTree();
  }
}

function startTimer() {
  if (!isGrowing) {
    isGrowing = true;
    timerInterval = setInterval(updateTimer, 1000);
    startButton.textContent = 'Pause';
    tree.classList.remove('animate-withering');
    tree.classList.add('animate-grow');
  } else {
    isGrowing = false;
    clearInterval(timerInterval);
    startButton.textContent = 'Resume';
    tree.classList.remove('animate-grow');
    tree.classList.add('animate-withering');
  }
}

function growTree() {
  treeStage++;
  tree.src = `tree-stage-${treeStage}.png`;
  tree.classList.remove('animate-grow');
  void tree.offsetWidth; // Trigger reflow
  tree.classList.add('animate-grow');

  if (treeStage === maxStage) {
    clearInterval(timerInterval);
    showDialog("Congratulations! You've grown a full tree!");
  }
}

function showDialog(message) {
  dialogContent.textContent = message;
  dialogOverlay.style.display = 'flex';
  dialogVisible = true;
}

function hideDialog() {
  dialogOverlay.style.display = 'none';
  dialogVisible = false;
}

startButton.addEventListener('click', startTimer);
closeDialog.addEventListener('click', hideDialog);

// Add this new code to handle window focus changes
// Your existing JavaScript code here...

// Add the new code here, near the end of the file
let plantDied = false;

document.addEventListener('visibilitychange', function() {
  if (document.hidden && isGrowing && !plantDied) {
    clearInterval(timerInterval);
    isGrowing = false;
    startButton.textContent = 'Start';
    tree.classList.remove('animate-grow');
    tree.classList.add('animate-withering');
    plantDied = true;
  } else if (!document.hidden && plantDied) {
    showMessage("You lost your focus and the plant withered", true);
  }
});

function showMessage(text, isFailure = false) {
  const messageElement = document.createElement('div');
  messageElement.className = isFailure ? 'failure-message' : 'success-message';
  messageElement.textContent = text;
  document.body.appendChild(messageElement);

  setTimeout(() => {
    messageElement.remove();
  }, 3000);
}

// Any existing event listeners or initialization code would go here
// document.addEventListener('DOMContentLoaded', function() { ... });
