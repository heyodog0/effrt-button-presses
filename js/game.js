let progress = 0;
let isActive = false;
let isComplete = false;
const maxProgress = 100;
let incrementAmount;
let effortSelected = false;
let currentTrial = 0;
const totalTrials = 5;
let currentEffortLevel = null;
let totalReward = 0;
let gameTimer = null;
const GAME_TIME_LIMIT = 10000; // 10 seconds in milliseconds
let startTime = null;

const rewardAmounts = {
    'high': 10,
    'low': 6
};

function resetForNewEffortChoice() {
    // Clear any existing timer
    if (gameTimer) {
        clearTimeout(gameTimer);
        gameTimer = null;
    }
    
    // Reset game state
    isActive = false;
    isComplete = false;
    effortSelected = false;
    currentEffortLevel = null;
    progress = 0;
    
    // Reset UI
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.width = '0%';
    const progressValue = document.getElementById('progress-value');
    if (progressValue) progressValue.textContent = '0';
    
    // Reset button state
    const gameButton = document.getElementById('game-button');
    if (gameButton) {
        gameButton.disabled = false;
        gameButton.textContent = 'Start Game';
    }
    
    // Clear reward feedback
    const rewardFeedback = document.getElementById('reward-feedback');
    if (rewardFeedback) {
        rewardFeedback.style.display = 'none';
    }
}

function initializeGame() {
    console.log("Game initialization started");
    const container = document.querySelector('#game-section .container');
    
    container.innerHTML = `
        <div class="game-info-container">
            <div id="trial-counter" style="display: none;">
                Trial <span id="current-trial">1</span> of ${totalTrials}
            </div>
            <div id="total-reward" style="display: none;">
                Total Reward: $<span id="reward-amount">0</span>
            </div>
        </div>
        <div id="progress-container" style="display: none;">
            <div id="progress-bar"></div>
        </div>
        <div class="progress-text" style="display: none;">Progress: <span id="progress-value">0</span>%</div>
        <div class="effort-selection">
            <h2 style="margin-bottom: 20px;">Choose your effort level:</h2>
            <div style="display: flex; gap: 20px; justify-content: center;">
                <button onclick="selectEffort('high')" class="choice-button">
                    High Effort<br>
                    Higher Reward ($$$)
                </button>
                <button onclick="selectEffort('low')" class="choice-button">
                    Low Effort<br>
                    Lower Reward ($)
                </button>
            </div>
        </div>
        <button id="game-button" style="display: none;">Start Game</button>
        <div id="instructions"></div>
        <div id="reward-feedback" style="display: none; margin-top: 20px; text-align: center; font-size: 24px; color: #4CAF50;"></div>
    `;

    document.getElementById('game-button')?.addEventListener('click', () => {
        if (!isActive) {
            startGame();
        }
    });
    
    progress = 0;
    isActive = false;
    isComplete = false;
    effortSelected = false;
    currentTrial = 0;
    totalReward = 0;
    console.log("Game initialization completed");
}

function selectEffort(effortLevel) {
    console.log("Effort level selected:", effortLevel);
    const maxSpeed = parseFloat(localStorage.getItem('maxPressSpeed')) || 5;
    
    // Calculate increment amount based on calibration
    // We want the task to take ~8-10 seconds
    // Hard = 75% of max speed, Easy = 45% of max speed
    const effortMultiplier = effortLevel === 'high' ? 0.85 : 0.45;
    incrementAmount = 2 * (5 / maxSpeed) * (1 / effortMultiplier);
    
    // Show game elements
    document.getElementById('progress-container').style.display = 'block';
    document.querySelector('.progress-text').style.display = 'block';
    document.getElementById('game-button').style.display = 'block';
    document.getElementById('trial-counter').style.display = 'block';
    document.getElementById('total-reward').style.display = 'block';
    
    // Reset button state
    const gameButton = document.getElementById('game-button');
    gameButton.disabled = false;
    gameButton.textContent = 'Start Game';
    
    // Hide effort selection
    document.querySelector('.effort-selection').style.display = 'none';
    
    // Update instructions
    document.getElementById('instructions').textContent = `Click Start to begin the ${effortLevel} effort task`;
    
    effortSelected = true;
    currentEffortLevel = effortLevel;
    localStorage.setItem('selectedEffort', effortLevel);
}

