// resultsHandler.js - Handles displaying exam results
import { CONFETTI_BURST_COUNT, CONFETTI_BURST_INTERVAL } from './config.js';
import confetti from './confetti.js';

// Function to display exam results
function displayResults(score, elements, selectedQuestions, userAnswers) {
    const { scoreDisplay, passFail, resultsBreakdown, rawScore, totalQuestions } = elements;
    
    // Display score
    scoreDisplay.textContent = score.percentage;
    
    // Display raw score
    if (rawScore && totalQuestions) {
        rawScore.textContent = score.correctAnswers;
        totalQuestions.textContent = score.totalQuestions;
    }
    
    // Display pass/fail message
    passFail.innerHTML = '';
    passFail.className = 'result-card';
    
    // Create a more visually appealing pass/fail card
    const resultIcon = document.createElement('div');
    resultIcon.className = 'result-icon';
    resultIcon.innerHTML = score.isPassing ? 
        '<i class="bi bi-trophy-fill"></i>' : 
        '<i class="bi bi-x-octagon-fill"></i>';
    
    const resultStatus = document.createElement('div');
    resultStatus.className = 'result-status';
    resultStatus.textContent = score.isPassing ? 'PASSED' : 'FAILED';
    
    const resultMessage = document.createElement('div');
    resultMessage.className = 'result-message';
    resultMessage.textContent = score.isPassing ? 
        'Congratulations! You have successfully passed the exam.' : 
        'Don\'t give up! Review the questions below and try again.';
    
    // Apply appropriate styling class
    passFail.classList.add(score.isPassing ? 'pass-card' : 'fail-card');
    
    // Append elements to the pass/fail container
    passFail.appendChild(resultIcon);
    passFail.appendChild(resultStatus);
    passFail.appendChild(resultMessage);
    
    // Trigger confetti if user passed
    if (score.isPassing) {
        triggerConfetti();
    }
    
    // Clear previous results breakdown
    resultsBreakdown.innerHTML = '';
    
    // Create results breakdown header
    const breakdownHeader = document.createElement('h5');
    breakdownHeader.className = 'mb-3';
    breakdownHeader.textContent = 'Question Breakdown:';
    resultsBreakdown.appendChild(breakdownHeader);
    
    // Display each question result
    selectedQuestions.forEach((question, index) => {
        const questionId = `question-${index}`;
        const userAnswer = userAnswers[questionId] || { selectedOption: 'Not answered' };
        
        // Create question result card
        const resultCard = document.createElement('div');
        resultCard.className = 'card mb-3';
        
        // Create card header
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        cardHeader.textContent = `Question ${index + 1}`;
        
        // Create card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Question text
        const questionText = document.createElement('p');
        questionText.className = 'card-text';
        
        // Handle question content based on type
        if (question.questionType === 'html') {
            questionText.innerHTML = question.questionContent;
        } else {
            questionText.textContent = question.questionContent;
        }
        
        // Add question text to card body
        cardBody.appendChild(questionText);
        
        // Check if question has multiple correct answers
        const hasMultipleAnswers = Array.isArray(question.correctAnswer);
        
        // User's answer
        const userAnswerDiv = document.createElement('div');
        
        if (hasMultipleAnswers) {
            // For multiple answer questions
            const selectedOptions = userAnswer.selectedOptions || [];
            const correctOptions = question.correctAnswer;
            
            // Check if all correct options are selected and no wrong options are selected
            const allCorrectSelected = correctOptions.every(option => 
                selectedOptions.includes(option));
            const noWrongSelected = selectedOptions.length === correctOptions.length;
            
            const isCorrect = allCorrectSelected && noWrongSelected;
            
            userAnswerDiv.className = isCorrect ? 'correct-answer p-2 mb-2 rounded' : 'wrong-answer p-2 mb-2 rounded';
            
            // Display selected options
            let userAnswerContent = '<strong>Your Answers:</strong><ul>';
            if (selectedOptions.length === 0) {
                userAnswerContent += '<li>Not answered</li>';
            } else {
                selectedOptions.forEach(option => {
                    userAnswerContent += `<li>${option}</li>`;
                });
            }
            userAnswerContent += '</ul>';
            userAnswerDiv.innerHTML = userAnswerContent;
            
            // Correct answer (if user was wrong)
            if (!isCorrect) {
                const correctAnswerDiv = document.createElement('div');
                correctAnswerDiv.className = 'correct-answer p-2 rounded';
                let correctAnswerContent = '<strong>Correct Answers:</strong><ul>';
                correctOptions.forEach(option => {
                    correctAnswerContent += `<li>${option}</li>`;
                });
                correctAnswerContent += '</ul>';
                correctAnswerDiv.innerHTML = correctAnswerContent;
                cardBody.appendChild(userAnswerDiv);
                cardBody.appendChild(correctAnswerDiv);
            } else {
                cardBody.appendChild(userAnswerDiv);
            }
        } else {
            // For single answer questions
            userAnswerDiv.className = userAnswer.selectedOption === question.correctAnswer ? 'correct-answer p-2 mb-2 rounded' : 'wrong-answer p-2 mb-2 rounded';
            userAnswerDiv.innerHTML = `<strong>Your Answer:</strong> ${userAnswer.selectedOption}`;
            
            // Correct answer (if user was wrong)
            if (userAnswer.selectedOption !== question.correctAnswer) {
                const correctAnswerDiv = document.createElement('div');
                correctAnswerDiv.className = 'correct-answer p-2 rounded';
                correctAnswerDiv.innerHTML = `<strong>Correct Answer:</strong> ${question.correctAnswer}`;
                cardBody.appendChild(userAnswerDiv);
                cardBody.appendChild(correctAnswerDiv);
            } else {
                cardBody.appendChild(userAnswerDiv);
            }
        }
        
        // Answer explanation
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'answer-explanation p-2 mt-2 rounded';
        explanationDiv.innerHTML = `<i class="bi bi-lightbulb-fill me-2"></i><strong>Explanation:</strong> ${question.AnswerExplanation}`;
        cardBody.appendChild(explanationDiv);
        
        resultCard.appendChild(cardHeader);
        resultCard.appendChild(cardBody);
        
        resultsBreakdown.appendChild(resultCard);
    });
}

// Function to trigger confetti animation
function triggerConfetti() {
    // Create multiple bursts across the screen for a celebratory effect
    for (let i = 0; i < CONFETTI_BURST_COUNT; i++) {
        setTimeout(() => {
            // Create random positions across the screen
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight / 2); // Keep in top half of screen
            confetti.burst(x, y);
        }, i * CONFETTI_BURST_INTERVAL);
    }
}

export {
    displayResults,
    triggerConfetti
};