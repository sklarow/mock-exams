// timerHandler.js - Handles exam timer functionality

// Function to start the exam timer
function startTimer(minutes, timerDisplay, onTimeUp) {
    // Clear any existing timer
    let timerInterval = null;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Convert minutes to seconds
    let timeRemaining = minutes * 60;
    
    // Update timer display
    updateTimerDisplay(timeRemaining, timerDisplay);
    
    // Start interval
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay(timeRemaining, timerDisplay);
        
        // Check if time is up
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            if (onTimeUp) onTimeUp();
        }
    }, 1000);
    
    // Return the interval ID so it can be cleared later
    return timerInterval;
}

// Function to update the timer display
function updateTimerDisplay(timeRemaining, timerDisplay) {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Change color when time is running low (less than 1 minute)
    if (timeRemaining < 60) {
        timerDisplay.classList.add('bg-danger');
        timerDisplay.classList.add('text-white');
        timerDisplay.classList.remove('bg-light');
        timerDisplay.classList.remove('text-dark');
    } else {
        timerDisplay.classList.remove('bg-danger');
        timerDisplay.classList.remove('text-white');
        timerDisplay.classList.add('bg-light');
        timerDisplay.classList.add('text-dark');
    }
}

// Function to stop the timer
function stopTimer(timerInterval) {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

// Function to reset the timer display
function resetTimerDisplay(timerDisplay) {
    timerDisplay.classList.remove('bg-danger');
    timerDisplay.classList.remove('text-white');
    timerDisplay.classList.add('bg-light');
    timerDisplay.classList.add('text-dark');
    timerDisplay.textContent = 'Time: 00:00';
}

export {
    startTimer,
    updateTimerDisplay,
    stopTimer,
    resetTimerDisplay
};