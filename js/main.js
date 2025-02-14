const AppState = {
    currentSection: 'calibration-section',
    maxPressSpeed: 0,
    preferenceResponses: [],
    gameResults: null,
    startTime: Date.now(),
};

function switchSection(fromSection, toSection) {
    // Remove active class from current section
    document.getElementById(fromSection).classList.remove('active');
    // Add active class to new section
    document.getElementById(toSection).classList.add('active');
    AppState.currentSection = toSection;
    console.log(`Switched from ${fromSection} to ${toSection}`);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Hide all sections first
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    // Show calibration section
    document.getElementById('calibration-section').classList.add('active');
    
    // Initialize components
    initializeCalibration();
});

// Handle transitions between major sections
function transitionToPreferences() {
    switchSection('calibration-section', 'preferences-section');
    initializePreferences();
    startPreferenceAssessment();
}

function transitionToGame() {
    console.log("Transitioning to game section...");
    switchSection('preferences-section', 'game-section');
    console.log("Initializing game...");
    initializeGame(); // Make sure this is being called
}

function completeCalibration() {
    // Store results
    localStorage.setItem('maxPressSpeed', maxSpeed);
    
    // Dispatch event to notify completion
    const event = new CustomEvent('calibrationComplete', {
        detail: {
            maxSpeed: maxSpeed,
            totalPresses: pressCount,
            timestamp: Date.now()
        }
    });
    document.dispatchEvent(event);
    console.log('Dispatched calibrationComplete event with speed:', maxSpeed);
}

// Event listeners for section transitions
document.addEventListener('calibrationComplete', (e) => {
    console.log('Calibration complete, storing speed:', e.detail.maxSpeed);
    AppState.maxPressSpeed = e.detail.maxSpeed;
    localStorage.setItem('maxPressSpeed', e.detail.maxSpeed);
    setTimeout(transitionToPreferences, 1000);
});

document.addEventListener('preferencesComplete', (e) => {
    console.log('Preferences complete, storing responses:', e.detail.responses);
    AppState.preferenceResponses = e.detail.responses;
    setTimeout(transitionToGame, 1000);
});

document.addEventListener('gameComplete', (e) => {
    console.log('Game complete:', e.detail);
    AppState.gameResults = e.detail.results;
    
    // Create final experiment data
    const experimentData = {
        startTime: AppState.startTime,
        endTime: Date.now(),
        maxPressSpeed: AppState.maxPressSpeed,
        preferences: AppState.preferenceResponses,
        gameResults: AppState.gameResults
    };
    
    console.log('Experiment complete:', experimentData);
});