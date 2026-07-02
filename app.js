// --- STATE MANAGEMENT ---
let examsList = JSON.parse(localStorage.getItem('eduquiz_exams')) || [];
let currentExam = null; // Bản sao của đề thi lúc runtime (có thể đã bị đảo)
let currentQuestionIndex = 0;
let userAnswers = []; // Mảng lưu index đáp án (0, 1, 2, 3)
let timerInterval = null;
let timeRemaining = 0;
let examToDeleteId = null;
let examToStartId = null;
let currentMode = 'exam'; // 'exam' (thi thật) hoặc 'practice' (luyện tập)
let currentViewMode = 'single'; // 'single' hoặc 'list'
let previewQuestions = [];
let isEditingExam = false;
let detailExamQuestions = [];

// --- DOM ELEMENTS ---
// Views
const views = {
    home: document.getElementById('home-view'),
    import: document.getElementById('import-view'),
    detail: document.getElementById('detail-view'),
    quiz: document.getElementById('quiz-view'),
    result: document.getElementById('result-view')
};

// Home Elements
const examListEl = document.getElementById('exam-list');
const btnShowImport = document.getElementById('btn-show-import');

// Import Elements
const btnBackHome = document.getElementById('btn-back-home');
const btnSaveExam = document.getElementById('btn-save-exam');
const btnParseText = document.getElementById('btn-parse-text');
const previewList = document.getElementById('preview-list');
const previewCount = document.getElementById('preview-count');
const examTitleIn = document.getElementById('exam-title');
const examDurationIn = document.getElementById('exam-duration');
const examContentIn = document.getElementById('exam-content');

// Quiz Elements
const quizRunningTitle = document.getElementById('quiz-running-title');
const quizTimer = document.getElementById('quiz-timer');
const currentQNum = document.getElementById('current-q-num');
const totalQNum = document.getElementById('total-q-num');
const questionsContainer = document.getElementById('questions-container');
const questionPalette = document.getElementById('question-palette');
const btnPrevQ = document.getElementById('btn-prev-q');
const btnNextQ = document.getElementById('btn-next-q');
const btnSubmitQuiz = document.getElementById('btn-submit-quiz');
const btnOpenPalette = document.getElementById('btn-open-palette');
const btnCloseSidebar = document.getElementById('btn-close-sidebar');
const quizSidebar = document.getElementById('quiz-sidebar');
const paletteOverlay = document.getElementById('palette-overlay');
const startViewMode = document.getElementById('start-view-mode');
// Result Elements
const finalScoreEl = document.getElementById('final-score');
const statCorrect = document.getElementById('stat-correct');
const statIncorrect = document.getElementById('stat-incorrect');
const statUnattempted = document.getElementById('stat-unattempted');
const reviewList = document.getElementById('review-list');
const btnBackHomeFromResult = document.getElementById('btn-back-home-from-result');

// Modal Elements
const overlay = document.getElementById('overlay');
const deleteModal = document.getElementById('delete-modal');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');

// Detail View Elements
const btnBackHomeFromDetail = document.getElementById('btn-back-home-from-detail');
const detailExamTitle = document.getElementById('detail-exam-title');
const detailExamDuration = document.getElementById('detail-exam-duration');
const detailExamCount = document.getElementById('detail-exam-count');
const startMode = document.getElementById('start-mode');
const startShuffle = document.getElementById('start-shuffle');
const btnConfirmStart = document.getElementById('btn-confirm-start');
const detailPreviewCount = document.getElementById('detail-preview-count');
const detailQuestionList = document.getElementById('detail-question-list');
const btnToggleEditExam = document.getElementById('btn-toggle-edit-exam');
const btnSaveEditExam = document.getElementById('btn-save-edit-exam');
const detailEditActions = document.getElementById('detail-edit-actions');

// Detail Tabs Elements
const tabBtns = document.querySelectorAll('.detail-tab-btn');
const tabContent = document.getElementById('tab-content');
const tabHistory = document.getElementById('tab-history');
const historyContainer = document.getElementById('history-container');

// Mobile Tabs Elements
const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
const detailConfig = document.querySelector('.detail-config');
const detailPreview = document.querySelector('.detail-preview');

// --- INIT APP ---
function init() {
    renderHome();
    setupEventListeners();
}

