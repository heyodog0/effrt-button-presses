let calibrationActive = false;
let spaceKeyDown = false;
let calibrationTimer;
let pressCount = 0;
let maxSpeed = 0;

function initializeCalibration() {
    // Reset any existing state
    pressCount = 0;
    calibrationActive = false;
    maxSpeed = 0;
}

function nextSubsection(current, next) {
    document.getElementById(current).classList.remove('active');
    document.getElementById(next).classList.add('active');
}

function checkAttention() {
    const answer1 = document.querySelector('input[name="attentionCheck1"]:checked')?.value;
    const feedback1 = document.getElementById('feedback1');

    if (answer1 === 'space') {
        nextSubsection('instructions', 'calibration');
        feedback1.style.display = 'none';
    } else {
        feedback1.style.display = 'block';
    }
}
function startCalibration() {
    const button = document.getElementById('calibrationButton');
    const timerDisplay = document.getElementById('timer');
    const pressDisplay = document.getElementById('pressCount');
    
    button.disabled = true;
    pressCount = 0;
    calibrationActive = true;
    
    let timeLeft = 10;
    
    calibrationTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time: ${timeLeft}s`;
        
        if (timeLeft <= 0) {
            endCalibration();
        }
    }, 1000);
}

function endCalibration() {
    clearInterval(calibrationTimer);
    calibrationActive = false;
    maxSpeed = pressCount / 10; // presses per second
    
    document.getElementById('maxSpeed').textContent = maxSpeed.toFixed(2);
    nextSubsection('calibration', 'calibration-results');
}

function completeCalibration() {
    // Dispatch event to notify completion
    const event = new CustomEvent('calibrationComplete', {
        detail: {
            maxSpeed: maxSpeed,
            totalPresses: pressCount,
            timestamp: Date.now()
        }
    });
    document.dispatchEvent(event);
}



// Modified space bar event listener
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && calibrationActive && !spaceKeyDown) {
        e.preventDefault();
        spaceKeyDown = true;
        pressCount++;
        document.getElementById('pressCount').textContent = `Presses: ${pressCount}`;
    }
});

// Add this event listener to reset the flag
document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        spaceKeyDown = false;
    }
});