import { state } from '../store.js';
import * as el from '../elements.js';
import { withErrorBoundary } from '../utils/error.js';
import { showView } from '../components/router.js';
import { shuffleArray } from '../utils/helpers.js';
import { startTimer } from '../components/timer.js';
import { renderReview } from './result.js';

export const beginQuiz = withErrorBoundary(function beginQuiz() {
    const baseExam = state.examsList.find(e => e.id === state.examToStartId);
    if (!baseExam) return;

    state.currentMode = el.startMode.value;
    const isShuffle = el.startShuffle.checked;

    // Clone dữ liệu để không làm ảnh hưởng đến đề thi gốc
    state.currentExam = JSON.parse(JSON.stringify(baseExam));

    if (isShuffle) {
        // 1. Đảo danh sách câu hỏi
        shuffleArray(state.currentExam.questions);

        // 2. Đảo các lựa chọn A, B, C, D bên trong mỗi câu hỏi
        state.currentExam.questions.forEach(q => {
            const oldOptions = [...q.options];
            const correctText = oldOptions[q.correctIndex];

            shuffleArray(q.options);

            // Cập nhật lại correctIndex theo vị trí mới
            q.correctIndex = q.options.indexOf(correctText);
        });
    }

    state.currentQuestionIndex = 0;
    state.userAnswers = new Array(state.currentExam.questions.length).fill(null);
    state.currentViewMode = 'single'; // Mặc định luôn là single khi bắt đầu

    if (el.btnToggleViewMode) {
        el.btnToggleViewMode.innerHTML = "<i class='bx bx-list-ul'></i> Danh sách";
        if (state.currentMode === 'practice') {
            el.btnToggleViewMode.style.display = 'none';
        } else {
            el.btnToggleViewMode.style.display = 'inline-flex';
        }
    }

    applyViewModeUI();

    const badge = document.querySelector('.timer-badge');
    if (state.currentMode === 'exam') {
        state.timeRemaining = state.currentExam.duration * 60; // Đếm ngược
        badge.style.display = 'flex';
        startTimer();
    } else {
        state.timeRemaining = 0;
        badge.style.display = 'none'; // Ẩn hoàn toàn đếm giờ
        clearInterval(state.timerInterval); // Không chạy bộ đếm
    }

    el.totalQNum.textContent = state.currentExam.questions.length;

    renderPalette();
    renderQuestion();

    showView('quiz');
    document.body.classList.add('no-scroll');
}, 'beginQuiz');

export const applyViewModeUI = withErrorBoundary(function applyViewModeUI() {
    const quizBottomNav = document.getElementById('quiz-bottom-nav');
    const quizMainArea = document.getElementById('quiz-main-area');

    if (state.currentViewMode === 'list') {
        quizMainArea.classList.add('list-view-mode');
        document.getElementById('quiz-progress-top').style.display = 'none';
        el.btnPrevQ.style.display = 'none';
        el.btnNextQ.style.display = 'none';
    } else {
        quizMainArea.classList.remove('list-view-mode');
        document.getElementById('quiz-progress-top').style.display = 'block';
        el.btnPrevQ.style.display = 'flex';
        el.btnNextQ.style.display = 'flex';
    }
}, 'applyViewModeUI');

export const renderPalette = withErrorBoundary(function renderPalette() {
    el.questionPalette.innerHTML = '';
    state.currentExam.questions.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = `q-btn`;
        btn.textContent = i + 1;
        btn.onclick = () => {
            state.currentQuestionIndex = i;

            // Ẩn Palette Mobile sau khi bấm chọn
            el.quizSidebar.classList.remove('open');
            el.paletteOverlay.classList.add('hidden');

            if (state.currentViewMode === 'single') {
                renderQuestion();
            } else {
                updatePaletteStatus(); // List view
                // Cuộn tới câu hỏi đó
                const card = document.getElementById(`q-card-${i}`);
                if (card) {
                    const offset = 80; // Trừ hao header
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = card.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        };
        el.questionPalette.appendChild(btn);
    });
    updatePaletteStatus();
}, 'renderPalette');

export const updatePaletteStatus = withErrorBoundary(function updatePaletteStatus() {
    const btns = el.questionPalette.querySelectorAll('.q-btn');
    btns.forEach((btn, idx) => {
        btn.classList.remove('active', 'answered', 'correct-ans', 'wrong-ans');
        if (idx === state.currentQuestionIndex) btn.classList.add('active');

        if (state.userAnswers[idx] !== null) {
            if (state.currentMode === 'practice') {
                if (state.userAnswers[idx] === state.currentExam.questions[idx].correctIndex) {
                    btn.classList.add('correct-ans');
                } else {
                    btn.classList.add('wrong-ans');
                }
            } else {
                btn.classList.add('answered');
            }
        }
    });
}, 'updatePaletteStatus');

