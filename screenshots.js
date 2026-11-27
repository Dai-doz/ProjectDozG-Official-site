/* Screenshots page: version tabs, Galaxy A22 phone mockups and a keyboard-friendly lightbox.

   Put images in:  screenshots/<version id>/1 ... 4   (.png, .jpg or .webp)
   e.g. screenshots/v4.1/1.jpg
   A slot without an image shows a placeholder.

   To add a version, add one line to VERSIONS. */
(() => {
    'use strict';

    const BASE_PATH = 'screenshots';
    const SLOTS = 4;
    const EXTENSIONS = ['jpg', 'png', 'webp'];

    const VERSIONS = [
        { id: 'beta-v3.1', label: 'Beta V3.1', note: 'Beta build' },
        { id: 'v3.5.3',    label: 'V3.5.3',    note: '' },
        { id: 'v4.1',      label: 'V4.1',      note: '' }
    ];

    const tabs = document.getElementById('versionTabs');
    const grid = document.getElementById('shotsGrid');
    const note = document.getElementById('versionNote');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    if (!tabs || !grid) return;

    const IMAGE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
    const PLACEHOLDER = (label) => `
        <span class="shot-placeholder">
            ${IMAGE_ICON}
            <span>${label}</span>
        </span>`;

    const cache = new Map(); // "folder/n" -> HTMLImageElement | null
    let currentVersion = null;
    let lastFocus = null;
    let gallery = [];
    let galleryIndex = 0;
    let touchStartX = null;

    const loadImage = (src) => new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
            const done = () => resolve(img);
            if (typeof img.decode === 'function') {
                img.decode().then(done, done);
            } else {
                done();
            }
        };
        img.onerror = () => resolve(null);
        img.src = src;
    });

    async function findShot(folder, n) {
        const key = `${folder}/${n}`;
        if (cache.has(key)) return cache.get(key);

        let found = null;
        for (const ext of EXTENSIONS) {
            found = await loadImage(`${key}.${ext}`);
            if (found) break;
        }
        cache.set(key, found);
        return found;
    }

    function createSlot(folder, n, version) {
        const item = document.createElement('figure');
        item.className = 'shot-item';

        const slot = document.createElement('button');
        slot.type = 'button';
        slot.className = 'shot-slot';
        slot.disabled = true;
        slot.dataset.index = String(n - 1);
        slot.setAttribute('aria-label', `Loading ${version.label} screenshot ${n}`);
        slot.innerHTML = `
            <span class="shot-earpiece" aria-hidden="true"></span>
            <span class="shot-notch" aria-hidden="true"></span>
            <span class="shot-key shot-key-volume" aria-hidden="true"></span>
            <span class="shot-key shot-key-power" aria-hidden="true"></span>
            <span class="shot-sim" aria-hidden="true"></span>
            <span class="shot-screen">${PLACEHOLDER(`Screenshot ${n}`)}</span>`;

        const caption = document.createElement('figcaption');
        caption.className = 'shot-caption';
        caption.textContent = `Screenshot ${n}`;
        item.append(slot, caption);

        findShot(folder, n).then((img) => {
            if (!img) {
                slot.classList.add('missing');
                slot.setAttribute('aria-label', `Screenshot ${n} is not available`);
                const label = slot.querySelector('.shot-placeholder span');
                if (label) label.textContent = 'Not available';
                caption.textContent = `Screenshot ${n} · Not available`;
                return;
            }

            const shot = img.cloneNode();
            shot.alt = `ProjectDozG ${version.label} screenshot ${n} in a Galaxy A22 mockup`;
            shot.decoding = 'async';
            shot.loading = n > 2 ? 'lazy' : 'eager';
            const screen = slot.querySelector('.shot-screen');
            if (screen) screen.replaceChildren(shot);

            slot.disabled = false;
            slot.setAttribute('aria-label', `Enlarge ${version.label} screenshot ${n}`);
        });

        return item;
    }

    function showVersion(id) {
        const version = VERSIONS.find((v) => v.id === id) || VERSIONS[VERSIONS.length - 1];
        currentVersion = version;
        const folder = `${BASE_PATH}/${version.id}`;

        if (lightbox && lightbox.classList.contains('open')) closeLightbox();

        tabs.querySelectorAll('.tab').forEach((tab) => {
            const active = tab.dataset.id === version.id;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
        });

        grid.setAttribute('aria-labelledby', `version-tab-${version.id}`);
        note.textContent = version.note;
        note.hidden = !version.note;
        grid.replaceChildren(...Array.from({ length: SLOTS }, (_, i) => createSlot(folder, i + 1, version)));

        document.title = `${version.label} Screenshots — ProjectDozG`;

        try { history.replaceState(null, '', `#${version.id}`); } catch (e) { /* ignore */ }
    }

    /* Tabs */
    VERSIONS.forEach((version) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'tab';
        tab.id = `version-tab-${version.id}`;
        tab.dataset.id = version.id;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', 'shotsGrid');
        tab.textContent = version.label;
        tab.addEventListener('click', () => showVersion(version.id));
        tabs.append(tab);
    });

    tabs.addEventListener('keydown', (e) => {
        const currentIndex = VERSIONS.findIndex((v) => v.id === currentVersion?.id);
        let nextIndex = null;

        if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % VERSIONS.length;
        else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + VERSIONS.length) % VERSIONS.length;
        else if (e.key === 'Home') nextIndex = 0;
        else if (e.key === 'End') nextIndex = VERSIONS.length - 1;

        if (nextIndex === null) return;
        e.preventDefault();
        showVersion(VERSIONS[nextIndex].id);
        tabs.querySelectorAll('.tab')[nextIndex]?.focus();
    });

    /* Lightbox */
    function updateLightbox() {
        const img = gallery[galleryIndex];
        if (!img) return;

        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = `${currentVersion.label} · Screenshot ${galleryIndex + 1} of ${gallery.length}`;

        const multiple = gallery.length > 1;
        lightboxPrev.hidden = !multiple;
        lightboxNext.hidden = !multiple;
    }

    function openLightbox(img) {
        gallery = [...grid.querySelectorAll('.shot-slot:not(:disabled) img')];
        galleryIndex = gallery.indexOf(img);
        if (galleryIndex < 0) return;

        lastFocus = document.activeElement;
        updateLightbox();
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
        lightboxClose.focus();
    }

    function closeLightbox() {
        if (!lightbox.classList.contains('open')) return;

        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');
        lightboxImg.removeAttribute('src');
        lightboxImg.alt = '';
        lightboxCaption.textContent = '';

        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
        lastFocus = null;
    }

    function stepLightbox(direction) {
        if (!gallery.length) return;
        galleryIndex = (galleryIndex + direction + gallery.length) % gallery.length;
        updateLightbox();
    }

    if (lightbox && lightboxImg && lightboxClose && lightboxPrev && lightboxNext) {
        grid.addEventListener('click', (e) => {
            const img = e.target.closest('.shot-slot')?.querySelector('img');
            if (!img) return;
            openLightbox(img);
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', () => stepLightbox(-1));
        lightboxNext.addEventListener('click', () => stepLightbox(1));

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') stepLightbox(-1);
            else if (e.key === 'ArrowRight') stepLightbox(1);
        });

        /* Keep focus inside the dialog while it is open */
        lightbox.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            const focusable = [...lightbox.querySelectorAll('button')].filter((el) => !el.hidden);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });

        /* Swipe between screenshots on touch screens */
        lightboxImg.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0]?.clientX ?? null;
        }, { passive: true });

        lightboxImg.addEventListener('touchend', (e) => {
            if (touchStartX === null) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartX;
            if (Math.abs(endX - touchStartX) > 50) stepLightbox(endX < touchStartX ? 1 : -1);
            touchStartX = null;
        }, { passive: true });
    }

    window.addEventListener('hashchange', () => showVersion(location.hash.slice(1)));
    showVersion(location.hash.slice(1) || VERSIONS[VERSIONS.length - 1].id);
})();
