/* Home page: cycles "Welcome" through several languages above the title,
   with a blur-and-fade swap like the One UI setup screen. Static when reduced motion is on. */
(() => {
    'use strict';

    const el = document.getElementById('welcomeWord');
    if (!el) return;

    const WORDS = [
        { text: 'Welcome',            lang: 'en' },
        { text: '환영합니다',            lang: 'ko' },
        { text: 'Chào mừng',          lang: 'vi' },
        { text: 'ようこそ',             lang: 'ja' },
        { text: 'Bienvenido',         lang: 'es' },
        { text: '欢迎',                lang: 'zh' },
        { text: 'Willkommen',         lang: 'de' },
        { text: 'Добро пожаловать',   lang: 'ru' },
        { text: 'Bienvenue',          lang: 'fr' },
        { text: 'स्वागत है',            lang: 'hi' },
        { text: 'Benvenuto',          lang: 'it' }
    ];
    const HOLD = 2600;   // ms each word stays
    const FADE = 450;    // ms, matches wordOut in style.css

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let timer = 0;

    function swap() {
        el.classList.add('out');
        setTimeout(() => {
            index = (index + 1) % WORDS.length;
            el.textContent = WORDS[index].text;
            el.lang = WORDS[index].lang;
            el.classList.remove('out');   // switching back to wordIn plays the entrance
        }, FADE);
    }

    function start() {
        clearInterval(timer);
        if (!motion.matches && !document.hidden) timer = setInterval(swap, HOLD + FADE);
    }

    motion.addEventListener('change', start);
    document.addEventListener('visibilitychange', start);
    start();
})();

/* Bug report form: builds an email to the maintainer and opens the visitor's mail app. */
(() => {
    'use strict';

    const TO = 'leduydaiforbusiness@gmail.com';
    const MAX_URL = 1900;   // some mail apps cut off longer mailto links

    const form = document.getElementById('bugForm');
    if (!form) return;

    const device = document.getElementById('bugDevice');
    const version = document.getElementById('bugVersion');
    const email = document.getElementById('bugEmail');
    const details = document.getElementById('bugDetails');
    const note = document.getElementById('bugNote');
    const copyBtn = document.getElementById('bugCopy');

    const original = note.innerHTML;
    let resetTimer = 0;

    function say(text) {
        note.textContent = text;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => { note.innerHTML = original; }, 6000);
    }

    function valid() {
        const detailsOk = details.value.trim().length > 0;
        const emailOk = !email.value.trim() || email.checkValidity();
        details.classList.toggle('invalid', !detailsOk);
        email.classList.toggle('invalid', !emailOk);
        if (!detailsOk) { say('Please describe the problem in Details.'); details.focus(); return false; }
        if (!emailOk) { say('That email address does not look right (or leave it empty).'); email.focus(); return false; }
        return true;
    }

    const subject = () => `[ProjectDozG] Bug report - ${device.value} / ${version.value}`;

    const body = () => [
        `Device: ${device.value}`,
        `ROM version: ${version.value}`,
        `Reply email: ${email.value.trim() || 'not given'}`,
        '',
        'Details:',
        details.value.trim()
    ].join('\n');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!valid()) return;

        const url = `mailto:${TO}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(body())}`;
        if (url.length > MAX_URL) {
            say('Your report is long for an email link. Use Copy report and paste it into an email to ' + TO + '.');
            return;
        }
        window.location.href = url;
        say('Opening your email app...');
    });

    copyBtn.addEventListener('click', async () => {
        if (!valid()) return;
        const text = `To: ${TO}\nSubject: ${subject()}\n\n${body()}`;
        try {
            await navigator.clipboard.writeText(text);
            say('Copied. Paste it into an email or a Telegram message.');
        } catch (err) {
            say('Could not copy automatically. Please select and copy your text manually.');
        }
    });

    [details, email].forEach((el) => el.addEventListener('input', () => el.classList.remove('invalid')));
})();
