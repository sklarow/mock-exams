// pdfExport.js - Handles exporting exam results as PDF
import { PRINT_DIALOG_DELAY, STYLE_APPLY_DELAY } from './config.js';

// Function to save exam results as PDF
function saveAsPDF(currentExam, elementsToHide) {
    // Create a stylesheet for print media
    const printStyles = document.createElement('style');
    printStyles.id = 'print-styles';
    printStyles.innerHTML = `
        @media print {
            body {
                background-color: white !important;
            }
            .container {
                max-width: 100% !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            .card {
                border: none !important;
                box-shadow: none !important;
            }
            #restart-btn, #save-pdf-btn {
                display: none !important;
            }
            .card-header {
                background: linear-gradient(135deg, #4a6bff 0%, #2541b8 100%) !important;
                color: white !important;
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
            }
            .pass, .fail, .correct-answer, .wrong-answer, .answer-explanation {
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
            }
        }
    `;
    document.head.appendChild(printStyles);

    // Hide elements that shouldn't be in the PDF
    elementsToHide.forEach(el => {
        if (el) el.dataset.originalDisplay = el.style.display;
        if (el) el.style.display = 'none';
    });

    // Set the document title to include the exam name
    const originalTitle = document.title;
    if (currentExam) {
        document.title = `${currentExam.title} - Exam Results`;
    } else {
        document.title = 'Mock Exam Results';
    }

    // Print the page (which allows saving as PDF)
    setTimeout(() => {
        window.print();
        
        // Restore the page after printing
        setTimeout(() => {
            // Remove print styles
            const printStylesheet = document.getElementById('print-styles');
            if (printStylesheet) printStylesheet.remove();
            
            // Restore hidden elements
            elementsToHide.forEach(el => {
                if (el && el.dataset.originalDisplay !== undefined) {
                    el.style.display = el.dataset.originalDisplay;
                    delete el.dataset.originalDisplay;
                }
            });
            
            // Restore original title
            document.title = originalTitle;
        }, PRINT_DIALOG_DELAY); // Delay to ensure print dialog has opened
    }, STYLE_APPLY_DELAY); // Delay to ensure styles are applied
}

export { saveAsPDF };