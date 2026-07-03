import * as el from '../elements.js';
import { withErrorBoundary } from '../utils/error.js';

export const showView = withErrorBoundary(function showView(viewName) {
    Object.values(el.views).forEach(v => v.classList.add('hidden'));
    el.views[viewName].classList.remove('hidden');
    window.scrollTo(0, 0);

    if (el.btnThemeToggle) {
        if (viewName === 'quiz') {
            el.btnThemeToggle.style.display = 'none';
        } else {
            el.btnThemeToggle.style.display = 'flex';
        }
    }
}, 'showView');
