// timerHandler.js - Handles exam timer functionality

// Initialize canvas and context variables
let canvas, ctx, totalTime, currentTime;

// Function to start the exam timer
function startTimer(minutes, timerDisplay, onTimeUp) {
    // Clear any existing timer
    let timerInterval = null;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Convert minutes to seconds
    let timeRemaining = minutes * 60;
    totalTime = timeRemaining;
    currentTime = timeRemaining;
    
    // Clear the timer display and add canvas
    timerDisplay.innerHTML = '';
    
    // Create canvas element
    canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    timerDisplay.appendChild(canvas);
    
    // Add time text element
    const timeText = document.createElement('div');
    timeText.id = 'time-text';
    timeText.style.textAlign = 'center';
    timeText.style.marginTop = '5px';
    timeText.style.fontWeight = 'bold';
    timerDisplay.appendChild(timeText);
    
    // Get canvas context
    ctx = canvas.getContext('2d');
    
    // Update timer display
    updateTimerDisplay(timeRemaining, timerDisplay);
    
    // Start interval
    timerInterval = setInterval(() => {
        timeRemaining--;
        currentTime = timeRemaining;
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
    const timeText = document.getElementById('time-text');
    timeText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Draw the countdown wheel
    drawCountdownWheel(timeRemaining);
    
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

// Function to draw the countdown wheel
function drawCountdownWheel(timeRemaining) {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 5;
    
    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f0f0f0';
    ctx.fill();
    
    // Calculate the angle based on remaining time
    const progress = currentTime / totalTime;
    const startAngle = -Math.PI / 2; // Start at the top
    const endAngle = startAngle + (Math.PI * 2 * progress);
    
    // Draw progress arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    
    // Set color based on remaining time
    let color;
    if (progress < 0.25) {
        color = '#dc3545'; // Red - danger
    } else if (progress < 0.5) {
        color = '#ffc107'; // Yellow - warning
    } else {
        color = '#28a745'; // Green - success
    }
    
    ctx.fillStyle = color;
    ctx.fill();
    
    // Draw inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
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