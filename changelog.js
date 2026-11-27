/* Changelog page: channel filters and deep-link highlighting.
   The release entries are plain HTML, so the page still works without JS. */
(() => {
    'use strict';

    const list = document.getElementById('changelogList');
    const filterBar = document.getElementById('changelogFilters');
    if (!list || !filterBar) return;

    const entries = [...list.querySelectorAll('.release-entry')];
    const filters = [...filterBar.querySelectorAll('.changelog-filter')];
    if (!entries.length || !filters.length) return;

    // Filters are progressive enhancement: reveal them only when JS can use them.
    filterBar.hidden = false;

    function applyFilter(filter) {
        entries.forEach((entry) => {
            entry.hidden = filter !== 'all' && entry.dataset.status !== filter;
        });

        filters.forEach((button) => {
            const active = button.dataset.filter === filter;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
    }

    filters.forEach((button) => {
        button.addEventListener('click', () => applyFilter(button.dataset.filter));
    });

    applyFilter('all');

    /* Highlight a release linked as changelog.html#v4.1 */
    function highlightHash() {
        const id = location.hash.slice(1);
        if (!id) return;

        const target = document.getElementById(id);
        if (!target || !target.classList.contains('release-entry')) return;

        // A filtered-out entry should still be visible when linked directly.
        if (target.hidden) applyFilter('all');

        target.classList.add('is-highlighted');
        setTimeout(() => target.classList.remove('is-highlighted'), 2400);
    }

    window.addEventListener('hashchange', highlightHash);
    highlightHash();
})();
