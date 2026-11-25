/* Screenshots page: version tabs + 4 slots per version + lightbox.

   Put images in:  images/screenshots/<version id>/1 ... 4   (.png, .jpg or .webp)
   e.g. images/screenshots/v4.1/1.png
   A slot without an image shows a placeholder.

   To add a version, add one line to VERSIONS. */
(() => {
    'use strict';

    const BASE_PATH = 'screenshots';
    const SLOTS = 4;
    const EXTENSIONS = ['png', 'jpg', 'webp'];

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
    if (!tabs || !grid) return;

    const PLACEHOLDER = (n) => `
        <div class="shot-placeholder">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            Screenshot ${n}
        </div>`;

    const cache = new Map(); // "folder/n" -> HTMLImageElement | null

    const loadImage = (src) => new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
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

    function createSlot(folder, n) {
        const slot = document.createElement('button');
        slot.type = 'button';
        slot.className = 'shot-slot';
        slot.disabled = true;
        slot.innerHTML = PLACEHOLDER(n);

        findShot(folder, n).then((img) => {
            if (!img) return;
            const shot = img.cloneNode();
            shot.alt = `Screenshot ${n}`;
            slot.replaceChildren(shot);
            slot.setAttribute('aria-label', `Enlarge screenshot ${n}`);
            slot.disabled = false;
        });

        return slot;
    }

    function showVersion(id) {
        const version = VERSIONS.find((v) => v.id === id) || VERSIONS[VERSIONS.length - 1];
        const folder = `${BASE_PATH}/${version.id}`;

        tabs.querySelectorAll('.tab').forEach((tab) => {
            const active = tab.dataset.id === version.id;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', String(active));
        });

        note.textContent = version.note;
        note.hidden = !version.note;
        grid.replaceChildren(...Array.from({ length: SLOTS }, (_, i) => createSlot(folder, i + 1)));

        try { history.replaceState(null, '', `#${version.id}`); } catch (e) { /* ignore */ }
    }

    tabs.append(...VERSIONS.map((version) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'tab';
        tab.dataset.id = version.id;
        tab.setAttribute('role', 'tab');
        tab.textContent = version.label;
        tab.addEventListener('click', () => showVersion(version.id));
        return tab;
    }));

    /* Lightbox */
    if (lightbox && lightboxImg) {
        grid.addEventListener('click', (e) => {
            const img = e.target.closest('.shot-slot')?.querySelector('img');
            if (!img) return;
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('open');
        });

        const close = () => lightbox.classList.remove('open');
        lightbox.addEventListener('click', close);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }

    window.addEventListener('hashchange', () => showVersion(location.hash.slice(1)));
    showVersion(location.hash.slice(1) || VERSIONS[VERSIONS.length - 1].id);
})();
