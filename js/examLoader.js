// examLoader.js - Handles loading exam data and displaying exam information
import { EXAM_FILES } from './config.js';

// Function to load the list of available exams
function loadExamList(examSelect, loadExamDisclaimer) {
    // Clear existing options
    examSelect.innerHTML = '';
    
    // Track loaded exams for setting initial selection
    let loadedExams = 0;
    
    // Add options for each exam file
    EXAM_FILES.forEach(file => {
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
}

// Function to load and display exam disclaimer and information
function loadExamDisclaimer(examFile, elements) {
    const { 
        disclaimerElement, 
        examInfoElement, 
        examInfoTitle, 
        examInfoDescription, 
        examInfoPassingScore, 
        examInfoTimeLimit, 
        examInfoNumQuestions,
        examInfoTotalQuestions 
    } = elements;
    
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
            
            // Count and display total available questions in the pool
            const totalAvailableQuestions = examData.questions ? examData.questions.length : 0;
            examInfoTotalQuestions.textContent = totalAvailableQuestions;
            
            examInfoElement.style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading exam data:', error);
            disclaimerElement.style.display = 'none';
            examInfoElement.style.display = 'none';
        });
}

// Function to load a specific exam and start the test
function loadExam(examFile) {
    return new Promise((resolve, reject) => {
        fetch(`exams/${examFile}`)
            .then(response => response.json())
            .then(examData => {
                resolve(examData);
            })
            .catch(error => {
                console.error('Error loading exam:', error);
                reject(error);
            });
    });
}

export {
    loadExamList,
    loadExamDisclaimer,
    loadExam
};