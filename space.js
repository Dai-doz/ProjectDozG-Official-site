/* ProjectDozG — space background.
   Twinkling stars, shooting stars and the Android 14-17 logos drifting across
   the screen, all drawn on a single fixed <canvas id="space">.
   Respects prefers-reduced-motion (draws one still frame) and pauses when the tab is hidden. */
(() => {
    'use strict';

    const canvas = document.getElementById('space');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const root = document.documentElement;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const TAU = Math.PI * 2;

    /* The flying logos. To change one, replace its image in images/android/
       (square, transparent background) or edit this list. `glow` is the soft colour behind it. */
    const LOGOS = [
        { src: 'assets/android/android-14.webp', glow: '#f96a38' },
        { src: 'assets/android/android-15.webp', glow: '#34a853' },
        { src: 'assets/android/android-16.webp', glow: '#4285f4' },
        { src: 'assets/android/android-17.webp', glow: '#b01f80' }
    ];

    let w = 0;
    let h = 0;
    let dpr = 1;
    let time = 0;
    let last = 0;
    let rafId = 0;
    let isLight = root.dataset.theme === 'light';
    let stars = [];
    let flyers = [];
    let shooter = null;
    let nextShooter = 3;

    const rand = (min, max) => min + Math.random() * (max - min);

    function rgba(hex, alpha) {
        const n = parseInt(hex.slice(1), 16);
        return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
    }

    /* ---- Stars ---- */
    function seedStars() {
        const count = Math.min(260, Math.round((w * h) / 6500));
        stars = Array.from({ length: count }, () => {
            const size = Math.random();
            const r = size > 0.92 ? 1.7 : size > 0.6 ? 1.15 : 0.7;
            return {
                x: rand(0, w),
                y: rand(0, h),
                r,
                alpha: rand(0.35, 0.95),
                speed: 1 + r * 5,          // bigger stars are "closer", so they drift faster
                twinkle: rand(0.8, 3),
                phase: rand(0, TAU)
            };
        });
    }

    /* ---- Logos (pre-rendered to small sprites, so each frame is just drawImage) ---- */
    function logoSize() {
        return w < 600 ? 56 : Math.min(110, Math.max(72, w * 0.075));
    }

    function makeSprite(img, glow, size) {
        const pad = size * 0.35;
        const total = size + pad * 2;
        const sprite = document.createElement('canvas');
        sprite.width = Math.ceil(total * dpr);
        sprite.height = Math.ceil(total * dpr);

        const g = sprite.getContext('2d');
        g.scale(dpr, dpr);
        const c = total / 2;

        const halo = g.createRadialGradient(c, c, size * 0.25, c, c, total / 2);
        halo.addColorStop(0, rgba(glow, isLight ? 0.3 : 0.4));
        halo.addColorStop(1, rgba(glow, 0));
        g.fillStyle = halo;
        g.fillRect(0, 0, total, total);

        g.imageSmoothingQuality = 'high';
        g.drawImage(img, pad, pad, size, size);

        return { canvas: sprite, size: total };
    }

    function buildSprites() {
        const size = logoSize();
        flyers.forEach((f) => {
            if (f.img.complete && f.img.naturalWidth) f.sprite = makeSprite(f.img, f.glow, size);
        });
    }

    function seedFlyers() {
        flyers = LOGOS.map((logo, i) => {
            const img = new Image();
            img.decoding = 'async';
            const flyer = { img, glow: logo.glow, sprite: null };
            img.onload = () => {
                flyer.sprite = makeSprite(img, logo.glow, logoSize());
                if (motion.matches) draw();
            };
            img.src = logo.src;

            const angle = rand(0, TAU);
            const speed = rand(14, 28);
            Object.assign(flyer, {
                x: ((i + 0.5) / LOGOS.length) * w,
                y: h * rand(0.2, 0.8),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed * 0.5,
                phase: rand(0, TAU)
            });
            return flyer;
        });
    }

    /* ---- Simulation ---- */
    function step(dt) {
        for (const s of stars) {
            s.x -= s.speed * dt;
            if (s.x < -2) {
                s.x = w + 2;
                s.y = rand(0, h);
            }
        }

        const m = logoSize() * 1.5;
        for (const f of flyers) {
            f.x += f.vx * dt;
            f.y += f.vy * dt;
            if (f.x < -m) f.x = w + m;
            else if (f.x > w + m) f.x = -m;
            if (f.y < -m) f.y = h + m;
            else if (f.y > h + m) f.y = -m;
        }

        if (shooter) {
            shooter.x += shooter.vx * dt;
            shooter.y += shooter.vy * dt;
            shooter.life -= dt;
            if (shooter.life <= 0) shooter = null;
        } else {
            nextShooter -= dt;
            if (nextShooter <= 0) {
                nextShooter = rand(5, 10);
                shooter = { x: rand(w * 0.3, w), y: rand(0, h * 0.4), vx: -650, vy: 330, life: 0.9, max: 0.9 };
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        const rgb = isLight ? '99, 102, 241' : '255, 255, 255';
        const strength = isLight ? 0.55 : 1;
        ctx.fillStyle = `rgb(${rgb})`;   // set once; each star only changes globalAlpha
        for (const s of stars) {
            ctx.globalAlpha = s.alpha * strength * (0.65 + 0.35 * Math.sin(time * s.twinkle + s.phase));
            if (s.r > 1) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, TAU);
                ctx.fill();
            } else {
                ctx.fillRect(s.x, s.y, s.r * 1.6, s.r * 1.6);
            }
        }

        ctx.globalAlpha = 1;

        if (shooter) {
            const fade = Math.min(1, shooter.life / shooter.max * 2);
            const len = 150;
            const speed = Math.hypot(shooter.vx, shooter.vy);
            const nx = shooter.vx / speed;
            const ny = shooter.vy / speed;
            const tail = ctx.createLinearGradient(shooter.x, shooter.y, shooter.x - nx * len, shooter.y - ny * len);
            tail.addColorStop(0, `rgba(${rgb}, ${0.9 * fade})`);
            tail.addColorStop(1, `rgba(${rgb}, 0)`);
            ctx.strokeStyle = tail;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(shooter.x, shooter.y);
            ctx.lineTo(shooter.x - nx * len, shooter.y - ny * len);
            ctx.stroke();
        }

        ctx.globalAlpha = w < 600 ? 0.6 : 0.88;   // lets text stay readable when a logo drifts behind it
        for (const f of flyers) {
            if (!f.sprite) continue;
            const bob = Math.sin(time * 0.6 + f.phase) * 8;
            const tilt = Math.sin(time * 0.35 + f.phase) * 0.22;   // gentle rocking, never upside down
            ctx.save();
            ctx.translate(f.x, f.y + bob);
            ctx.rotate(tilt);
            ctx.drawImage(f.sprite.canvas, -f.sprite.size / 2, -f.sprite.size / 2, f.sprite.size, f.sprite.size);
            ctx.restore();
        }
        ctx.globalAlpha = 1;
    }

    /* ---- Loop ---- */
    function frame(now) {
        const dt = Math.min(0.05, (now - last) / 1000 || 0);
        last = now;
        time += dt;
        step(dt);
        draw();
        rafId = requestAnimationFrame(frame);
    }

    function start() {
        cancelAnimationFrame(rafId);
        if (motion.matches) {
            draw();                       // one still frame
            return;
        }
        last = performance.now();
        rafId = requestAnimationFrame(frame);
    }

    /* ---- Setup / events ---- */
    function resize() {
        const prevW = w;
        const prevH = h;
        const nextW = window.innerWidth;
        const nextH = window.innerHeight;

        // Mobile browsers resize slightly while the address bar hides: ignore that.
        if (prevW === nextW && Math.abs(prevH - nextH) < 150) return;

        dpr = Math.min(2, window.devicePixelRatio || 1);
        w = nextW;
        h = nextH;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        seedStars();
        if (flyers.length) {
            flyers.forEach((f) => {
                f.x = (f.x / prevW) * w;
                f.y = (f.y / prevH) * h;
            });
            buildSprites();
        } else {
            seedFlyers();
        }
        if (motion.matches) draw();
    }

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });

    // Light/dark switch changes the glow strength and star colour
    new MutationObserver(() => {
        isLight = root.dataset.theme === 'light';
        buildSprites();
        if (motion.matches) draw();
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    motion.addEventListener('change', start);

    resize();
    start();
})();
