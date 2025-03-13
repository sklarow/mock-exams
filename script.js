document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const examSelect = document.getElementById('exam-select');
    const startBtn = document.getElementById('start-btn');
    const examContainer = document.getElementById('exam-container');
    const examSelection = document.getElementById('exam-selection');
    const examTitle = document.getElementById('exam-title');
    const questionContainer = document.getElementById('question-container');
    const submitBtn = document.getElementById('submit-btn');
    const resultsContainer = document.getElementById('results-container');
    const scoreDisplay = document.getElementById('score');
    const passFail = document.getElementById('pass-fail');
    const resultsBreakdown = document.getElementById('results-breakdown');
    const restartBtn = document.getElementById('restart-btn');
    const timerDisplay = document.getElementById('timer');

    // Variables
    let currentExam = null;
    let selectedQuestions = [];
    let timerInterval = null;
    let timeRemaining = 0;
    let userAnswers = {};

    init();

    function init() {
        loadExamList();
        
        // Event listeners
        startBtn.addEventListener('click', startExam);
        submitBtn.addEventListener('click', submitExam);
        restartBtn.addEventListener('click', restartExam);
    }

    function loadExamList() {
        // Define exam files here - add new JSON files to this array
        const examFiles = ['ctfl.json', 'ctfl-at.json'];
        
        // Clear existing options
        examSelect.innerHTML = '';
        
        // Track loaded exams for setting initial selection
        let loadedExams = 0;
        const totalExams = examFiles.length;
        
        // Add options for each exam file
        examFiles.forEach(file => {
            // Fetch the exam file to get its title
            fetch(`exams/${file}`)
                .then(response => response.json())
                .then(examData => {
                    const option = document.createElement('option');
                    option.value = file;
                    // Use the title from the JSON file instead of the filename
                    option.textContent = examData.title;
                    examSelect.appendChild(option);
                    
                    loadedExams++;
                    
                    // When all exams are loaded, set up the first exam's disclaimer
                    if (loadedExams === 1) {
                        // Load the first exam's disclaimer
                        loadExamDisclaimer(file);
                    }
                })
                .catch(error => {
                    console.error(`Error loading exam ${file}:`, error);
                    // Still create an option but use the filename as fallback
                    const option = document.createElement('option');
                    option.value = file;
                    option.textContent = file.replace('.json', '').toUpperCase() + ' (Error loading title)';
                    examSelect.appendChild(option);
                    
                    loadedExams++;
                    
                    // When all exams are loaded, set up the first exam's disclaimer
                    if (loadedExams === 1) {
                        // Load the first exam's disclaimer
                        loadExamDisclaimer(file);
                    }
                });
        });
        
        // Add event listener for exam selection change
        examSelect.addEventListener('change', function() {
            loadExamDisclaimer(this.value);
        });
    }
    
    function loadExamDisclaimer(examFile) {
        const disclaimerElement = document.getElementById('legal-disclaimer');
        const examInfoElement = document.getElementById('exam-info');
        const examInfoTitle = document.getElementById('exam-info-title');
        const examInfoDescription = document.getElementById('exam-info-description');
        const examInfoPassingScore = document.getElementById('exam-info-passing-score');
        const examInfoTimeLimit = document.getElementById('exam-info-time-limit');
        const examInfoNumQuestions = document.getElementById('exam-info-num-questions');
        
        fetch(`exams/${examFile}`)
            .then(response => response.json())
            .then(examData => {
                // Display legal disclaimer
                if (examData.legalDisclaimer) {
                    disclaimerElement.textContent = examData.legalDisclaimer;
                    disclaimerElement.style.display = 'block';
                } else {
                    disclaimerElement.style.display = 'none';
                }
                
                // Display exam information
                examInfoTitle.textContent = examData.title;
                examInfoDescription.textContent = examData.description;
                examInfoPassingScore.textContent = `${examData.passingScore * 100}%`;
                examInfoTimeLimit.textContent = `${examData.timeLimit} minutes`;
                examInfoNumQuestions.textContent = examData.numberOfQuestions;
                examInfoElement.style.display = 'block';
            })
            .catch(error => {
                console.error('Error loading exam data:', error);
                disclaimerElement.style.display = 'none';
                examInfoElement.style.display = 'none';
            });
    }

    function startExam() {
        const selectedExam = examSelect.value;
        if (!selectedExam) return;

        // Load the selected exam
        fetch(`exams/${selectedExam}`)
            .then(response => response.json())
            .then(examData => {
                currentExam = examData;
                
                selectedQuestions = selectRandomQuestions(examData.questions, examData.numberOfQuestions);

                displayExam(examData, selectedQuestions);
                
                startTimer(examData.timeLimit);
                
                // Show exam container, hide selection
                examSelection.classList.add('d-none');
                examContainer.classList.remove('d-none');
            })
            .catch(error => {
                console.error('Error loading exam:', error);
                alert('Failed to load the exam. Please try again.');
            });
    }

    function selectRandomQuestions(questions, count) {
        const questionsCopy = [...questions];
        
        for (let i = questionsCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questionsCopy[i], questionsCopy[j]] = [questionsCopy[j], questionsCopy[i]];
        }

        return questionsCopy.slice(0, count);
    }

    function displayExam(examData, questions) {
        examTitle.textContent = examData.title;
        
        questionContainer.innerHTML = '';

        userAnswers = {};
        
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
            
            // Combine correct and wrong options
            const allOptions = [question.correctAnswer, ...question.wrongOptions];
            
            // Shuffle options
            const shuffledOptions = shuffleArray(allOptions);
            
            // Create radio buttons for each option
            shuffledOptions.forEach((option, optionIndex) => {
                const optionId = `${questionId}-option-${optionIndex}`;
                
                // Create option container
                const optionDiv = document.createElement('div');
                optionDiv.className = 'mb-2';
                
                // Create radio input
                const input = document.createElement('input');
                input.type = 'radio';
                input.className = 'option-input';
                input.name = questionId;
                input.id = optionId;
                input.value = option;
                input.addEventListener('change', () => {
                    userAnswers[questionId] = {
                        selectedOption: option,
                        correctOption: question.correctAnswer
                    };
                });
                
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

    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function startTimer(minutes) {
        // Clear any existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Convert minutes to seconds
        timeRemaining = minutes * 60;
        
        // Update timer display
        updateTimerDisplay();
        
        // Start interval
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            
            // Check if time is up
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                submitExam();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color when time is running low (less than 1 minute)
        if (timeRemaining < 60) {
            timerDisplay.classList.add('bg-danger');
            timerDisplay.classList.add('text-white');
            timerDisplay.classList.remove('bg-light');
            timerDisplay.classList.remove('text-dark');
        }
    }

    function submitExam() {
        // Stop the timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Scroll to top of the page
        window.scrollTo(0, 0);
        
        // Calculate score
        const score = calculateScore();
        
        // Display results
        displayResults(score);
        
        // Hide exam container, show results
        examContainer.classList.add('d-none');
        resultsContainer.classList.remove('d-none');
    }

    function calculateScore() {
        let correctAnswers = 0;
        
        // Count correct answers
        Object.values(userAnswers).forEach(answer => {
            if (answer.selectedOption === answer.correctOption) {
                correctAnswers++;
            }
        });
        
        // Calculate percentage
        const totalQuestions = selectedQuestions.length;
        const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        return {
            correctAnswers,
            totalQuestions,
            percentage,
            isPassing: percentage >= (currentExam.passingScore * 100)
        };
    }

    function displayResults(score) {
        // Display score
        scoreDisplay.textContent = score.percentage;
        
        // Display pass/fail message
        passFail.textContent = score.isPassing ? 'PASSED' : 'FAILED';
        passFail.className = score.isPassing ? 'pass p-2 rounded' : 'fail p-2 rounded';
        
        // Trigger confetti if user passed
        if (score.isPassing && window.confetti) {
            // Create multiple bursts across the screen for a celebratory effect
            const burstCount = 10;
            const burstInterval = 450; // milliseconds between bursts
            
            for (let i = 0; i < burstCount; i++) {
                setTimeout(() => {
                    // Create random positions across the screen
                    const x = Math.random() * window.innerWidth;
                    const y = Math.random() * (window.innerHeight / 2); // Keep in top half of screen
                    window.confetti.burst(x, y);
                }, i * burstInterval);
            }
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
            
            // User's answer
            const userAnswerDiv = document.createElement('div');
            userAnswerDiv.className = userAnswer.selectedOption === question.correctAnswer ? 'correct-answer p-2 mb-2 rounded' : 'wrong-answer p-2 mb-2 rounded';
            userAnswerDiv.innerHTML = `<strong>Your Answer:</strong> ${userAnswer.selectedOption}`;
            
            // Correct answer (if user was wrong)
            let correctAnswerDiv = null;
            if (userAnswer.selectedOption !== question.correctAnswer) {
                correctAnswerDiv = document.createElement('div');
                correctAnswerDiv.className = 'correct-answer p-2 rounded';
                correctAnswerDiv.innerHTML = `<strong>Correct Answer:</strong> ${question.correctAnswer}`;
            }
            
            // Answer explanation
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'answer-explanation p-2 mt-2 rounded';
            explanationDiv.innerHTML = `<i class="bi bi-lightbulb-fill me-2"></i><strong>Explanation:</strong> ${question.AnswerExplanation}`;
            
            // Append elements
            cardBody.appendChild(questionText);
            cardBody.appendChild(userAnswerDiv);
            if (correctAnswerDiv) cardBody.appendChild(correctAnswerDiv);
            cardBody.appendChild(explanationDiv);
            
            resultCard.appendChild(cardHeader);
            resultCard.appendChild(cardBody);
            
            resultsBreakdown.appendChild(resultCard);
        });
    }

    function restartExam() {

        currentExam = null;
        selectedQuestions = [];
        userAnswers = {};
        
        resultsContainer.classList.add('d-none');
        examSelection.classList.remove('d-none');
        
        timerDisplay.classList.remove('bg-danger');
        timerDisplay.classList.remove('text-white');
        timerDisplay.classList.add('bg-light');
        timerDisplay.classList.add('text-dark');
        timerDisplay.textContent = 'Time: 00:00';
    }
});