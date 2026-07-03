import { state } from '../store.js';
import * as el from '../elements.js';
import { withErrorBoundary } from '../utils/error.js';
import { showView } from '../components/router.js';
import { renderHome } from './home.js';
import { renderReview } from './result.js';

export const openDetailView = withErrorBoundary(function openDetailView(id) {
    state.examToStartId = id;
    const exam = state.examsList.find(e => e.id === id);
    if (exam) {
        el.detailExamTitle.textContent = exam.title;
        el.detailExamDuration.textContent = exam.duration;
        el.detailExamCount.textContent = exam.questions.length;
        el.detailPreviewCount.textContent = exam.questions.length;

        // Reset tabs
        el.tabBtns.forEach(b => b.classList.remove('active'));
        el.tabBtns[0].classList.add('active');
        el.tabContent.classList.add('active');
        el.tabContent.classList.remove('hidden');
        el.tabHistory.classList.remove('active');
        el.tabHistory.classList.add('hidden');

        // Reset mobile tabs
        el.mobileTabBtns.forEach(b => b.classList.remove('active'));
        el.mobileTabBtns[0].classList.add('active');
        el.detailConfig.classList.remove('mobile-hidden');
        el.detailPreview.classList.add('mobile-hidden');

        state.isEditingExam = false;
        state.detailExamQuestions = JSON.parse(JSON.stringify(exam.questions));
        renderDetailQuestions();

        showView('detail');
    }
}, 'openDetailView');

export const renderDetailQuestions = withErrorBoundary(function renderDetailQuestions() {
    el.detailQuestionList.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    if (state.isEditingExam) {
        el.btnToggleEditExam.innerHTML = `<i class='bx bx-x'></i> Hủy sửa`;
        el.detailEditActions.classList.remove('hidden');

        state.detailExamQuestions.forEach((q, qIdx) => {
            const item = document.createElement('div');
            item.className = 'preview-item';

            let html = `
                <div class="preview-item-header">
                    <span>Câu ${qIdx + 1}</span>
                </div>
                <textarea class="edit-q" rows="2" onchange="updateDetailQ(${qIdx}, 'q', this.value)">${q.q}</textarea>
            `;

            q.options.forEach((opt, optIdx) => {
                html += `
                    <div class="edit-opt">
                        <span class="opt-label">${labels[optIdx]}.</span>
                        <input type="text" value="${opt}" onchange="updateDetailQ(${qIdx}, 'opt', this.value, ${optIdx})">
                    </div>
                `;
            });

            html += `
                <div class="edit-ans">
                    <label>Đáp án đúng:</label>
                    <select onchange="updateDetailQ(${qIdx}, 'ans', this.value)">
            `;

            q.options.forEach((_, optIdx) => {
                const isSelected = q.correctIndex === optIdx ? 'selected' : '';
                html += `<option value="${optIdx}" ${isSelected}>${labels[optIdx]}</option>`;
            });

            html += `
                    </select>
                </div>
                <div style="margin-top: 12px;">
                    <textarea class="edit-q" rows="2" placeholder="Giải thích đáp án (không bắt buộc)..." onchange="updateDetailQ(${qIdx}, 'exp', this.value)" style="margin-bottom:0;">${q.explanation || ''}</textarea>
                </div>
            `;

            item.innerHTML = html;
            el.detailQuestionList.appendChild(item);
        });
    } else {
        el.btnToggleEditExam.innerHTML = `<i class='bx bx-pencil'></i> Chỉnh sửa`;
        el.detailEditActions.classList.add('hidden');

        state.detailExamQuestions.forEach((q, qIdx) => {
            const item = document.createElement('div');
            item.className = 'readonly-q-item';

            let html = `<div class="readonly-q-header">Câu ${qIdx + 1}: ${q.q}</div>`;

            q.options.forEach((opt, optIdx) => {
                const correctClass = q.correctIndex === optIdx ? 'correct' : '';
                const correctIcon = q.correctIndex === optIdx ? `<i class='bx bx-check'></i> ` : '';
                html += `<div class="readonly-opt ${correctClass}"><strong>${labels[optIdx]}.</strong> ${correctIcon}${opt}</div>`;
            });

            if (q.explanation) {
                html += `<div class="readonly-exp"><strong><i class='bx bx-bulb'></i> Giải thích:</strong><br>${q.explanation.replace(/\\n/g, '<br>')}</div>`;
            }

            item.innerHTML = html;
            el.detailQuestionList.appendChild(item);
        });
    }
}, 'renderDetailQuestions');

