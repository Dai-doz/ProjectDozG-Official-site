/* Devices page: build picker.
   Each .device-card carries its builds in data-builds (a JSON list in devices.html):
   {"label": "V4.1 [Beta]", "url": "https://...", "info": "Early-access"}
   An empty url shows a disabled "Coming soon" button. */
(() => {
    'use strict';

    document.querySelectorAll('.device-card[data-builds]').forEach((card) => {
        const select = card.querySelector('.build-select');
        const info = card.querySelector('.build-info');
        const link = card.querySelector('.download-link');
        const text = card.querySelector('.download-text');

        let builds = [];
        try {
            builds = JSON.parse(card.dataset.builds);
        } catch (e) {
            console.warn('Invalid data-builds JSON on', card, e);
        }

        if (builds.length) {
            select.append(...builds.map((build, i) => new Option(build.label, i)));
        } else {
            select.append(new Option('No builds yet', ''));
            select.disabled = true;
        }

        function update() {
            const build = builds[Number(select.value)];
            const hasUrl = Boolean(build && build.url);

            link.classList.toggle('disabled', !hasUrl);
            link.setAttribute('aria-disabled', String(!hasUrl));
            if (hasUrl) link.href = build.url;
            else link.removeAttribute('href');

            text.textContent = hasUrl ? 'Download ROM' : 'Coming soon';
            info.textContent = build ? (build.info || '') : '';
        }

        select.addEventListener('change', update);
        update();
    });
})();
