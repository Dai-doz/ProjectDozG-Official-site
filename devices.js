/* Devices page: renders one clickable row per ProjectDozG build.
   Builds come from builds.js (window.ProjectDozG). Each row opens
   build.html?device=<device>&build=<build> with the banner and download. */
(() => {
    'use strict';

    const data = window.ProjectDozG;
    if (!data) return;

    document.querySelectorAll('.device-card[data-device]').forEach((card) => {
        const device = data.getDevice(card.dataset.device);
        const list = card.querySelector('[data-build-list]');
        if (!device || !list) return;

        list.replaceChildren(...device.builds.map((build) => data.buildRow(device, build)));
    });
})();
