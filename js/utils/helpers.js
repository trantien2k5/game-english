// utils/helpers.js

export function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Nhận diện dòng tiêu đề câu hỏi có từ khóa: "Câu 1", "Câu 1:", "Question 1.", "Q1:" (VI/EN)
const HEADER_KEYWORD_RE = /^(?:câu|cau|question|ques|q)\s*\.?\s*\d+\s*[:.\-)]?\s*(.*)$/i;
// Tiêu đề đánh số trần: "1.", "1)", "1:" — chỉ tin khi không thể nhầm với option
const HEADER_PLAIN_NUM_RE = /^\d+\s*[.):]\s*(.*)$/;
// Option: "A.", "A)", "(A)", "[A]" — chỉ 1 ký tự A-F ngay sau dấu mở, theo sau là khoảng trắng
const OPTION_RE = /^[\(\[]?([A-Fa-f])[.):\]]\s+(.*)$/;
// Dòng công bố đáp án đúng (VI/EN), bắt buộc có dấu ':' hoặc '-' để tránh nhầm với câu văn thường
const ANSWER_RE = /^(?:đáp\s*án(?:\s*đúng)?|dap\s*an(?:\s*dung)?|answer|correct\s*answer|ans|correct)\s*[:\-]\s*(.*)$/i;
// Dòng giải thích (VI/EN)
const EXPLANATION_RE = /^(?:giải\s*thích|giai\s*thich|explanation|explain|note|ghi\s*chú|ghi\s*chu|lý\s*do|ly\s*do)\s*[:\-]\s*(.*)$/i;
// Đánh dấu đáp án đúng ngay trong dòng option: (*) [x] [correct] ✓ ✔ hoặc bọc **...** / __...__
const INLINE_CORRECT_RE = /(\(\*\)|\[x\]|\[correct\]|✓|✔)\s*$/i;

function stripInlineCorrectMarker(optText) {
    let isCorrect = false;
    if (INLINE_CORRECT_RE.test(optText)) {
        isCorrect = true;
        optText = optText.replace(INLINE_CORRECT_RE, '').trim();
    }
    const boldMatch = optText.match(/^\*\*(.+)\*\*$/) || optText.match(/^__(.+)__$/);
    if (boldMatch) {
        isCorrect = true;
        optText = boldMatch[1].trim();
    }
    return { optText, isCorrect };
}

function resolveAnswerIndex(rawAnswer, options) {
    if (!rawAnswer) return null;
    const letterMap = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
    const letterMatch = rawAnswer.trim().match(/^([A-Fa-f])\b/);
    if (letterMatch) {
        return letterMap[letterMatch[1].toUpperCase()];
    }
    // Đáp án được ghi bằng nội dung thay vì ký tự (VD: "Đáp án: London")
    const normalized = rawAnswer.trim().toLowerCase();
    const byExactMatch = options.findIndex(opt => opt.trim().toLowerCase() === normalized);
    if (byExactMatch !== -1) return byExactMatch;
    const byPrefixMatch = options.findIndex(opt => opt.trim().toLowerCase().startsWith(normalized) && normalized.length > 0);
    if (byPrefixMatch !== -1) return byPrefixMatch;
    return null;
}

function finalizeQuestion(q) {
    if (!q) return null;
    q.q = q.q.trim();
    q.explanation = q.explanation.trim();
    if (q.options.length < 2 || !q.q) return null;

    let correctIndex = q.correctIndex;
    if (correctIndex === null && q.pendingAnswerRaw) {
        correctIndex = resolveAnswerIndex(q.pendingAnswerRaw, q.options);
    }
    if (correctIndex === null || correctIndex < 0 || correctIndex >= q.options.length) {
        correctIndex = 0;
    }
    return { q: q.q, options: q.options, correctIndex, explanation: q.explanation };
}

export function parseTextToJSON(text) {
    const lines = text.split('\n');
    const questions = [];
    let currentQ = null;

    const startNewQuestion = (initialText) => {
        const finalized = finalizeQuestion(currentQ);
        if (finalized) questions.push(finalized);
        currentQ = { q: initialText || '', options: [], correctIndex: null, pendingAnswerRaw: '', explanation: '' };
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const headerMatch = line.match(HEADER_KEYWORD_RE);
        const optionMatch = line.match(OPTION_RE);
        const answerMatch = line.match(ANSWER_RE);
        const explanationMatch = line.match(EXPLANATION_RE);
        const plainNumMatch = line.match(HEADER_PLAIN_NUM_RE);

        if (headerMatch) {
            startNewQuestion(headerMatch[1].trim());
        } else if (optionMatch) {
            if (!currentQ) startNewQuestion('');
            const { optText, isCorrect } = stripInlineCorrectMarker(optionMatch[2].trim());
            currentQ.options.push(optText);
            if (isCorrect) currentQ.correctIndex = currentQ.options.length - 1;
        } else if (answerMatch) {
            if (currentQ) currentQ.pendingAnswerRaw = answerMatch[1].trim();
        } else if (explanationMatch) {
            if (currentQ) {
                currentQ.explanation = currentQ.explanation
                    ? currentQ.explanation + '\n' + explanationMatch[1].trim()
                    : explanationMatch[1].trim();
            }
        } else if (plainNumMatch && (!currentQ || currentQ.options.length >= 2)) {
            // Đánh số trần ("1. ...") chỉ được coi là câu mới nếu câu trước đã có đủ option
            startNewQuestion(plainNumMatch[1].trim());
        } else if (currentQ) {
            if (currentQ.options.length === 0) {
                currentQ.q = currentQ.q ? (currentQ.q + '\n' + line) : line;
            } else {
                // Text thừa sau các option (không rõ nhãn) -> gộp vào giải thích
                currentQ.explanation = currentQ.explanation ? (currentQ.explanation + '\n' + line) : line;
            }
        }
    }

    const last = finalizeQuestion(currentQ);
    if (last) questions.push(last);

    return questions;
}
