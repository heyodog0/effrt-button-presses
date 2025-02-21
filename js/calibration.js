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
    
    // Add starting animation
    timerDisplay.style.animation = 'countUpdate 0.3s ease';
    
    let timeLeft = 20;
    
    // Update the display with more engaging text
    timerDisplay.innerHTML = `<span style="color: #2563eb">${timeLeft}</span> seconds left!`;
    pressDisplay.textContent = `Rapid Presses: ${pressCount}`;
    
    calibrationTimer = setInterval(() => {
        timeLeft--;
        // Add urgency to the timer display
        if (timeLeft <= 5) {
            timerDisplay.style.color = '#dc2626';
        }
        timerDisplay.innerHTML = `<span style="color: ${timeLeft <= 5 ? '#dc2626' : '#2563eb'}">${timeLeft}</span> seconds left!`;
        
        if (timeLeft <= 0) {
            endCalibration();
        }
    }, 1000);
}

function endCalibration() {
    clearInterval(calibrationTimer);
    calibrationActive = false;
    maxSpeed = pressCount / 20;
    
    localStorage.setItem('maxPressSpeed', maxSpeed.toString());
    
    // Add more engaging results display
    const speedDisplay = document.getElementById('maxSpeed');
    speedDisplay.textContent = `${maxSpeed.toFixed(2)} presses/second`;
    
    // Animate the transition
    nextSubsection('calibration', 'calibration-results');
    
    // Add celebration effect if the speed is good (optional)
    if (maxSpeed > 5) {
        speedDisplay.style.color = '#059669'; // Green color for good performance
    }
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
        const pressDisplay = document.getElementById('pressCount');
        pressDisplay.textContent = `Rapid Presses: ${pressCount}`;
        
        // Add visual feedback for each press
        pressDisplay.classList.remove('updated');
        void pressDisplay.offsetWidth; // Trigger reflow
        pressDisplay.classList.add('updated');
    }
});

// Add this event listener to reset the flag
document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        spaceKeyDown = false;
    }
});