/* Build page: reads ?device=<id>&build=<id> and fills the banner, download card
   and device links from builds.js. Unknown links show the "build not found" panel. */
(() => {
    'use strict';

    const data = window.ProjectDozG;
    if (!data) return;

    const params = new URLSearchParams(location.search);
    const resolved = data.getBuild(params.get('device'), params.get('build'));
    const device = resolved ? resolved.device : null;
    const build = resolved ? resolved.build : null;

    const content = document.getElementById('buildContent');
    const detail = document.getElementById('buildDetail');
    const missing = document.getElementById('buildMissing');

    if (!device || !build) {
        if (content) content.hidden = true;
        if (detail) detail.hidden = true;
        if (missing) missing.hidden = false;
        document.title = 'Build not found — ProjectDozG';
        return;
    }

    const available = Boolean(build.url);
    const host = data.hostLabel(build.url);
    const shotFolder = build.screenshots || 'v4.1';
    const shotPath = `screenshots/${shotFolder}/${build.banner || 1}.jpg`;

    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    /* Page title and description */
    document.title = `${build.label} — ${device.name} — ProjectDozG`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = `Download ProjectDozG ${build.label} for the ${device.name} (${device.model}).`;

    /* Breadcrumb */
    const crumbDevice = document.getElementById('crumbDevice');
    if (crumbDevice) {
        crumbDevice.textContent = device.name;
        crumbDevice.href = device.wiki;
    }
    setText('crumbBuild', build.label);

    /* Banner */
    const banner = document.getElementById('buildBanner');
    if (banner) {
        banner.style.setProperty('--banner-image', `url("${shotPath}")`);
    }

    const status = document.getElementById('buildStatus');
    if (status) {
        status.textContent = available ? 'Official build' : 'In development';
        status.classList.toggle('is-soon', !available);
    }
    setText('buildTag', build.tag);
    setText('buildDevice', `${device.name} · ${device.model}`);
    setText('buildVersion', build.version);
    setText('buildWatermark', build.version);
    setText('buildDesc', available
        ? `${build.label} is an official ProjectDozG release for the ${device.name}, built on ${build.base} (${build.android}).`
        : `The ${build.tag} build for the ${device.name} is still in development. The download link will appear here once it is ready.`);

    setText('factBase', build.base);
    setText('factAndroid', build.android);
    setText('factMaintainer', device.maintainer);

    const shot = document.getElementById('buildShot');
    if (shot) {
        shot.src = shotPath;
        shot.alt = `ProjectDozG ${build.version} running on the ${device.name}`;
        shot.addEventListener('error', () => {
            const visual = shot.closest('.build-banner-visual');
            if (visual) visual.remove();
        }, { once: true });
    }

    /* Download buttons */
    function setupDownload(link, textEl) {
        if (!link) return;
        if (available) {
            link.href = build.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.removeAttribute('aria-disabled');
            if (textEl) textEl.textContent = 'Download ROM';
        } else {
            link.removeAttribute('href');
            link.removeAttribute('target');
            link.setAttribute('aria-disabled', 'true');
            if (textEl) textEl.textContent = 'Coming soon';
        }
    }

    setupDownload(document.getElementById('bannerDownload'), document.getElementById('bannerDownloadText'));
    setupDownload(document.getElementById('detailDownload'), document.getElementById('detailDownloadText'));

    /* Download panel */
    setText('downloadDesc', available
        ? `Ready to flash. You will be redirected to ${host} to download the ROM.`
        : 'This build is not available to download yet. Check back here for the release.');
    setText('metaVersion', build.label);
    setText('metaDevice', `${device.name} (${device.model})`);
    setText('metaBase', `${build.base} · ${build.android}`);
    setText('metaType', available ? 'Official build' : 'Coming soon');
    setText('metaHost', available ? host : '—');
    setText('metaMaintainer', device.maintainer);

    const highlights = document.getElementById('buildHighlights');
    if (highlights) {
        if (build.highlights && build.highlights.length) {
            highlights.replaceChildren(...build.highlights.map((text) => {
                const item = document.createElement('li');
                item.textContent = text;
                return item;
            }));
        } else {
            highlights.remove();
        }
    }

    const note = document.getElementById('buildNote');
    if (note) {
        if (available) {
            note.innerHTML = 'Read the <a href="guide.html">install guide</a> before flashing. Flashing voids your warranty.';
        } else {
            note.textContent = 'This build is not ready yet. The download link will appear here when the maintainer publishes it.';
        }
    }

    /* Other versions for the same device */
    const otherList = document.getElementById('otherBuilds');
    if (otherList) {
        const others = device.builds.filter((b) => b.id !== build.id);
        if (others.length) {
            otherList.replaceChildren(...others.map((b) => data.buildRow(device, b)));
        } else {
            const empty = document.createElement('p');
            empty.className = 'build-list-empty';
            empty.textContent = 'This is the only build for this device.';
            otherList.replaceChildren(empty);
        }
    }

    /* Device links */
    setText('deviceInfo', `The ${device.name} (${device.model}) is powered by the ${device.chipset} and maintained by ${device.maintainer}.`);

    const wikiLink = document.getElementById('deviceWiki');
    if (wikiLink) wikiLink.href = device.wiki;

    const screenshotsLink = document.getElementById('buildScreenshots');
    if (screenshotsLink) screenshotsLink.href = `screenshots.html#${shotFolder}`;

    const telegramLink = document.getElementById('deviceTelegram');
    if (telegramLink) {
        telegramLink.href = device.telegram;
        telegramLink.textContent = `Message ${device.maintainer} on Telegram →`;
    }
})();
