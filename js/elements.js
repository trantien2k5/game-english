// --- DOM ELEMENTS ---
// Views
export const views = {
    home: document.getElementById('home-view'),
    import: document.getElementById('import-view'),
    detail: document.getElementById('detail-view'),
    quiz: document.getElementById('quiz-view'),
    result: document.getElementById('result-view')
};

// Home Elements
export const examListEl = document.getElementById('exam-list');
export const btnShowImport = document.getElementById('btn-show-import');

// Import Elements
export const btnBackHome = document.getElementById('btn-back-home');
export const btnSaveExam = document.getElementById('btn-save-exam');
export const btnParseText = document.getElementById('btn-parse-text');
export const previewList = document.getElementById('preview-list');
export const previewCount = document.getElementById('preview-count');
export const examTitleIn = document.getElementById('exam-title');
export const examDurationIn = document.getElementById('exam-duration');
export const examContentIn = document.getElementById('exam-content');

// Quiz Elements
export const quizTimer = document.getElementById('quiz-timer');
export const currentQNum = document.getElementById('current-q-num');
export const totalQNum = document.getElementById('total-q-num');
export const btnQuitQuiz = document.getElementById('btn-quit-quiz');
export const questionsContainer = document.getElementById('questions-container');
export const questionPalette = document.getElementById('question-palette');
export const btnPrevQ = document.getElementById('btn-prev-q');
export const btnNextQ = document.getElementById('btn-next-q');
export const btnSubmitQuiz = document.getElementById('btn-submit-quiz');
export const btnOpenPalette = document.getElementById('btn-open-palette');
export const btnCloseSidebar = document.getElementById('btn-close-sidebar');
export const quizSidebar = document.getElementById('quiz-sidebar');
export const paletteOverlay = document.getElementById('palette-overlay');
export const btnToggleViewMode = document.getElementById('btn-toggle-view-mode');
export const btnThemeToggle = document.getElementById('btn-theme-toggle');
// Result Elements
export const finalScoreEl = document.getElementById('final-score');
export const statCorrect = document.getElementById('stat-correct');
export const statIncorrect = document.getElementById('stat-incorrect');
export const statUnattempted = document.getElementById('stat-unattempted');
export const reviewList = document.getElementById('review-list');
export const btnBackHomeFromResult = document.getElementById('btn-back-home-from-result');

// Modal Elements
export const overlay = document.getElementById('overlay');
export const deleteModal = document.getElementById('delete-modal');
export const btnCancelDelete = document.getElementById('btn-cancel-delete');
export const btnConfirmDelete = document.getElementById('btn-confirm-delete');

// Detail View Elements
export const btnBackHomeFromDetail = document.getElementById('btn-back-home-from-detail');
export const detailExamTitle = document.getElementById('detail-exam-title');
export const detailExamDuration = document.getElementById('detail-exam-duration');
export const detailExamCount = document.getElementById('detail-exam-count');
export const startMode = document.getElementById('start-mode');
export const startShuffle = document.getElementById('start-shuffle');
export const btnConfirmStart = document.getElementById('btn-confirm-start');
export const detailPreviewCount = document.getElementById('detail-preview-count');
export const detailQuestionList = document.getElementById('detail-question-list');
export const btnToggleEditExam = document.getElementById('btn-toggle-edit-exam');
export const btnSaveEditExam = document.getElementById('btn-save-edit-exam');
export const detailEditActions = document.getElementById('detail-edit-actions');

// Detail Tabs Elements
export const tabBtns = document.querySelectorAll('.detail-tab-btn');
export const tabContent = document.getElementById('tab-content');
export const tabHistory = document.getElementById('tab-history');
export const historyContainer = document.getElementById('history-container');

// Mobile Tabs Elements
export const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
export const detailConfig = document.querySelector('.detail-config');
export const detailPreview = document.querySelector('.detail-preview');

