import * as el from './elements.js';
import { state } from './store.js';
import { initTheme, toggleTheme } from './components/theme.js';
import { showView } from './components/router.js';
import { renderHome, closeDeleteModal, deleteExam } from './views/home.js';
import { parseTextAndShowPreview, savePreviewExam } from './views/import.js';
import {
    navigateQuestion,
    confirmSubmit,
    beginQuiz,
    applyViewModeUI,
    renderQuestion
} from './views/quiz.js';
import {
    toggleEditExam,
    saveDetailExam,
    renderHistoryTab
} from './views/detail.js';
import { registerServiceWorker } from './components/pwa.js';

export function init() {
    initTheme();
    renderHome();
    setupEventListeners();
    registerServiceWorker();
}

export function setupEventListeners() {
    // Theme
    if (el.btnThemeToggle) {
        el.btnThemeToggle.addEventListener('click', toggleTheme);
    }

    // Navigation
    el.btnShowImport.addEventListener('click', () => {
        el.examTitleIn.value = '';
        el.examDurationIn.value = '60';
        el.examContentIn.value = '';
        state.previewQuestions = [];
        el.previewList.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-file-blank' style="font-size: 2.5rem;"></i>
                <p>Dán văn bản đề thi bên trái và bấm "Phân tích" để xem cấu trúc đề thi tại đây.</p>
            </div>
        `;
        el.previewCount.textContent = '0';
        showView('import');
    });
    el.btnBackHome.addEventListener('click', () => showView('home'));
    el.btnBackHomeFromDetail.addEventListener('click', () => showView('home'));
    el.btnBackHomeFromResult.addEventListener('click', () => {
        renderHome();
        showView('home');
    });

    // Import
    el.btnParseText.addEventListener('click', parseTextAndShowPreview);
    el.btnSaveExam.addEventListener('click', savePreviewExam);

    // Quiz Navigation
    el.btnNextQ.addEventListener('click', () => navigateQuestion(1));
    el.btnPrevQ.addEventListener('click', () => navigateQuestion(-1));
    el.btnSubmitQuiz.addEventListener('click', confirmSubmit);

    // Toggle view mode (single <-> list) during the quiz
    if (el.btnToggleViewMode) {
        el.btnToggleViewMode.addEventListener('click', () => {
            state.currentViewMode = state.currentViewMode === 'single' ? 'list' : 'single';
            el.btnToggleViewMode.innerHTML = state.currentViewMode === 'single'
                ? "<i class='bx bx-list-ul'></i> Danh sách"
                : "<i class='bx bx-detail'></i> Từng câu";
            applyViewModeUI();
            renderQuestion();
        });
    }

    // Quit Quiz
    if (el.btnQuitQuiz) {
        el.btnQuitQuiz.addEventListener('click', () => {
            if (confirm("Bạn có chắc chắn muốn thoát bài thi? Kết quả sẽ không được lưu.")) {
                clearInterval(state.timerInterval);
                document.body.classList.remove('no-scroll');
                showView('detail');
            }
        });
    }

    // Mobile Sidebar (Bottom Sheet)
    el.btnOpenPalette.addEventListener('click', () => {
        el.quizSidebar.classList.add('open');
        el.paletteOverlay.classList.remove('hidden');
    });
    el.btnCloseSidebar.addEventListener('click', () => {
        el.quizSidebar.classList.remove('open');
        el.paletteOverlay.classList.add('hidden');
    });
    el.paletteOverlay.addEventListener('click', () => {
        el.quizSidebar.classList.remove('open');
        el.paletteOverlay.classList.add('hidden');
    });

    // Modals & Detail
    el.btnCancelDelete.addEventListener('click', closeDeleteModal);
    el.btnConfirmDelete.addEventListener('click', deleteExam);
    el.btnConfirmStart.addEventListener('click', beginQuiz);
    el.btnToggleEditExam.addEventListener('click', toggleEditExam);
    el.btnSaveEditExam.addEventListener('click', saveDetailExam);

    // Detail Tabs
    el.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            el.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.dataset.tab;
            if (target === 'content') {
                el.tabContent.classList.add('active');
                el.tabContent.classList.remove('hidden');
                el.tabHistory.classList.remove('active');
                el.tabHistory.classList.add('hidden');
            } else {
                el.tabHistory.classList.add('active');
                el.tabHistory.classList.remove('hidden');
                el.tabContent.classList.remove('active');
                el.tabContent.classList.add('hidden');
                renderHistoryTab();
            }
        });
    });

    // Mobile Tabs
    el.mobileTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            el.mobileTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.target === 'config') {
                el.detailConfig.classList.remove('mobile-hidden');
                el.detailPreview.classList.add('mobile-hidden');
            } else {
                el.detailConfig.classList.add('mobile-hidden');
                el.detailPreview.classList.remove('mobile-hidden');
            }
        });
    });
}

// Bootstrap
init();
