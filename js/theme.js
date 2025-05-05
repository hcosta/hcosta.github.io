const toggleBtn = document.getElementById('theme-toggle');
const iconSun = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');
const themeLink = document.getElementById('theme-style');

const setTheme = (mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    themeLink.href = `/styles/${mode}.css`;
    iconSun.style.display = mode === 'dark' ? 'block' : 'none';
    iconMoon.style.display = mode === 'light' ? 'block' : 'none';
};

toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// Inicialización
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
setTheme(initialTheme);