import { state } from '../store.js';
import * as el from '../elements.js';
import { withErrorBoundary } from '../utils/error.js';
import { showView } from '../components/router.js';
import { parseTextToJSON } from '../utils/helpers.js';
import { renderHome } from './home.js';

export const parseTextAndShowPreview = withErrorBoundary(function parseTextAndShowPreview() {
    const content = el.examContentIn.value.trim();
    if (!content) {
        alert('Vui lòng nhập nội dung đề thi!');
        return;
    }

    const parsed = parseTextToJSON(content);
    if (parsed.length === 0) {
        alert('Không tìm thấy câu hỏi nào hợp lệ. Vui lòng kiểm tra lại định dạng!');
        return;
    }

    state.previewQuestions = parsed;
    el.previewCount.textContent = state.previewQuestions.length;
    renderPreviewList();

    // Xoá nội dung thô bên trái sau khi đã phân tích thành công sang bên phải
    el.examContentIn.value = '';
}, 'parseTextAndShowPreview');

export const renderPreviewList = withErrorBoundary(function renderPreviewList() {
    el.previewList.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    state.previewQuestions.forEach((q, qIdx) => {
        const item = document.createElement('div');
        item.className = 'preview-item';

        let html = `
            <div class="preview-item-header">
                <span>Câu ${qIdx + 1}</span>
                <button class="btn-ghost btn-remove-q" onclick="removePreviewQuestion(${qIdx})"><i class='bx bx-trash'></i> Xóa</button>
            </div>
            <textarea class="edit-q" rows="2" onchange="updatePreviewQ(${qIdx}, 'q', this.value)">${q.q}</textarea>
        `;

        q.options.forEach((opt, optIdx) => {
            html += `
                <div class="edit-opt">
                    <span class="opt-label">${labels[optIdx]}.</span>
                    <input type="text" value="${opt}" onchange="updatePreviewQ(${qIdx}, 'opt', this.value, ${optIdx})">
                </div>
            `;
        });

        html += `
            <div class="edit-ans">
                <label>Đáp án đúng:</label>
                <select onchange="updatePreviewQ(${qIdx}, 'ans', this.value)">
        `;

        q.options.forEach((_, optIdx) => {
            const isSelected = q.correctIndex === optIdx ? 'selected' : '';
            html += `<option value="${optIdx}" ${isSelected}>${labels[optIdx]}</option>`;
        });

        html += `
                </select>
            </div>
            <div style="margin-top: 12px;">
                <textarea class="edit-q" rows="2" placeholder="Giải thích đáp án (không bắt buộc)..." onchange="updatePreviewQ(${qIdx}, 'exp', this.value)" style="margin-bottom:0;">${q.explanation || ''}</textarea>
            </div>
        `;

        item.innerHTML = html;
        el.previewList.appendChild(item);
    });
}, 'renderPreviewList');

export const savePreviewExam = withErrorBoundary(function savePreviewExam() {
    const title = el.examTitleIn.value.trim() || 'Bài thi không tên';
    const duration = parseInt(el.examDurationIn.value) || 60;

    if (state.previewQuestions.length === 0) {
        alert('Đề thi trống, không thể lưu!');
        return;
    }

    const newExam = {
        id: 'exam_' + Date.now(),
        title: title,
        duration: duration,
        questions: JSON.parse(JSON.stringify(state.previewQuestions))
    };

    state.examsList.push(newExam);
    localStorage.setItem('eduquiz_exams', JSON.stringify(state.examsList));

    alert(`Đã lưu thành công ${state.previewQuestions.length} câu hỏi!`);
    renderHome();
    showView('home');
}, 'savePreviewExam');

window.updatePreviewQ = function(qIdx, field, value, optIdx = null) {
    if (field === 'q') {
        state.previewQuestions[qIdx].q = value;
    } else if (field === 'opt') {
        state.previewQuestions[qIdx].options[optIdx] = value;
    } else if (field === 'ans') {
        state.previewQuestions[qIdx].correctIndex = parseInt(value);
    } else if (field === 'exp') {
        state.previewQuestions[qIdx].explanation = value;
    }
};

window.removePreviewQuestion = function(qIdx) {
    if (confirm('Bạn có chắc chắn muốn xóa câu này khỏi đề thi?')) {
        state.previewQuestions.splice(qIdx, 1);
        el.previewCount.textContent = state.previewQuestions.length;
        renderPreviewList();
    }
};
