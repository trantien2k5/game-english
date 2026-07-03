import { state } from '../store.js';
import * as el from '../elements.js';
import { withErrorBoundary } from '../utils/error.js';
import { showView } from '../components/router.js';
import { openDetailView } from './detail.js';

export const renderHome = withErrorBoundary(function renderHome() {
    el.examListEl.innerHTML = '';

    if (state.examsList.length === 0) {
        el.examListEl.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-ghost'></i>
                <p>Chưa có đề thi nào. Hãy thêm đề thi mới!</p>
            </div>
        `;
        return;
    }

    state.examsList.forEach(exam => {
        const card = document.createElement('div');
        card.className = 'exam-card glass-panel';
        card.onclick = () => openDetailView(exam.id);
        card.innerHTML = `
            <button class="exam-menu-btn btn-delete-exam" onclick="openDeleteModal('${exam.id}', event)" title="Xóa đề thi">
                <i class='bx bx-trash'></i>
            </button>
            <div class="card-icon" style="font-size: 2rem; color: var(--primary); margin-bottom: 12px;">
                <i class='bx bxs-file-blank'></i>
            </div>
            <h3>${exam.title}</h3>
            <div class="exam-meta">
                <span><i class='bx bx-time'></i> ${exam.duration} Phút</span>
                <span><i class='bx bx-list-ol'></i> ${exam.questions.length} Câu</span>
            </div>
        `;
        el.examListEl.appendChild(card);
    });
}, 'renderHome');

export const openDeleteModal = withErrorBoundary(function openDeleteModal(id, event) {
    event.stopPropagation();
    state.examToDeleteId = id;
    el.overlay.classList.remove('hidden');
    el.deleteModal.classList.remove('hidden');
}, 'openDeleteModal');
window.openDeleteModal = openDeleteModal;

export const closeDeleteModal = withErrorBoundary(function closeDeleteModal() {
    state.examToDeleteId = null;
    el.overlay.classList.add('hidden');
    el.deleteModal.classList.add('hidden');
}, 'closeDeleteModal');

export const deleteExam = withErrorBoundary(function deleteExam() {
    if (state.examToDeleteId) {
        state.examsList = state.examsList.filter(e => e.id !== state.examToDeleteId);
        localStorage.setItem('eduquiz_exams', JSON.stringify(state.examsList));
        renderHome();
        closeDeleteModal();
    }
}, 'deleteExam');
