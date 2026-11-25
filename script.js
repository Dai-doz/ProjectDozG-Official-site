/* ProjectDozG — shared behaviour: theme toggle, scroll reveal, avatar fallback.
   Page-specific code lives in devices.js, screenshots.js and wiki.js. */
(() => {
    'use strict';

    /* ---- Theme (the saved theme is applied earlier by a tiny inline script in <head>) ---- */
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');

    const ICONS = {
        // Shown while dark: click for light
        dark: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
        // Shown while light: click for dark
        light: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
    };

    function applyTheme(theme) {
        root.dataset.theme = theme;
        if (icon) icon.innerHTML = ICONS[theme];
        if (toggle) toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }

    applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');

    if (toggle) {
        toggle.addEventListener('click', () => {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: ignore */ }
        });
    }

    /* ---- Scroll reveal ---- */
    const revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
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
})();