function showView(viewName) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
    window.scrollTo(0, 0);
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Navigation
    btnShowImport.addEventListener('click', () => {
        examTitleIn.value = '';
        examDurationIn.value = '60';
        examContentIn.value = '';
        previewQuestions = [];
        previewList.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-file-blank' style="font-size: 2.5rem;"></i>
                <p>Dán văn bản đề thi bên trái và bấm "Phân tích" để xem cấu trúc đề thi tại đây.</p>
            </div>
        `;
        previewCount.textContent = '0';
        showView('import');
    });
    btnBackHome.addEventListener('click', () => showView('home'));
    btnBackHomeFromDetail.addEventListener('click', () => showView('home'));
    btnBackHomeFromResult.addEventListener('click', () => {
        renderHome();
        showView('home');
    });

    // Import
    btnParseText.addEventListener('click', parseTextAndShowPreview);
    btnSaveExam.addEventListener('click', savePreviewExam);

    // Quiz Navigation
    btnNextQ.addEventListener('click', () => navigateQuestion(1));
    btnPrevQ.addEventListener('click', () => navigateQuestion(-1));
    btnSubmitQuiz.addEventListener('click', confirmSubmit);

    // Mobile Sidebar (Bottom Sheet)
    btnOpenPalette.addEventListener('click', () => {
        quizSidebar.classList.add('open');
        paletteOverlay.classList.remove('hidden');
    });
    btnCloseSidebar.addEventListener('click', () => {
        quizSidebar.classList.remove('open');
        paletteOverlay.classList.add('hidden');
    });
    paletteOverlay.addEventListener('click', () => {
        quizSidebar.classList.remove('open');
        paletteOverlay.classList.add('hidden');
    });

    // Modals
    // Modals & Detail
    btnCancelDelete.addEventListener('click', closeDeleteModal);
    btnConfirmDelete.addEventListener('click', deleteExam);
    btnConfirmStart.addEventListener('click', beginQuiz);
    btnToggleEditExam.addEventListener('click', toggleEditExam);
    btnSaveEditExam.addEventListener('click', saveDetailExam);
    
    // Detail Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const target = btn.dataset.tab;
            if(target === 'content') {
                tabContent.classList.add('active');
                tabContent.classList.remove('hidden');
                tabHistory.classList.remove('active');
                tabHistory.classList.add('hidden');
            } else {
                tabHistory.classList.add('active');
                tabHistory.classList.remove('hidden');
                tabContent.classList.remove('active');
                tabContent.classList.add('hidden');
                renderHistoryTab();
            }
        });
    });

    // Mobile Tabs
    mobileTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mobileTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.target === 'config') {
                detailConfig.classList.remove('mobile-hidden');
                detailPreview.classList.add('mobile-hidden');
            } else {
                detailConfig.classList.add('mobile-hidden');
                detailPreview.classList.remove('mobile-hidden');
            }
        });
    });
}

// --- HOME LOGIC ---
function renderHome() {
    examListEl.innerHTML = '';
    
    if (examsList.length === 0) {
        examListEl.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-ghost'></i>
                <p>Chưa có đề thi nào. Hãy thêm đề thi mới!</p>
            </div>
        `;
        return;
    }

    examsList.forEach(exam => {
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
        examListEl.appendChild(card);
    });
}

function openDetailView(id) {
    examToStartId = id;
    const exam = examsList.find(e => e.id === id);
    if(exam) {
        detailExamTitle.textContent = exam.title;
        detailExamDuration.textContent = exam.duration;
        detailExamCount.textContent = exam.questions.length;
        detailPreviewCount.textContent = exam.questions.length;
        
        // Reset tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        tabBtns[0].classList.add('active');
        tabContent.classList.add('active');
        tabContent.classList.remove('hidden');
        tabHistory.classList.remove('active');
        tabHistory.classList.add('hidden');
        
        // Reset mobile tabs
        mobileTabBtns.forEach(b => b.classList.remove('active'));
        mobileTabBtns[0].classList.add('active');
        detailConfig.classList.remove('mobile-hidden');
        detailPreview.classList.add('mobile-hidden');
        
        isEditingExam = false;
        detailExamQuestions = JSON.parse(JSON.stringify(exam.questions));
        renderDetailQuestions();
        
        showView('detail');
    }
}

