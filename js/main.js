// main.js - Main entry point for the mock exam system
import { loadExamList, loadExamDisclaimer, loadExam } from './examLoader.js';
import { selectRandomQuestions, displayExam, calculateScore } from './questionHandler.js';
import { startTimer, stopTimer, resetTimerDisplay } from './timerHandler.js';
import { displayResults } from './resultsHandler.js';
import { saveAsPDF } from './pdfExport.js';

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
    const savePdfBtn = document.getElementById('save-pdf-btn');
    const disclaimerElement = document.getElementById('legal-disclaimer');
    const examInfoElement = document.getElementById('exam-info');
    const examInfoTitle = document.getElementById('exam-info-title');
    const examInfoDescription = document.getElementById('exam-info-description');
    const examInfoPassingScore = document.getElementById('exam-info-passing-score');
    const examInfoTimeLimit = document.getElementById('exam-info-time-limit');
    const examInfoNumQuestions = document.getElementById('exam-info-num-questions');
    const examInfoTotalQuestions = document.getElementById('exam-info-total-questions');

    // Group elements for easier passing to functions
    const examInfoElements = {
        disclaimerElement,
        examInfoElement,
        examInfoTitle,
        examInfoDescription,
        examInfoPassingScore,
        examInfoTimeLimit,
        examInfoNumQuestions,
        examInfoTotalQuestions
    };

    const examDisplayElements = {
        examTitle,
        questionContainer
    };

    const resultElements = {
        scoreDisplay,
        passFail,
        resultsBreakdown,
        rawScore: document.getElementById('raw-score'),
        totalQuestions: document.getElementById('total-questions')
    };

    // Variables
    let currentExam = null;
    let selectedQuestions = [];
    let timerInterval = null;
    let userAnswers = {};

    init();

    function init() {
        // Load the list of available exams
        loadExamList(examSelect, (examFile) => loadExamDisclaimer(examFile, examInfoElements));
        
        // Event listeners
        startBtn.addEventListener('click', startExam);
        submitBtn.addEventListener('click', submitExam);
        restartBtn.addEventListener('click', restartExam);
        savePdfBtn.addEventListener('click', () => {
            const elementsToHide = [examSelection, examContainer];
            saveAsPDF(currentExam, elementsToHide);
        });
        
        // Add event listener for exam selection change
        examSelect.addEventListener('change', function() {
            loadExamDisclaimer(this.value, examInfoElements);
        });
    }

    function startExam() {
        const selectedExam = examSelect.value;
        if (!selectedExam) return;

        // Load the selected exam
        loadExam(selectedExam)
            .then(examData => {
                currentExam = examData;
                
                selectedQuestions = selectRandomQuestions(examData.questions, examData.numberOfQuestions);

                displayExam(examData, selectedQuestions, examDisplayElements, userAnswers);
                
                timerInterval = startTimer(examData.timeLimit, timerDisplay, submitExam);
                
                // Show exam container, hide selection
                examSelection.classList.add('d-none');
                examContainer.classList.remove('d-none');
            })
            .catch(error => {
                console.error('Error loading exam:', error);
                alert('Failed to load the exam. Please try again.');
            });
    }

    function submitExam() {
        // Stop the timer
        stopTimer(timerInterval);
        
        // Scroll to top of the page
        window.scrollTo(0, 0);
        
        // Calculate score
        const score = calculateScore(userAnswers, selectedQuestions, currentExam.passingScore);
        
        // Display results
        displayResults(score, resultElements, selectedQuestions, userAnswers);
        
        // Hide exam container, show results
        examContainer.classList.add('d-none');
        resultsContainer.classList.remove('d-none');
    }

    function restartExam() {
        currentExam = null;
        selectedQuestions = [];
        userAnswers = {};
        resetTimerDisplay(timerDisplay);
        
        resultsContainer.classList.add('d-none');
        examSelection.classList.remove('d-none');
    }
});