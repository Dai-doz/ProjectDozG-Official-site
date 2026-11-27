/* Shared build catalogue for the Devices and build detail pages.
   Add a device or a build here once; both pages read this list.

   Build fields:
     id           short id used in build.html?device=...&build=...
     label        text shown on the device card and detail page
     version      version number shown in the banner
     tag          release name (Winter, Falcon, Beta, ...)
     url          download link — leave empty for "Coming soon"
     info         one-line status shown on the device card
     base         One UI base
     android      Android version
     screenshots  folder name under screenshots/ (also a screenshots.html tab id)
     banner       screenshot number used in the page banner (defaults to 1)
     highlights   bullet points shown on the build page
*/
(() => {
    'use strict';

    const devices = [
        {
            id: 'a12s',
            name: 'Galaxy A12s',
            model: 'SM-A127F/M',
            chipset: 'Samsung Exynos 850',
            maintainer: 'Dai-doz',
            telegram: 'https://t.me/Daidoza',
            wiki: 'wiki.html#a12s',
            builds: [
                {
                    id: 'v4.1',
                    label: 'V4.1 [Beta]',
                    version: 'V4.1',
                    tag: 'Beta',
                    url: 'https://pixeldrain.com/u/SzV3xrGS',
                    info: 'Early-access',
                    base: 'One UI 9',
                    android: 'Android 17',
                    screenshots: 'v4.1',
                    banner: 3,
                    highlights: [
                        'Beta firmware based on M36 5G',
                        'Initial early-access release',
                        'Expect rough edges on this beta'
                    ]
                },
                {
                    id: 'v3.5.3',
                    label: 'V3.5.3 [Winter]',
                    version: 'V3.5.3',
                    tag: 'Winter',
                    url: 'https://drive.google.com/file/d/19fKb34Fvma1bgD3dTNh6sNcbHg-RZ6Sm/view?usp=drive_link',
                    info: 'Previous stable build',
                    base: 'One UI 8.5',
                    android: 'Android 16',
                    screenshots: 'v3.5.3',
                    banner: 3,
                    highlights: [
                        'New Exclusive settings',
                        'Vulkan is toggleable',
                        'Fixed Kernel Panic on deep sleep [PDozGKRNL]',
                        'IMEI hidden with tap to view'
                    ]
                }
            ]
        },
        {
            id: 'a22',
            name: 'Galaxy A22',
            model: 'SM-A225F/M',
            chipset: 'MediaTek Helio G80',
            maintainer: 'Lucasz',
            telegram: 'https://t.me/lucaszthelarper',
            wiki: 'wiki.html#a22',
            builds: [
                {
                    id: 'v4.1',
                    label: 'V4.1 [Beta]',
                    version: 'V4.1',
                    tag: 'Beta',
                    url: '',
                    info: 'Coming soon',
                    base: 'One UI 9',
                    android: 'Android 17',
                    screenshots: 'v4.1',
                    banner: 3,
                    highlights: [
                        'In development for Galaxy A22',
                        'One UI 9 / Android 17 base',
                        'Download link will appear here when ready'
                    ]
                },
                {
                    id: 'v3.5.3',
                    label: 'V3.5.3 [Falcon]',
                    version: 'V3.5.3',
                    tag: 'Falcon',
                    url: 'https://drive.google.com/file/d/1TqwHqgyYLVS3qVfp9qVeOCt9yiM51TzU/view?usp=sharing',
                    info: 'Previous stable build',
                    base: 'One UI 8.5',
                    android: 'Android 16',
                    screenshots: 'v3.5.3',
                    banner: 3,
                    highlights: [
                        'New Exclusive settings',
                        'Vulkan is toggleable',
                        'Fixed Kernel Panic on deep sleep [PDozGKRNL]',
                        'Falcon release for MediaTek devices'
                    ]
                }
            ]
        }
    ];

    function hostLabel(url) {
        if (!url) return 'Coming soon';
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch (e) {
            return 'External download';
        }
    }

    const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>';
    const CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2"/></svg>';

    function buildHref(device, build) {
        return `build.html?device=${encodeURIComponent(device.id)}&build=${encodeURIComponent(build.id)}`;
    }

    /* One clickable version row, shared by the Devices page and build page. */
    function buildRow(device, build) {
        const available = Boolean(build.url);

        const row = document.createElement('a');
        row.className = `build-row${available ? '' : ' soon'}`;
        row.href = buildHref(device, build);
        row.setAttribute('aria-label', `${build.label} for ${device.name}${available ? '' : ' — coming soon'}`);

        const copy = document.createElement('span');
        copy.className = 'build-row-copy';

        const title = document.createElement('span');
        title.className = 'build-row-title';
        title.append(build.version);

        const pill = document.createElement('span');
        pill.className = 'build-pill';
        pill.textContent = build.tag;
        title.append(pill);

        const meta = document.createElement('span');
        meta.className = 'build-row-meta';
        meta.textContent = available
            ? `${build.info} · ${hostLabel(build.url)}`
            : build.info;

        copy.append(title, meta);

        const icon = document.createElement('span');
        icon.className = 'build-row-arrow';
        icon.innerHTML = available ? ARROW : CLOCK;

        row.append(copy, icon);
        return row;
    }

    function getDevice(id) {
        return devices.find((device) => device.id === id) || null;
    }

    /* Resolve a ?device=&build= pair. Falls back to the first device/build when
       both params are absent, and finds the device when only a build id is given. */
    function getBuild(deviceId, buildId) {
        let device = null;

        if (deviceId) {
            device = getDevice(deviceId);
        } else if (buildId) {
            device = devices.find((d) => d.builds.some((b) => b.id === buildId)) || null;
        } else {
            device = devices[0] || null;
        }

        if (!device) return null;
        const build = buildId
            ? device.builds.find((b) => b.id === buildId)
            : device.builds[0];

        return build ? { device, build } : null;
    }

    window.ProjectDozG = {
        devices,
        getDevice,
        getBuild,
        hostLabel,
        buildHref,
        buildRow
    };
})();
