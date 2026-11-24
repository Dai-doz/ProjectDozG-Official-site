// Light & Dark Theme Controller
        const themeToggleBtn = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        const moonIcon = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
        const sunIcon = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;

        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
                themeIcon.innerHTML = savedTheme === 'dark' ? sunIcon : moonIcon;
            } else {
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const activeTheme = systemPrefersDark ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', activeTheme);
                themeIcon.innerHTML = activeTheme === 'dark' ? sunIcon : moonIcon;
            }
        }

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeIcon.innerHTML = newTheme === 'dark' ? sunIcon : moonIcon;
        });

        // Initialize theme state on run
        initTheme();

        // Optimized Intersection Observer for Scroll Motion Reveal
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing once displayed
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.reveal').forEach(element => {
            revealObserver.observe(element);
        });

        // Screenshot lightbox
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        // Delegated so slots created later (version tabs) work too
        if (lightbox) document.addEventListener('click', e => {
            const slot = e.target.closest('.shot-slot');
            if (!slot) return;
            const img = slot.querySelector('img');
            if (!img) return;
            lightboxImg.src = img.src;
            lightbox.classList.add('open');
        });
        if (lightbox) lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && lightbox) lightbox.classList.remove('open');
        });
    
// Highlight current page in nav
(function () {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(a => {
        if (a.getAttribute('href') === page) a.classList.add('active');
    });
})();

// Build picker for device cards
document.querySelectorAll('.device-card[data-builds]').forEach(card => {
    let builds = [];
    try { builds = JSON.parse(card.dataset.builds); } catch (e) {}
    const select = card.querySelector('.build-select');
    const info = card.querySelector('.build-info');
    const link = card.querySelector('.download-link');
    const text = card.querySelector('.download-text');

    if (!builds.length) {
        select.innerHTML = '<option>No builds yet</option>';
        select.disabled = true;
    } else {
        builds.forEach((b, i) => {
            const o = document.createElement('option');
            o.value = i;
            o.textContent = b.label;
            select.appendChild(o);
        });
    }

    function update() {
        const b = builds[select.value || 0];
        if (b && b.url) {
            link.href = b.url;
            link.classList.remove('disabled');
            text.textContent = 'Download ROM';
            info.textContent = b.info || '';
        } else {
            link.removeAttribute('href');
            link.classList.add('disabled');
            text.textContent = 'Coming soon';
            info.textContent = b ? (b.info || '') : '';
        }
    }
    select.addEventListener('change', update);
    update();
});
