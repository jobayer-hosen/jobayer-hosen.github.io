// Shared behaviour for every page: header, mobile menu, scroll progress, scroll reveal,
// active nav link, accordions, image lightbox, wind animation, counters and typed text.
(function () {
    document.documentElement.classList.remove('no-js');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;

    // --- Header: shadow once scrolled, hide when scrolling down; scroll progress bar ---
    const header = document.querySelector('.site-header');
    const progress = document.getElementById('scroll-progress');
    let lastY = window.scrollY;
    let ticking = false;
    function onScroll() {
        const y = window.scrollY;
        if (header) {
            header.classList.toggle('is-scrolled', y > 10);
            const menuOpen = document.body.classList.contains('menu-open');
            header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 300);
        }
        if (progress) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
        }
        lastY = y;
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });

    // --- Mobile menu ---
    const menuButton = document.getElementById('menu-button');
    const menu = document.getElementById('mobile-menu');
    function setMenu(open) {
        if (!menu || !menuButton) return;
        menu.classList.toggle('is-open', open);
        document.body.classList.toggle('menu-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menuButton.querySelector('i').className = open ? 'fas fa-xmark text-lg' : 'fas fa-bars text-lg';
        menu.setAttribute('aria-hidden', String(!open));
        if (open && header) header.classList.remove('is-hidden');
    }
    if (menuButton && menu) {
        menu.querySelectorAll('nav a').forEach((a, i) => a.style.setProperty('--i', i));
        menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
        menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
        window.addEventListener('resize', () => { if (window.innerWidth >= 1024) setMenu(false); });
    }

    // --- Reveal on scroll (also used for content added later by journal.js) ---
    let revealObserver = null;
    if ('IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    }
    function observeReveals(root) {
        (root || document).querySelectorAll('.reveal-group').forEach(group => {
            group.querySelectorAll('.reveal-item').forEach((item, i) => item.style.setProperty('--i', i));
        });
        (root || document).querySelectorAll('.reveal, .reveal-group').forEach(el => {
            if (el.classList.contains('is-visible')) return;
            if (revealObserver) revealObserver.observe(el); else el.classList.add('is-visible');
        });
    }

    // --- Highlight the nav link for the section in view ---
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (navLinks.length && 'IntersectionObserver' in window) {
        const byId = {};
        navLinks.forEach(link => { byId[link.getAttribute('href').slice(1)] = link; });
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && byId[entry.target.id]) {
                    navLinks.forEach(l => l.classList.remove('is-active'));
                    byId[entry.target.id].classList.add('is-active');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(byId).forEach(id => {
            const section = document.getElementById(id);
            if (section) sectionObserver.observe(section);
        });
    }

    // --- Accordions ---
    document.querySelectorAll('.accordion').forEach(acc => {
        const button = acc.querySelector('.accordion-button');
        if (button) button.addEventListener('click', () => {
            const open = acc.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(open));
        });
    });

    // --- Lightbox: any link with data-lightbox opens its image full screen.
    //     Links sharing the same data-lightbox name form a set you can step through. ---
    let box = null, boxLinks = [], boxIndex = 0;
    function closeBox() { if (box) { box.classList.remove('is-open'); document.body.style.overflow = ''; } }
    function showInBox(i) {
        boxIndex = (i + boxLinks.length) % boxLinks.length;
        const link = boxLinks[boxIndex];
        const img = box.querySelector('img');
        const inner = link.querySelector('img');
        img.src = link.getAttribute('href');
        img.alt = inner ? inner.alt : '';
        box.querySelector('.lightbox-count').textContent = (boxIndex + 1) + ' / ' + boxLinks.length;
        box.classList.toggle('is-single', boxLinks.length < 2);
    }
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-lightbox]');
        if (!link) return;
        e.preventDefault();
        if (!box) {
            box = document.createElement('div');
            box.className = 'lightbox';
            box.setAttribute('role', 'dialog');
            box.setAttribute('aria-modal', 'true');
            box.setAttribute('aria-label', 'Image preview');
            box.innerHTML = '<span class="lightbox-count"></span>'
                + '<button class="lightbox-close" aria-label="Close preview"><i class="fas fa-xmark"></i></button>'
                + '<button class="lightbox-prev" aria-label="Previous photo"><i class="fas fa-chevron-left"></i></button>'
                + '<img alt="">'
                + '<button class="lightbox-next" aria-label="Next photo"><i class="fas fa-chevron-right"></i></button>';
            document.body.appendChild(box);
            box.addEventListener('click', (ev) => {
                if (ev.target.closest('.lightbox-prev')) showInBox(boxIndex - 1);
                else if (ev.target.closest('.lightbox-next')) showInBox(boxIndex + 1);
                else if (ev.target.tagName !== 'IMG') closeBox();
            });
        }
        const name = link.getAttribute('data-lightbox');
        boxLinks = name ? [...document.querySelectorAll('[data-lightbox="' + name.replace(/"/g, '') + '"]')] : [link];
        showInBox(Math.max(0, boxLinks.indexOf(link)));
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => box.classList.add('is-open'));
        box.querySelector('.lightbox-close').focus();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeBox(); setMenu(false); }
        if (box && box.classList.contains('is-open')) {
            if (e.key === 'ArrowLeft') showInBox(boxIndex - 1);
            if (e.key === 'ArrowRight') showInBox(boxIndex + 1);
        }
    });

    // --- Glow that follows the pointer on cards ---
    if (canHover) {
        document.addEventListener('pointermove', (e) => {
            const card = e.target.closest ? e.target.closest('.card') : null;
            if (!card) return;
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        }, { passive: true });
    }

    // --- Count-up numbers: <span data-count="50000" data-suffix="+"> ---
    function runCounter(el) {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        if (reduceMotion) { el.textContent = target.toLocaleString('en-US') + suffix; return; }
        const start = performance.now();
        const duration = 1600;
        (function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
            if (t < 1) requestAnimationFrame(tick);
        })(start);
    }
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { runCounter(entry.target); counterObserver.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        counters.forEach(el => counterObserver.observe(el));
    }

    // --- Typed, rotating words: <span data-typed='["one","two"]'> ---
    document.querySelectorAll('[data-typed]').forEach(el => {
        let words;
        try { words = JSON.parse(el.dataset.typed); } catch (err) { return; }
        if (!words || !words.length) return;
        const text = document.createElement('span');
        const caret = document.createElement('span');
        caret.className = 'typed-caret';
        caret.setAttribute('aria-hidden', 'true');
        el.textContent = '';
        el.append(text, caret);
        el.setAttribute('aria-label', words.join(', '));
        if (reduceMotion) { text.textContent = words[0]; return; }
        let w = 0, i = 0, deleting = false;
        (function step() {
            const word = words[w];
            i += deleting ? -1 : 1;
            text.textContent = word.slice(0, i);
            let delay = deleting ? 35 : 70;
            if (!deleting && i === word.length) { deleting = true; delay = 1700; }
            else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
            setTimeout(step, delay);
        })();
    });

    // --- Wind animation: flowing streamlines drawn on <canvas data-wind> ---
    function initWind(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const colors = ['100,255,218', '185,196,220', '234,241,255'];
        const density = parseFloat(canvas.dataset.density || '1');
        const pointer = { x: -9999, y: -9999 };
        let w = 0, h = 0, particles = [], raf = null, visible = false, time = Math.random() * 100000;

        function spawn(p, atEdge) {
            p.x = atEdge ? -5 : Math.random() * w;
            p.y = Math.random() * h;
            p.life = 80 + Math.random() * 220;
            p.speed = 0.7 + Math.random() * 1.3;
            p.color = colors[(Math.random() * colors.length) | 0];
            p.alpha = 0.18 + Math.random() * 0.4;
            return p;
        }
        function resize() {
            const r = canvas.getBoundingClientRect();
            if (!r.width || !r.height) return;
            const dpr = Math.min(window.devicePixelRatio || 1, r.width < 700 ? 1.5 : 2);
            w = r.width; h = r.height;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.round(Math.min(600, Math.max(80, (w * h) / 3600)) * density);
            particles = Array.from({ length: count }, () => spawn({}, false));
        }
        // Direction of the "wind" at a point: mostly left to right, bending slowly over time
        function angleAt(x, y) {
            const s = 0.0017;
            return (Math.sin(x * s * 1.3 + time * 0.00023) + Math.cos(y * s * 2.1 - time * 0.00019) + Math.sin((x + y) * s * 0.8 + time * 0.00013)) * 0.5;
        }
        function step(fade) {
            time += 16;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0,0,0,' + fade + ')';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = 1.1;
            ctx.lineCap = 'round';
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const a = angleAt(p.x, p.y);
                let vx = Math.cos(a) * p.speed * 1.7;
                let vy = Math.sin(a) * p.speed * 1.7;
                const dx = p.x - pointer.x, dy = p.y - pointer.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < 22500) { // within 150px of the pointer: bend around it
                    const f = (1 - Math.sqrt(d2) / 150) * 2.4;
                    vx += (-dy / 150) * f; vy += (dx / 150) * f;
                }
                const nx = p.x + vx, ny = p.y + vy;
                ctx.strokeStyle = 'rgba(' + p.color + ',' + p.alpha + ')';
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
                p.x = nx; p.y = ny;
                if (--p.life < 0 || nx > w + 10 || nx < -10 || ny < -10 || ny > h + 10) spawn(p, Math.random() < 0.4);
            }
        }
        function loop() { step(0.07); raf = requestAnimationFrame(loop); }
        function start() { if (!raf && visible && !document.hidden && !reduceMotion) raf = requestAnimationFrame(loop); }
        function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

        resize();
        if (reduceMotion) { for (let i = 0; i < 180; i++) step(0.012); return; }
        let resizeTimer;
        window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); });
        document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
        if (canHover) {
            window.addEventListener('pointermove', (e) => {
                const r = canvas.getBoundingClientRect();
                pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
            }, { passive: true });
        }
        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                visible = entries[0].isIntersecting;
                if (visible) start(); else stop();
            }).observe(canvas);
        } else { visible = true; start(); }
    }
    document.querySelectorAll('canvas[data-wind]').forEach(initWind);

    // --- Footer year ---
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

    observeReveals();
    onScroll();

    // Let journal.js reveal content it adds after load
    window.Site = { observeReveals: observeReveals };
})();