export const renderQuestion = withErrorBoundary(function renderQuestion() {
    el.questionsContainer.innerHTML = ''; // Clear container

    if (state.currentViewMode === 'single') {
        // Render 1 câu
        const card = createQuestionCardHTML(state.currentQuestionIndex, state.currentExam.questions[state.currentQuestionIndex]);
        el.questionsContainer.appendChild(card);

        el.currentQNum.textContent = state.currentQuestionIndex + 1;

        // Cập nhật text nút Nộp bài / Câu tiếp
        el.btnPrevQ.disabled = state.currentQuestionIndex === 0;
        if (state.currentQuestionIndex === state.currentExam.questions.length - 1) {
            el.btnNextQ.innerHTML = `<span class="nav-text">Nộp bài</span> <i class='bx bx-check'></i>`;
            el.btnNextQ.onclick = confirmSubmit;
        } else {
            el.btnNextQ.innerHTML = `<span class="nav-text">Câu tiếp</span> <i class='bx bx-chevron-right'></i>`;
            el.btnNextQ.onclick = () => navigateQuestion(1);
        }
    } else {
        // Render toàn bộ danh sách (List View)
        state.currentExam.questions.forEach((qData, idx) => {
            const card = createQuestionCardHTML(idx, qData);
            el.questionsContainer.appendChild(card);
        });
    }

    updatePaletteStatus();
}, 'renderQuestion');

export function createQuestionCardHTML(idx, qData) {
    const card = document.createElement('div');
    card.className = 'question-card glass-panel';
    card.id = `q-card-${idx}`;

    let html = `<div class="question-text"><strong>Câu ${idx + 1}:</strong> ${qData.q}</div>`;
    html += `<div class="options-list">`;

    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const isAnsweredPractice = (state.currentMode === 'practice' && state.userAnswers[idx] !== null);

    qData.options.forEach((optText, optIdx) => {
        let itemClass = '';
        if (isAnsweredPractice) {
            if (optIdx === qData.correctIndex) itemClass = 'correct';
            else if (optIdx === state.userAnswers[idx]) itemClass = 'wrong';
        } else {
            if (state.userAnswers[idx] === optIdx) itemClass = 'selected';
        }

        html += `
            <div class="option-item ${itemClass}" ${isAnsweredPractice ? 'style="cursor:default;"' : `onclick="selectOption(${idx}, ${optIdx})"`}>
                <div class="option-label">${labels[optIdx]}</div>
                <div class="option-text">${optText}</div>
            </div>
        `;
    });

    html += `</div>`;
    card.innerHTML = html;
    return card;
}

export const selectOption = withErrorBoundary(function selectOption(qIdx, optIdx) {
    if (state.currentMode === 'practice' && state.userAnswers[qIdx] !== null) {
        return; // Không cho phép đổi đáp án trong chế độ luyện tập
    }

    state.userAnswers[qIdx] = optIdx;

    renderQuestion();
}, 'selectOption');
window.selectOption = selectOption;

export const navigateQuestion = withErrorBoundary(function navigateQuestion(step) {
    const newIdx = state.currentQuestionIndex + step;
    if (newIdx >= 0 && newIdx < state.currentExam.questions.length) {
        state.currentQuestionIndex = newIdx;
        renderQuestion();
    }
}, 'navigateQuestion');

export const confirmSubmit = withErrorBoundary(function confirmSubmit() {
    const unanswered = state.userAnswers.filter(a => a === null).length;
    let msg = 'Bạn có chắc chắn muốn nộp bài?';
    if (unanswered > 0) {
        msg = `Bạn còn ${unanswered} câu chưa trả lời. ` + msg;
    }
    if (confirm(msg)) {
        submitQuiz();
    }
}, 'confirmSubmit');

export const submitQuiz = withErrorBoundary(function submitQuiz() {
    clearInterval(state.timerInterval);
    document.body.classList.remove('no-scroll');
    const badge = document.querySelector('.timer-badge');
    if (badge) badge.classList.remove('warning');

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    state.currentExam.questions.forEach((q, idx) => {
        if (state.userAnswers[idx] === null) {
            unattempted++;
        } else if (state.userAnswers[idx] === q.correctIndex) {
            correct++;
        } else {
            incorrect++;
        }
    });

    const total = state.currentExam.questions.length;
    const score = (correct / total) * 10;

    el.finalScoreEl.textContent = score.toFixed(1);
    el.statCorrect.textContent = correct;
    el.statIncorrect.textContent = incorrect;
    el.statUnattempted.textContent = unattempted;

    // LƯU LỊCH SỬ THI
    const baseExamIndex = state.examsList.findIndex(e => e.id === state.examToStartId);
    if (baseExamIndex > -1) {
        if (!state.examsList[baseExamIndex].history) {
            state.examsList[baseExamIndex].history = [];
        }
        const attempt = {
            id: 'attempt_' + Date.now(),
            date: new Date().toISOString(),
            mode: state.currentMode,
            score: score.toFixed(1),
            correct,
            incorrect,
            unattempted,
            timeTaken: (state.currentMode === 'exam') ? (state.currentExam.duration * 60 - state.timeRemaining) : state.timeRemaining,
            userAnswers: [...state.userAnswers],
            examData: JSON.parse(JSON.stringify(state.currentExam)) // Lưu lại bộ đề đã shuffle nếu có
        };
        state.examsList[baseExamIndex].history.push(attempt);
        localStorage.setItem('eduquiz_exams', JSON.stringify(state.examsList));
    }

    renderReview();
    showView('result');
}, 'submitQuiz');