function updateProgress(newProgress) {
    progress = Math.min(newProgress, maxProgress);
    const progressBar = document.getElementById('progress-bar');
    const progressValue = document.getElementById('progress-value');
    
    // Update for circular progress
    const size = Math.min(progress, 100);
    progressBar.style.width = `${size}%`;
    progressBar.style.height = `${size}%`;
    progressValue.textContent = Math.round(progress);

    if (progress >= maxProgress) {
        completeGame();
    }
}

function startGame() {
    if (!effortSelected) return;
    
    isActive = true;
    isComplete = false;
    progress = 0;
    updateProgress(0);
    
    const gameButton = document.getElementById('game-button');
    const instructions = document.getElementById('instructions');
    document.getElementById('reward-feedback').style.display = 'none';
    
    gameButton.disabled = true;
    gameButton.textContent = 'In Progress';
    instructions.textContent = 'Press SPACE repeatedly to fill the bar!';

    // Record start time
    startTime = Date.now();
}

function completeGame() {
    isActive = false;
    isComplete = true;
    currentTrial++;
    
    const gameButton = document.getElementById('game-button');
    const instructions = document.getElementById('instructions');
    const rewardFeedback = document.getElementById('reward-feedback');
    
    // Calculate completion time
    const completionTime = Date.now() - startTime;
    const tookTooLong = completionTime > GAME_TIME_LIMIT;
    
    // Calculate reward
    let reward;
    if (currentEffortLevel === 'high') {
        if (progress >= maxProgress && !tookTooLong) {
            // Completed high effort task successfully within time limit
            reward = rewardAmounts['high'];
        } else {
            // Either failed to complete or took too long
            reward = rewardAmounts['low'];
        }
    } else {
        // Low effort task always gets low reward
        reward = rewardAmounts['low'];
    }
    
    totalReward += reward;
    document.getElementById('reward-amount').textContent = totalReward;
    
    // Show appropriate feedback message
    let feedbackMessage;
    if (currentEffortLevel === 'high' && progress >= maxProgress) {
        feedbackMessage = tookTooLong 
            ? `Completed too slowly. You earned $${reward} this trial.`
            : `You earned $${reward} this trial!`;
    } else {
        feedbackMessage = `You earned $${reward} this trial!`;
    }
    rewardFeedback.textContent = feedbackMessage;
    rewardFeedback.style.display = 'block';
    
    if (currentTrial < totalTrials) {
        document.getElementById('current-trial').textContent = currentTrial + 1;
        gameButton.disabled = false;
        gameButton.textContent = 'Start Next Trial';
        instructions.textContent = `Trial ${currentTrial} complete! Click to start next trial.`;
    } else {
        resetForNewEffortChoice();
        document.querySelector('.effort-selection').style.display = 'block';
        document.getElementById('progress-container').style.display = 'none';
        document.querySelector('.progress-text').style.display = 'none';
        document.getElementById('game-button').style.display = 'none';
        document.getElementById('trial-counter').style.display = 'none';
        
        instructions.textContent = 'Choose your effort level for the next set of trials';
        currentTrial = 0;
        document.getElementById('current-trial').textContent = '1';
    }

    // Dispatch completion event
    const event = new CustomEvent('gameComplete', {
        detail: {
            results: {
                finalProgress: progress,
                effortLevel: currentEffortLevel,
                trial: currentTrial,
                reward: reward,
                totalReward: totalReward,
                completionTime: completionTime,
                tookTooLong: tookTooLong,
                timestamp: Date.now()
            }
        }
    });
    document.dispatchEvent(event);
}

let keyIsDown = false;

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && isActive && !isComplete && !keyIsDown) {
        e.preventDefault();
        keyIsDown = true;
        updateProgress(progress + incrementAmount);
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        keyIsDown = false;
    }
});