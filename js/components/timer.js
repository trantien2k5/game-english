import { state } from '../store.js';
import * as el from '../elements.js';
import { withErrorBoundary } from '../utils/error.js';
import { submitQuiz } from '../views/quiz.js';

export const startTimer = withErrorBoundary(function startTimer() {
    clearInterval(state.timerInterval);
    updateTimerDisplay();

    const badge = document.querySelector('.timer-badge');

    state.timerInterval = setInterval(() => {
        state.timeRemaining--;
        if (state.timeRemaining <= 300) badge.classList.add('warning');
        else badge.classList.remove('warning');

        if (state.timeRemaining <= 0) {
            clearInterval(state.timerInterval);
            badge.classList.remove('warning');
            alert('Đã hết thời gian làm bài! Hệ thống tự động nộp bài.');
            submitQuiz();
        }
        updateTimerDisplay();
    }, 1000);
}, 'startTimer');

export const updateTimerDisplay = withErrorBoundary(function updateTimerDisplay() {
    const totalMinutes = Math.floor(state.timeRemaining / 60);
    const m = totalMinutes.toString().padStart(2, '0');
    const s = (state.timeRemaining % 60).toString().padStart(2, '0');
    el.quizTimer.textContent = `${m}:${s}`;
}, 'updateTimerDisplay');