export const toggleEditExam = withErrorBoundary(function toggleEditExam() {
    state.isEditingExam = !state.isEditingExam;
    if (!state.isEditingExam) {
        // Nếu hủy sửa thì revert lại data gốc
        const exam = state.examsList.find(e => e.id === state.examToStartId);
        state.detailExamQuestions = JSON.parse(JSON.stringify(exam.questions));
    }
    renderDetailQuestions();
}, 'toggleEditExam');

export const saveDetailExam = withErrorBoundary(function saveDetailExam() {
    const examIndex = state.examsList.findIndex(e => e.id === state.examToStartId);
    if (examIndex > -1) {
        state.examsList[examIndex].questions = JSON.parse(JSON.stringify(state.detailExamQuestions));
        localStorage.setItem('eduquiz_exams', JSON.stringify(state.examsList));
        alert('Đã lưu thay đổi đề thi!');
        state.isEditingExam = false;
        renderDetailQuestions();
        renderHome(); // Cập nhật lại list ở home nếu cần
    }
}, 'saveDetailExam');

export const renderHistoryTab = withErrorBoundary(function renderHistoryTab() {
    const exam = state.examsList.find(e => e.id === state.examToStartId);
    el.historyContainer.innerHTML = '';

    if (!exam || !exam.history || exam.history.length === 0) {
        el.historyContainer.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-ghost'></i>
                <p>Bạn chưa làm bài thi này lần nào.</p>
            </div>
        `;
        return;
    }

    // Thống kê nhanh
    const totalPlays = exam.history.length;
    const highestScore = Math.max(...exam.history.map(h => parseFloat(h.score)));
    const avgScore = exam.history.reduce((sum, h) => sum + parseFloat(h.score), 0) / totalPlays;

    let html = `
        <div class="history-dashboard">
            <div class="history-stat-card">
                <h4>Số lần làm</h4>
                <div class="val">${totalPlays}</div>
            </div>
            <div class="history-stat-card">
                <h4>Điểm cao nhất</h4>
                <div class="val">${highestScore.toFixed(1)}</div>
            </div>
            <div class="history-stat-card">
                <h4>Điểm trung bình</h4>
                <div class="val">${avgScore.toFixed(1)}</div>
            </div>
        </div>

        <h3 style="margin-bottom: 15px; font-size: 1.1rem;">Lịch sử làm bài</h3>
        <div class="history-table-wrapper">
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Thời gian</th>
                        <th>Chế độ</th>
                        <th>Điểm số</th>
                        <th>T/g làm bài</th>
                        <th>Chi tiết</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Sắp xếp mới nhất lên đầu
    const sortedHistory = [...exam.history].reverse();

    sortedHistory.forEach(att => {
        const dateObj = new Date(att.date);
        const dateStr = dateObj.toLocaleString('vi-VN');
        const modeBadge = att.mode === 'exam' ? `<span class="badge exam">Thi thật</span>` : `<span class="badge practice">Luyện tập</span>`;

        const mins = Math.floor(att.timeTaken / 60);
        const secs = att.timeTaken % 60;
        const timeStr = `${mins}p ${secs}s`;

        html += `
            <tr>
                <td>${dateStr}</td>
                <td>${modeBadge}</td>
                <td style="font-weight: 600; color: var(--primary);">${att.score}</td>
                <td>${timeStr}</td>
                <td>
                    <button class="btn-ghost" style="padding: 4px 8px; font-size: 0.8rem;" onclick="reviewHistoryAttempt('${att.id}')">Xem lại</button>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    el.historyContainer.innerHTML = html;
}, 'renderHistoryTab');

window.updateDetailQ = function(qIdx, field, value, optIdx = null) {
    if (field === 'q') {
        state.detailExamQuestions[qIdx].q = value;
    } else if (field === 'opt') {
        state.detailExamQuestions[qIdx].options[optIdx] = value;
    } else if (field === 'ans') {
        state.detailExamQuestions[qIdx].correctIndex = parseInt(value);
    } else if (field === 'exp') {
        state.detailExamQuestions[qIdx].explanation = value;
    }
};

window.reviewHistoryAttempt = function(attemptId) {
    const exam = state.examsList.find(e => e.id === state.examToStartId);
    if (!exam || !exam.history) return;

    const attempt = exam.history.find(h => h.id === attemptId);
    if (!attempt) return;

    // Nạp lại dữ liệu của lần thi đó
    state.currentExam = attempt.examData;
    state.userAnswers = attempt.userAnswers;

    // Cập nhật lại UI Result View
    el.finalScoreEl.textContent = attempt.score;
    el.statCorrect.textContent = attempt.correct;
    el.statIncorrect.textContent = attempt.incorrect;
    el.statUnattempted.textContent = attempt.unattempted;

    renderReview();
    showView('result');
};
