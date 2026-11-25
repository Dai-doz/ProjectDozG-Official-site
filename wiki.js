/* Wiki page: tabs (deep-linkable, e.g. wiki.html#a22) and the shared install guide.
   The guide is written once in <template id="install-guide"> and copied into every
   device panel, filling in the device name from the panel's data attributes. */
(() => {
    'use strict';

    const tabs = document.querySelectorAll('.tab[data-tab]');
    const panels = document.querySelectorAll('.wiki-panel');
    const template = document.getElementById('install-guide');
    if (!tabs.length || !panels.length) return;

    /* Install guide */
    if (template) {
        document.querySelectorAll('[data-install]').forEach((host) => {
            const panel = host.closest('.wiki-panel');
            const guide = template.content.cloneNode(true);
            guide.querySelectorAll('[data-device]').forEach((el) => { el.textContent = panel.dataset.device; });
            guide.querySelectorAll('[data-short]').forEach((el) => { el.textContent = panel.dataset.short; });
            host.replaceWith(guide);
        });
    }

    /* Tabs */
    const firstTab = tabs[0].dataset.tab;

    function select(name, updateHash) {
        const active = [...tabs].some((t) => t.dataset.tab === name) ? name : firstTab;

        tabs.forEach((tab) => {
            const on = tab.dataset.tab === active;
            tab.classList.toggle('active', on);
            tab.setAttribute('aria-selected', String(on));
        });
        panels.forEach((panel) => { panel.hidden = panel.id !== `tab-${active}`; });

        if (updateHash) {
            try { history.replaceState(null, '', `#${active}`); } catch (e) { /* ignore */ }
        }
    }

    tabs.forEach((tab) => tab.addEventListener('click', () => select(tab.dataset.tab, true)));
    window.addEventListener('hashchange', () => select(location.hash.slice(1)));
    select(location.hash.slice(1));
})();
