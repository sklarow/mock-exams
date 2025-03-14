// questionHandler.js - Handles question selection, display, and user answers

// Function to select random questions from the question pool
function selectRandomQuestions(questions, count) {
    const questionsCopy = [...questions];
    
    for (let i = questionsCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionsCopy[i], questionsCopy[j]] = [questionsCopy[j], questionsCopy[i]];
    }

    return questionsCopy.slice(0, count);
}

// Function to shuffle an array (used for randomizing answer options)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Function to display exam questions
function displayExam(examData, questions, elements, userAnswers) {
    const { examTitle, questionContainer } = elements;
    
    examTitle.textContent = examData.title;
    
    questionContainer.innerHTML = '';
    
    // Reset user answers
    Object.keys(userAnswers).forEach(key => delete userAnswers[key]);
    
    questions.forEach((question, index) => {
        const questionNumber = index + 1;
        const questionId = `question-${index}`;
        
        // Create question card
        const questionCard = document.createElement('div');
        questionCard.className = 'card question-card p-3 mb-4';
        
        // Create question header
        const questionHeader = document.createElement('h5');
        questionHeader.className = 'card-title';
        
        // Handle question content based on type
        if (question.questionType === 'html') {
            // For HTML questions, use innerHTML to render HTML content
            questionHeader.innerHTML = `Question ${questionNumber}: ${question.questionContent}`;
        } else {
            // For plain text questions, use textContent
            questionHeader.textContent = `Question ${questionNumber}: ${question.questionContent}`;
        }
        
        // Create options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'mt-3';
        
        // Check if question has multiple correct answers
        const hasMultipleAnswers = Array.isArray(question.correctAnswer);
        
        // Add info box for multiple answer questions
        if (hasMultipleAnswers) {
            const infoBox = document.createElement('div');
            infoBox.className = 'alert alert-info';
            infoBox.innerHTML = `<i class="bi bi-info-circle-fill me-2"></i>This question requires selecting <strong>${question.correctAnswer.length}</strong> correct options.`;
            questionCard.appendChild(infoBox);
        }
        
        // Combine correct and wrong options
        let allOptions = [];
        if (hasMultipleAnswers) {
            allOptions = [...question.correctAnswer, ...question.wrongOptions];
        } else {
            allOptions = [question.correctAnswer, ...question.wrongOptions];
        }
        
        // Shuffle options
        const shuffledOptions = shuffleArray(allOptions);
        
        // Initialize user answer for this question if it's a multiple answer question
        if (hasMultipleAnswers) {
            userAnswers[questionId] = {
                selectedOptions: [],
                correctOptions: question.correctAnswer
            };
        }
        
        // Create input elements for each option
        shuffledOptions.forEach((option, optionIndex) => {
            const optionId = `${questionId}-option-${optionIndex}`;
            
            // Create option container
            const optionDiv = document.createElement('div');
            optionDiv.className = 'mb-2';
            
            // Create input (radio for single answer, checkbox for multiple answers)
            const input = document.createElement('input');
            input.type = hasMultipleAnswers ? 'checkbox' : 'radio';
            input.className = 'option-input';
            input.name = questionId;
            input.id = optionId;
            input.value = option;
            
            // Add event listener based on question type
            if (hasMultipleAnswers) {
                input.addEventListener('change', () => {
                    if (input.checked) {
                        userAnswers[questionId].selectedOptions.push(option);
                    } else {
                        const index = userAnswers[questionId].selectedOptions.indexOf(option);
                        if (index > -1) {
                            userAnswers[questionId].selectedOptions.splice(index, 1);
                        }
                    }
                });
            } else {
                input.addEventListener('change', () => {
                    userAnswers[questionId] = {
                        selectedOption: option,
                        correctOption: question.correctAnswer
                    };
                });
            }
            
            // Create label
            const label = document.createElement('label');
            label.className = 'option-label';
            label.htmlFor = optionId;
            
            // Handle option content based on if it contains HTML
            if (option.includes('<') && option.includes('>')) {
                // If option contains HTML tags, use innerHTML
                label.innerHTML = option;
            } else {
                // Otherwise use textContent for plain text
                label.textContent = option;
            }
            
            // Append elements
            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            optionsContainer.appendChild(optionDiv);
        });
        
        // Append elements to question card
        questionCard.appendChild(questionHeader);
        questionCard.appendChild(optionsContainer);
        
        // Append question card to container
        questionContainer.appendChild(questionCard);
    });
}

// Function to calculate the exam score
function calculateScore(userAnswers, selectedQuestions, passingScore) {
    let correctAnswers = 0;
    
    // Count correct answers
    Object.entries(userAnswers).forEach(([questionId, answer]) => {
        const questionIndex = parseInt(questionId.split('-')[1]);
        const question = selectedQuestions[questionIndex];
        
        if (Array.isArray(question.correctAnswer)) {
            // For multiple answer questions
            const selectedOptions = answer.selectedOptions || [];
            const correctOptions = question.correctAnswer;
            
            // Check if all correct options are selected and no wrong options are selected
            const allCorrectSelected = correctOptions.every(option => 
                selectedOptions.includes(option));
            const noWrongSelected = selectedOptions.length === correctOptions.length;
            
            if (allCorrectSelected && noWrongSelected) {
                correctAnswers++;
            }
        } else {
            // For single answer questions
            if (answer.selectedOption === answer.correctOption) {
                correctAnswers++;
            }
        }
    });
    
    // Calculate percentage
    const totalQuestions = selectedQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    return {
        correctAnswers,
        totalQuestions,
        percentage,
        isPassing: percentage >= (passingScore * 100)
    };
}

export {
    selectRandomQuestions,
    shuffleArray,
    displayExam,
    calculateScore
};