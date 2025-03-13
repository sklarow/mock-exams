// config.js - Configuration and constants for the mock exam system

// Exam files available in the system
const EXAM_FILES = ['ctfl.json', 'ctfl-at.json'];

// Time constants
const PRINT_DIALOG_DELAY = 1000; // ms to wait for print dialog
const STYLE_APPLY_DELAY = 500; // ms to wait for styles to apply

// Confetti settings
const CONFETTI_BURST_COUNT = 20;
const CONFETTI_BURST_INTERVAL = 550; // ms between bursts

export {
    EXAM_FILES,
    PRINT_DIALOG_DELAY,
    STYLE_APPLY_DELAY,
    CONFETTI_BURST_COUNT,
    CONFETTI_BURST_INTERVAL
};