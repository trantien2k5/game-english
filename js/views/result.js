import { state } from '../store.js';
import * as el from '../elements.js';
import { withErrorBoundary } from '../utils/error.js';

export const renderReview = withErrorBoundary(function renderReview() {
    el.reviewList.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    state.currentExam.questions.forEach((q, qIdx) => {
        const uAns = state.userAnswers[qIdx];
        const isCorrect = uAns === q.correctIndex;
        const isUnattempted = uAns === null;

        let badgeHtml = '';
        if (isCorrect) badgeHtml = `<span style="color:var(--success); font-weight:600;"><i class='bx bx-check'></i> Đúng</span>`;
        else if (isUnattempted) badgeHtml = `<span style="color:var(--gray-500); font-weight:600;"><i class='bx bx-minus'></i> Bỏ qua</span>`;
        else badgeHtml = `<span style="color:var(--danger); font-weight:600;"><i class='bx bx-x'></i> Sai</span>`;

        let html = `
            <div class="review-item">
                <div class="question-card glass-panel">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 15px;">
                        <div class="question-text" style="margin-bottom:0;">
                            <strong>Câu ${qIdx + 1}:</strong> ${q.q}
                        </div>
                        <div>${badgeHtml}</div>
                    </div>
                    <div class="options-list">
        `;

        q.options.forEach((optText, optIdx) => {
            let itemClass = '';
            if (optIdx === q.correctIndex) {
                itemClass = 'correct'; // Luôn sáng xanh đáp án đúng
            } else if (optIdx === uAns) {
                itemClass = 'wrong'; // Sáng đỏ đáp án bạn chọn sai
            }

            html += `
                <div class="option-item ${itemClass}" style="cursor:default;">
                    <div class="option-label">${labels[optIdx]}</div>
                    <div class="option-text">${optText}</div>
                </div>
            `;
        });

        if (q.explanation) {
            html += `
                <div class="explanation-box" style="margin-top: 15px; padding: 15px; background: var(--primary-light); border-radius: 8px; border-left: 4px solid var(--primary);">
                    <strong><i class='bx bx-bulb'></i> Giải thích:</strong><br>
                    ${q.explanation.replace(/\n/g, '<br>')}
                </div>
            `;
        }

        html += `
                    </div>
                </div>
            </div>
        `;

        el.reviewList.insertAdjacentHTML('beforeend', html);
    });
}, 'renderReview');
