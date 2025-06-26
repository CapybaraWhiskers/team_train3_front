function applyLang() {
  const lang = localStorage.getItem('lang') || 'en';
  document.documentElement.lang = lang;
  const checkbox = document.getElementById('lang-toggle-checkbox');
  const label = document.getElementById('lang-toggle-label');
  if (checkbox) checkbox.checked = lang === 'ja';
  if (label) label.textContent = lang === 'ja' ? 'JA' : 'EN';
  document.querySelectorAll('[data-en][data-ja]').forEach(el => {
    const text = el.dataset[lang];
    if (text === undefined) return;
    if (el.placeholder !== undefined && el.tagName !== 'SELECT') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });
}

function initLangSwitch() {
  const checkbox = document.getElementById('lang-toggle-checkbox');
  if (checkbox) {
    checkbox.addEventListener('change', () => {
      const lang = checkbox.checked ? 'ja' : 'en';
      localStorage.setItem('lang', lang);
      applyLang();
    });
  }
  applyLang();
}

document.addEventListener('DOMContentLoaded', initLangSwitch);