function renderDetailQuestions() {
    detailQuestionList.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    if (isEditingExam) {
        btnToggleEditExam.innerHTML = `<i class='bx bx-x'></i> Hủy sửa`;
        detailEditActions.classList.remove('hidden');
        
        detailExamQuestions.forEach((q, qIdx) => {
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
            detailQuestionList.appendChild(item);
        });
    } else {
        btnToggleEditExam.innerHTML = `<i class='bx bx-pencil'></i> Chỉnh sửa`;
        detailEditActions.classList.add('hidden');
        
        detailExamQuestions.forEach((q, qIdx) => {
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
            detailQuestionList.appendChild(item);
        });
    }
}

function toggleEditExam() {
    isEditingExam = !isEditingExam;
    if (!isEditingExam) {
        // Nếu hủy sửa thì revert lại data gốc
        const exam = examsList.find(e => e.id === examToStartId);
        detailExamQuestions = JSON.parse(JSON.stringify(exam.questions));
    }
    renderDetailQuestions();
}

window.updateDetailQ = function(qIdx, field, value, optIdx = null) {
    if (field === 'q') {
        detailExamQuestions[qIdx].q = value;
    } else if (field === 'opt') {
        detailExamQuestions[qIdx].options[optIdx] = value;
    } else if (field === 'ans') {
        detailExamQuestions[qIdx].correctIndex = parseInt(value);
    } else if (field === 'exp') {
        detailExamQuestions[qIdx].explanation = value;
    }
};

function saveDetailExam() {
    const examIndex = examsList.findIndex(e => e.id === examToStartId);
    if (examIndex > -1) {
        examsList[examIndex].questions = JSON.parse(JSON.stringify(detailExamQuestions));
        localStorage.setItem('eduquiz_exams', JSON.stringify(examsList));
        alert('Đã lưu thay đổi đề thi!');
        isEditingExam = false;
        renderDetailQuestions();
        renderHome(); // Cập nhật lại list ở home nếu cần
    }
}



function openDeleteModal(id, event) {
    event.stopPropagation();
    examToDeleteId = id;
    overlay.classList.remove('hidden');
    deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    examToDeleteId = null;
    overlay.classList.add('hidden');
    deleteModal.classList.add('hidden');
}

function deleteExam() {
    if (examToDeleteId) {
        examsList = examsList.filter(e => e.id !== examToDeleteId);
        localStorage.setItem('eduquiz_exams', JSON.stringify(examsList));
        renderHome();
        closeDeleteModal();
    }
}

// --- IMPORT LOGIC ---
function parseTextAndShowPreview() {
    const content = examContentIn.value.trim();
    if (!content) {
        alert('Vui lòng nhập nội dung đề thi!');
        return;
    }

    try {
        previewQuestions = parseTextToJSON(content);
        if (previewQuestions.length === 0) {
            alert('Không tìm thấy câu hỏi nào hợp lệ. Vui lòng kiểm tra lại định dạng!');
            return;
        }

        previewCount.textContent = previewQuestions.length;
        renderPreviewList();
        
        // Xoá nội dung thô bên trái sau khi đã phân tích thành công sang bên phải
        examContentIn.value = '';
    } catch (e) {
        alert('Có lỗi xảy ra khi phân tích: ' + e.message);
    }
}

function renderPreviewList() {
    previewList.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    previewQuestions.forEach((q, qIdx) => {
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
        previewList.appendChild(item);
    });
}

window.updatePreviewQ = function(qIdx, field, value, optIdx = null) {
    if (field === 'q') {
        previewQuestions[qIdx].q = value;
    } else if (field === 'opt') {
        previewQuestions[qIdx].options[optIdx] = value;
    } else if (field === 'ans') {
        previewQuestions[qIdx].correctIndex = parseInt(value);
    } else if (field === 'exp') {
        previewQuestions[qIdx].explanation = value;
    }
};

window.removePreviewQuestion = function(qIdx) {
    if(confirm('Bạn có chắc chắn muốn xóa câu này khỏi đề thi?')) {
        previewQuestions.splice(qIdx, 1);
        previewCount.textContent = previewQuestions.length;
        renderPreviewList();
    }
};

function savePreviewExam() {
    const title = examTitleIn.value.trim() || 'Bài thi không tên';
    const duration = parseInt(examDurationIn.value) || 60;

    if (previewQuestions.length === 0) {
        alert('Đề thi trống, không thể lưu!');
        return;
    }

    const newExam = {
        id: 'exam_' + Date.now(),
        title: title,
        duration: duration,
        questions: JSON.parse(JSON.stringify(previewQuestions))
    };

    examsList.push(newExam);
    localStorage.setItem('eduquiz_exams', JSON.stringify(examsList));
    
    alert(`Đã lưu thành công ${previewQuestions.length} câu hỏi!`);
    renderHome();
    showView('home');
}

