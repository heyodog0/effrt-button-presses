let currentQuestionIndex = 0;
let responses = [];
let selectedChoice = null;

function initializePreferences() {
    currentQuestionIndex = 0;
    responses = [];
    selectedChoice = null;
}

function startPreferenceAssessment() {
    displayQuestion();
}

function displayQuestion() {
    const question = questions[currentQuestionIndex];
    const container = document.getElementById('questionContainer');
    const progressFill = document.getElementById('progressFill');
    
    // Update progress bar
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;

    // Create question HTML
    container.innerHTML = `
        <h3>${question.question}</h3>
        <div class="choice-container">
            <button class="choice-button" onclick="selectChoice(0)">${question.choices[0]}</button>
            <button class="choice-button" onclick="selectChoice(1)">${question.choices[1]}</button>
        </div>
    `;

    // Reset selected choice
    selectedChoice = null;
    document.getElementById('nextButton').style.display = 'none';
}

function selectChoice(choiceIndex) {
    selectedChoice = choiceIndex;
    
    // Update button styles
    const buttons = document.querySelectorAll('.choice-button');
    buttons.forEach((button, index) => {
        button.classList.toggle('selected', index === choiceIndex);
    });

    // Show next button
    document.getElementById('nextButton').style.display = 'block';
}

function handleNext() {
    if (selectedChoice === null) return;

    // Store response with timestamp
    responses.push({
        questionId: questions[currentQuestionIndex].id,
        response: selectedChoice,
        context: questions[currentQuestionIndex].context,
        timestamp: Date.now()
    });

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        completePreferences();
    }
}

function completePreferences() {
    // Display completion message
    const container = document.getElementById('questionContainer');
    container.innerHTML = `
        <h3>Assessment Complete</h3>
        <p>Thank you for completing the preference assessment.</p>
    `;
    
    // Update progress bar to 100%
    document.getElementById('progressFill').style.width = '100%';
    
    // Hide next button
    document.getElementById('nextButton').style.display = 'none';

    // Dispatch completion event
    const event = new CustomEvent('preferencesComplete', {
        detail: {
            responses: responses,
            timestamp: Date.now()
        }
    });
    document.dispatchEvent(event);
}