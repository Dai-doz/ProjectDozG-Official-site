/* ProjectDozG — shared behaviour: theme toggle, scroll reveal, avatar fallback
   and the footer year. Page-specific code lives in devices.js, screenshots.js,
   wiki.js, build.js and changelog.js. */
(() => {
    'use strict';

    const root = document.documentElement;
    const THEME_KEY = 'theme';
    const THEME_COLORS = { dark: '#08090d', light: '#f8fafc' };

    const ICONS = {
        // Shown while dark: click for light
        dark: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
        // Shown while light: click for dark
        light: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
    };

    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    const themeColor = document.querySelector('meta[name="theme-color"]');

    function applyTheme(theme, persist) {
        root.dataset.theme = theme;
        if (icon) icon.innerHTML = ICONS[theme];
        if (toggle) toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
        if (themeColor) themeColor.content = THEME_COLORS[theme];

        if (persist) {
            try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* storage blocked: ignore */ }
        }
    }

    /* The saved theme is applied earlier by a tiny inline script in <head>. */
    applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark', false);

    if (toggle) {
        toggle.addEventListener('click', () => {
            applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
        });
    }

    // Keep multiple open tabs in sync.
    window.addEventListener('storage', (e) => {
        if (e.key === THEME_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
            applyTheme(e.newValue, false);
        }
    });

    /* ---- Scroll reveal ---- */
    const revealEls = document.querySelectorAll('.reveal');

    if (revealEls.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('active'));
    }

    /* ---- Maintainer avatars: fall back to the first letter if the image is missing ---- */
    function avatarFallback(img) {
        const initial = document.createElement('div');
        initial.className = 'avatar';
        initial.setAttribute('role', 'img');
        initial.setAttribute('aria-label', img.alt);
        initial.textContent = (img.alt || '?').trim().charAt(0).toUpperCase();
        img.replaceWith(initial);
    }

    document.addEventListener('error', (e) => {
        if (e.target instanceof HTMLImageElement && e.target.matches('img.avatar')) avatarFallback(e.target);
    }, true);

    // Images that already failed before this script ran
    document.querySelectorAll('img.avatar').forEach((img) => {
        if (img.complete && img.naturalWidth === 0) avatarFallback(img);
    });

    /* ---- Footer year ---- */
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = year; });

    /* Keep the active nav link visible when the mobile nav scrolls sideways. */
    function centerActiveNav() {
        const activeNav = document.querySelector('nav a.active');
        if (!activeNav) return;

        const nav = activeNav.closest('nav');
        if (!nav || nav.scrollWidth <= nav.clientWidth) return;

        const navRect = nav.getBoundingClientRect();
        const linkRect = activeNav.getBoundingClientRect();
        nav.scrollLeft += linkRect.left - navRect.left - (nav.clientWidth - linkRect.width) / 2;
    }

    centerActiveNav();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(centerActiveNav);
})();