function parseTextToJSON(text) {
    const questions = [];
    // Tách block câu hỏi, xử lý cả "Câu 1:", "Câu 1.", "Câu 1"
    const blocks = text.split(/Câu\s*\d+[:\.\s]*\n?/i).filter(b => b.trim().length > 0);
    
    blocks.forEach(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let qText = '';
        let options = [];
        let correctIndex = 0;
        let explanation = '';

        let currentState = 'question';

        lines.forEach(line => {
            if (/^[A-D][\.\)]\s/i.test(line)) {
                currentState = 'options';
                options.push(line.replace(/^[A-D][\.\)]\s*/i, '').trim());
            } else if (line.toLowerCase().startsWith('đáp án:')) {
                currentState = 'answer';
                const ansChar = line.split(':')[1].trim().toUpperCase();
                correctIndex = ansChar.charCodeAt(0) - 65;
            } else if (line.toLowerCase().startsWith('giải thích:')) {
                currentState = 'explanation';
                explanation += line.substring(11).trim() + '\n';
            } else {
                if (currentState === 'question') {
                    qText += line + '\n';
                } else if (currentState === 'explanation') {
                    explanation += line + '\n';
                }
            }
        });

        if (qText && options.length >= 2) {
            questions.push({
                q: qText.trim(),
                options: options,
                correctIndex: correctIndex >= 0 && correctIndex < options.length ? correctIndex : 0,
                explanation: explanation.trim()
            });
        }
    });

    return questions;
}

// --- QUIZ START & SHUFFLE ---
function shuffleArray(array) {
    let curId = array.length;
    while (0 !== curId) {
        let randId = Math.floor(Math.random() * curId);
        curId -= 1;
        let tmp = array[curId];
        array[curId] = array[randId];
        array[randId] = tmp;
    }
    return array;
}

function beginQuiz() {
    const baseExam = examsList.find(e => e.id === examToStartId);
    if (!baseExam) return;

    currentMode = startMode.value;
    const isShuffle = startShuffle.checked;

    // Clone dữ liệu để không làm ảnh hưởng đến đề thi gốc
    currentExam = JSON.parse(JSON.stringify(baseExam));

    if (isShuffle) {
        // 1. Đảo danh sách câu hỏi
        shuffleArray(currentExam.questions);
        
        // 2. Đảo các lựa chọn A, B, C, D bên trong mỗi câu hỏi
        currentExam.questions.forEach(q => {
            const oldOptions = [...q.options];
            const correctText = oldOptions[q.correctIndex];
            
            shuffleArray(q.options);
            
            // Cập nhật lại correctIndex theo vị trí mới
            q.correctIndex = q.options.indexOf(correctText);
        });
    }

    currentQuestionIndex = 0;
    userAnswers = new Array(currentExam.questions.length).fill(null);
    currentViewMode = startViewMode.value; // 'single' hoặc 'list'
    
    // Config Quiz UI based on view mode
    const quizBottomNav = document.getElementById('quiz-bottom-nav');
    const quizMainArea = document.getElementById('quiz-main-area');
    
    if (currentViewMode === 'list') {
        quizMainArea.classList.add('list-view-mode');
        document.getElementById('quiz-progress-top').style.display = 'none';
        btnPrevQ.style.display = 'none';
        btnNextQ.style.display = 'none';
        
        let btnSubmitNav = document.getElementById('btn-submit-nav');
        if (!btnSubmitNav) {
            btnSubmitNav = document.createElement('button');
            btnSubmitNav.id = 'btn-submit-nav';
            btnSubmitNav.className = 'btn-primary';
            btnSubmitNav.style.flex = '1';
            btnSubmitNav.innerHTML = `<span class="nav-text">Nộp bài thi</span> <i class='bx bx-check-double'></i>`;
            btnSubmitNav.onclick = confirmSubmit;
            quizBottomNav.appendChild(btnSubmitNav);
        } else {
            btnSubmitNav.style.display = 'flex';
        }
    } else {
        quizMainArea.classList.remove('list-view-mode');
        document.getElementById('quiz-progress-top').style.display = 'block';
        btnPrevQ.style.display = 'flex';
        btnNextQ.style.display = 'flex';
        const btnSubmitNav = document.getElementById('btn-submit-nav');
        if (btnSubmitNav) btnSubmitNav.style.display = 'none';
    }

    const badge = document.querySelector('.timer-badge');
    if (currentMode === 'exam') {
        timeRemaining = currentExam.duration * 60; // Đếm ngược
        badge.style.display = 'flex';
        startTimer();
    } else {
        timeRemaining = 0;
        badge.style.display = 'none'; // Ẩn hoàn toàn đếm giờ
        clearInterval(timerInterval); // Không chạy bộ đếm
    }
    
    quizRunningTitle.textContent = currentExam.title;
    totalQNum.textContent = currentExam.questions.length;
    
    renderPalette();
    renderQuestion();
    
    showView('quiz');
}

