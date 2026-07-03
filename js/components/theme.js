import * as el from '../elements.js';

export function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    if (!el.btnThemeToggle) return;
    if (theme === 'dark') {
        el.btnThemeToggle.innerHTML = '<i class="bx bx-sun"></i>';
    } else {
        el.btnThemeToggle.innerHTML = '<i class="bx bx-moon"></i>';
    }
}
