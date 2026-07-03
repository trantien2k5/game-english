// store.js - Quản lý Global State

export const state = {
    examsList: JSON.parse(localStorage.getItem('eduquiz_exams')) || [],
    currentExam: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    timerInterval: null,
    timeRemaining: 0,
    examToDeleteId: null,
    examToStartId: null,
    currentMode: 'exam',
    currentViewMode: 'single',
    previewQuestions: [],
    isEditingExam: false,
    detailExamQuestions: []
};

export function saveExamsList() {
    localStorage.setItem('eduquiz_exams', JSON.stringify(state.examsList));
}