// --- QUIZ RUNTIME LOGIC ---
function renderPalette() {
    questionPalette.innerHTML = '';
    currentExam.questions.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = `q-btn`;
        btn.textContent = i + 1;
        btn.onclick = () => {
            currentQuestionIndex = i;
            
            // Ẩn Palette Mobile sau khi bấm chọn
            quizSidebar.classList.remove('open');
            paletteOverlay.classList.add('hidden');
            
            if (currentViewMode === 'single') {
                renderQuestion();
            } else {
                updatePaletteStatus(); // List view
                // Cuộn tới câu hỏi đó
                const card = document.getElementById(`q-card-${i}`);
                if(card) {
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
        questionPalette.appendChild(btn);
    });
    updatePaletteStatus();
}

function updatePaletteStatus() {
    const btns = questionPalette.querySelectorAll('.q-btn');
    btns.forEach((btn, idx) => {
        btn.classList.remove('active', 'answered', 'correct-ans', 'wrong-ans');
        if (idx === currentQuestionIndex) btn.classList.add('active');
        
        if (userAnswers[idx] !== null) {
            if (currentMode === 'practice') {
                if (userAnswers[idx] === currentExam.questions[idx].correctIndex) {
                    btn.classList.add('correct-ans');
                } else {
                    btn.classList.add('wrong-ans');
                }
            } else {
                btn.classList.add('answered');
            }
        }
    });
}

function renderQuestion() {
    questionsContainer.innerHTML = ''; // Clear container

    if (currentViewMode === 'single') {
        // Render 1 câu
        const card = createQuestionCardHTML(currentQuestionIndex, currentExam.questions[currentQuestionIndex]);
        questionsContainer.appendChild(card);
        
        currentQNum.textContent = currentQuestionIndex + 1;
        
        // Cập nhật text nút Nộp bài / Câu tiếp
        btnPrevQ.disabled = currentQuestionIndex === 0;
        if (currentQuestionIndex === currentExam.questions.length - 1) {
            btnNextQ.innerHTML = `<span class="nav-text">Nộp bài</span> <i class='bx bx-check'></i>`;
            btnNextQ.onclick = confirmSubmit;
        } else {
            btnNextQ.innerHTML = `<span class="nav-text">Câu tiếp</span> <i class='bx bx-chevron-right'></i>`;
            btnNextQ.onclick = () => navigateQuestion(1);
        }
    } else {
        // Render toàn bộ danh sách (List View)
        currentExam.questions.forEach((qData, idx) => {
            const card = createQuestionCardHTML(idx, qData);
            questionsContainer.appendChild(card);
        });
    }

    updatePaletteStatus();
}

function createQuestionCardHTML(idx, qData) {
    const card = document.createElement('div');
    card.className = 'question-card glass-panel';
    card.id = `q-card-${idx}`;
    
    let html = `<div class="question-text"><strong>Câu ${idx + 1}:</strong> ${qData.q}</div>`;
    html += `<div class="options-list">`;
    
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const isAnsweredPractice = (currentMode === 'practice' && userAnswers[idx] !== null);

    qData.options.forEach((optText, optIdx) => {
        let itemClass = '';
        if (isAnsweredPractice) {
            if (optIdx === qData.correctIndex) itemClass = 'correct';
            else if (optIdx === userAnswers[idx]) itemClass = 'wrong';
        } else {
            if (userAnswers[idx] === optIdx) itemClass = 'selected';
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

function selectOption(qIdx, optIdx) {
    if (currentMode === 'practice' && userAnswers[qIdx] !== null) {
        return; // Không cho phép đổi đáp án trong chế độ luyện tập
    }

    userAnswers[qIdx] = optIdx;
    
    // Nếu đang ở single mode, ta đánh dấu currentQuestionIndex = qIdx (dù nó mặc định đã vậy)
    if (currentViewMode === 'single') {
        currentQuestionIndex = qIdx;
        renderQuestion();
    } else {
        // Trong list view, chỉ cần re-render toàn bộ hoặc cập nhật UI
        renderQuestion(); 
    }
}

function navigateQuestion(step) {
    const newIdx = currentQuestionIndex + step;
    if (newIdx >= 0 && newIdx < currentExam.questions.length) {
        currentQuestionIndex = newIdx;
        renderQuestion();
    }
}

function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();
    
    const badge = document.querySelector('.timer-badge');
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining <= 300) badge.classList.add('warning');
        else badge.classList.remove('warning');

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            badge.classList.remove('warning');
            alert('Đã hết thời gian làm bài! Hệ thống tự động nộp bài.');
            submitQuiz();
        }
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const totalMinutes = Math.floor(timeRemaining / 60);
    const m = (totalMinutes > 99 ? totalMinutes : totalMinutes).toString().padStart(2, '0');
    const s = (timeRemaining % 60).toString().padStart(2, '0');
    quizTimer.textContent = `${m}:${s}`;
}

function confirmSubmit() {
    const unanswered = userAnswers.filter(a => a === null).length;
    let msg = 'Bạn có chắc chắn muốn nộp bài?';
    if (unanswered > 0) {
        msg = `Bạn còn ${unanswered} câu chưa trả lời. ` + msg;
    }
    if (confirm(msg)) {
        submitQuiz();
    }
}

function submitQuiz() {
    clearInterval(timerInterval);
    const badge = document.querySelector('.timer-badge');
    if(badge) badge.classList.remove('warning');

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    currentExam.questions.forEach((q, idx) => {
        if (userAnswers[idx] === null) {
            unattempted++;
        } else if (userAnswers[idx] === q.correctIndex) {
            correct++;
        } else {
            incorrect++;
        }
    });

    const total = currentExam.questions.length;
    const score = (correct / total) * 10;

    finalScoreEl.textContent = score.toFixed(1);
    statCorrect.textContent = correct;
    statIncorrect.textContent = incorrect;
    statUnattempted.textContent = unattempted;

    // LƯU LỊCH SỬ THI
    const baseExamIndex = examsList.findIndex(e => e.id === examToStartId);
    if (baseExamIndex > -1) {
        if (!examsList[baseExamIndex].history) {
            examsList[baseExamIndex].history = [];
        }
        const attempt = {
            id: 'attempt_' + Date.now(),
            date: new Date().toISOString(),
            mode: currentMode,
            score: score.toFixed(1),
            correct,
            incorrect,
            unattempted,
            timeTaken: (currentMode === 'exam') ? (currentExam.duration * 60 - timeRemaining) : timeRemaining,
            userAnswers: [...userAnswers],
            examData: JSON.parse(JSON.stringify(currentExam)) // Lưu lại bộ đề đã shuffle nếu có
        };
        examsList[baseExamIndex].history.push(attempt);
        localStorage.setItem('eduquiz_exams', JSON.stringify(examsList));
    }

    renderReview();
    showView('result');
}

// --- HISTORY LOGIC ---
function renderHistoryTab() {
    const exam = examsList.find(e => e.id === examToStartId);
    historyContainer.innerHTML = '';
    
    if (!exam || !exam.history || exam.history.length === 0) {
        historyContainer.innerHTML = `
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
    
    historyContainer.innerHTML = html;
}

window.reviewHistoryAttempt = function(attemptId) {
    const exam = examsList.find(e => e.id === examToStartId);
    if (!exam || !exam.history) return;
    
    const attempt = exam.history.find(h => h.id === attemptId);
    if (!attempt) return;
    
    // Nạp lại dữ liệu của lần thi đó
    currentExam = attempt.examData;
    userAnswers = attempt.userAnswers;
    
    // Cập nhật lại UI Result View
    finalScoreEl.textContent = attempt.score;
    statCorrect.textContent = attempt.correct;
    statIncorrect.textContent = attempt.incorrect;
    statUnattempted.textContent = attempt.unattempted;

    renderReview();
    showView('result');
};

// --- RESULT LOGIC ---
function renderReview() {
    reviewList.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D'];

    currentExam.questions.forEach((q, qIdx) => {
        const uAns = userAnswers[qIdx];
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
        
        reviewList.insertAdjacentHTML('beforeend', html);
    });
}

// Bootstrap
init();
