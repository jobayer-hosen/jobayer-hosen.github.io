// =============================================================================
// site.js — the behaviour shared by every page.
//
// In this file, in order (search for the heading to jump there):
//   Header ................ shadow, hide on scroll down, progress bar
//   Mobile menu
//   Reveal on scroll ...... sections fade in as they appear
//   Highlight the nav link
//   Accordions ............ click to open (experience)
//   Lightbox .............. full-screen photo viewer
//   Glow .................. soft outline that follows the pointer on cards
//   Typed, rotating words . the line under the name on the home page
//   Wind animation ........ flowing lines on any <canvas data-wind>
//   Live sea .............. moving water in the opening photo (data-water)
//   Scroll scenes ......... name zoom opening (data-opening), sideways
//                           projects (data-hscroll), self-drawing lines (data-draw)
//   Footer year
//
// Nothing here needs editing to change text or photos; those live in the HTML
// pages and in journal/entries.js.
// =============================================================================
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
        document.documentElement.style.overflow = open ? 'hidden' : '';   // stop the page scrolling behind the menu
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
            setTimeout(measureScenes, 400);   // the page got taller or shorter: re-measure the scroll effects
        });
    });

    // --- Lightbox: any link with data-lightbox opens its image full screen.
    //     Links sharing the same data-lightbox name form a set you can step through. ---
    let box = null, boxLinks = [], boxIndex = 0;
    function closeBox() { if (box) { box.classList.remove('is-open'); document.documentElement.style.overflow = ''; } }
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
        document.documentElement.style.overflow = 'hidden';
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

    // --- Live sea: the water in the opening photo keeps moving, like a live wallpaper ---
    // A photo with data-water="mask.png" gets a canvas laid over it that redraws the photo with
    // gentle swells and ripples. In the mask, white is water that may move; black (sky, people,
    // rocks) stays still. data-horizon is where the sea meets the sky (0 = top, 1 = bottom).
    function initSea(photo) {
        const canvas = document.createElement('canvas');
        canvas.className = 'opening-sea';
        canvas.setAttribute('aria-hidden', 'true');
        const gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false });
        if (!gl) return null;
        photo.after(canvas);
        const horizon = parseFloat(photo.dataset.horizon || '0.58');

        const vs = 'attribute vec2 p; varying vec2 v; void main(){ v = p; gl_Position = vec4(p, 0.0, 1.0); }';
        const fs = [
            '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
            'uniform sampler2D photo, mask; uniform vec2 view, img; uniform vec4 fit; uniform float time, horizon;',
            'varying vec2 v;',
            'float hash(vec2 q){ return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }',
            'float noise(vec2 q){ vec2 i = floor(q), f = fract(q); f = f * f * (3.0 - 2.0 * f);',
            '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }',
            'void main(){',
            '  vec2 px = vec2(v.x * 0.5 + 0.5, 0.5 - v.y * 0.5) * view;',          // canvas pixel, y down
            '  vec2 uv = (px - fit.xy) / fit.zw;',                                   // place in the photo, 0..1
            '  float m = texture2D(mask, uv).r;',
            '  vec2 d = vec2(0.0); float shine = 0.0;',
            '  if (m > 0.004) {',
            '    float n = clamp((uv.y - horizon) / (1.0 - horizon), 0.0, 1.0);',   // 0 far out, 1 at the shore
            '    float z = 1.0 / max(n, 0.03);',                                    // distance out to sea
            '    float x = (uv.x - 0.5) * (img.x / img.y) * z;',                    // across the sea
            '    float bend = noise(vec2(x * 0.35, z * 0.25 - time * 0.02)) * 6.2832;',
            '    float ph = z * 7.0 + time * 1.15 + bend;',                         // swells rolling in to the shore
            '    vec2 q = vec2(x * 5.0, z * 5.0 + time * 0.8);',
            '    float r1 = noise(q) - 0.5, r2 = noise(q * 1.9 + vec2(17.0, -time * 0.35)) - 0.5;',
            '    d = vec2(r2 * 5.5 + cos(ph) * 2.6, sin(ph) * 9.0 + r1 * 5.5) * n * m;',  // in photo pixels
            '    shine = sin(ph) * n * m * 0.08;',
            '  }',
            '  vec3 c = texture2D(photo, uv + d / img).rgb;',
            '  gl_FragColor = vec4(c * (1.0 + shine), 1.0);',
            '}'
        ].join('\n');
        const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
        const prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return null; }
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);   // one big triangle
        const loc = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const u = name => gl.getUniformLocation(prog, name);
        gl.uniform1i(u('photo'), 0);
        gl.uniform1i(u('mask'), 1);
        gl.uniform1f(u('horizon'), horizon);

        const texture = (unit, image) => {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        };
        const loaded = img => new Promise((ok, fail) => {
            if (img.complete && img.naturalWidth) ok(img);
            else { img.addEventListener('load', () => ok(img), { once: true }); img.addEventListener('error', fail, { once: true }); }
        });
        const maskImg = new Image();
        maskImg.src = photo.dataset.water;

        let ready = false, raf = null, visible = false, last = 0;
        function resize() {
            if (!ready) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
            if (!w || !h) return;
            if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
            gl.viewport(0, 0, w, h);
            // the same "cover" fit and focus point as the photo itself
            const iw = photo.naturalWidth, ih = photo.naturalHeight, k = Math.max(w / iw, h / ih);
            const pos = (getComputedStyle(photo).objectPosition || '50% 50%').split(' ').map(s => parseFloat(s) / 100);
            gl.uniform2f(u('view'), w, h);
            gl.uniform2f(u('img'), iw, ih);
            gl.uniform4f(u('fit'), (w - iw * k) * (isNaN(pos[0]) ? 0.5 : pos[0]), (h - ih * k) * (isNaN(pos[1]) ? 0.5 : pos[1]), iw * k, ih * k);
        }
        function draw(now) {
            gl.uniform1f(u('time'), (now / 1000) % 3600);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        function loop(now) {
            raf = requestAnimationFrame(loop);
            if (now - last < 32) return;                                  // about 30 frames a second is plenty
            last = now;
            draw(now);
        }
        function start() { if (ready && !raf && visible && !document.hidden) raf = requestAnimationFrame(loop); }
        function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

        Promise.all([loaded(photo), loaded(maskImg)]).then(() => {
            texture(0, photo);
            texture(1, maskImg);
            ready = true;
            resize();
            draw(performance.now());
            canvas.classList.add('is-ready');
            start();
        }).catch(() => canvas.remove());
        let resizeTimer;
        window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { resize(); if (ready) draw(performance.now()); }, 150); });
        document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) start(); else stop(); }).observe(canvas);
        } else { visible = true; start(); }
        return canvas;
    }
    const seaPhoto = !reduceMotion && document.querySelector('.opening-photo[data-water]');
    const seaCanvas = seaPhoto ? initSea(seaPhoto) : null;

    // =====================================================================
    // Scroll scenes: effects that follow how far you have scrolled.
    // Each scene has "measure" (how far through it you are, 0 to 1) and
    // "apply" (draw that moment). Values are smoothed a little so that
    // mouse-wheel steps look fluid.
    // =====================================================================
    const clamp = (v, a, b) => Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v));
    const span = (v, a, b) => clamp((v - a) / (b - a));           // 0 → 1 while v goes from a to b
    const ease = t => t * t * (3 - 2 * t);
    const vh = () => window.innerHeight;
    const scenes = [];
    const addScene = (measure, apply) => scenes.push({ measure, apply, cur: null, target: 0, last: null });
    // How far a tall section has been scrolled while its ".pin" stays stuck to the screen
    const pinProgress = el => () => {
        const r = el.getBoundingClientRect();
        const total = r.height - vh();
        return total > 0 ? clamp(-r.top / total) : 0;
    };

    // --- Opening: fly through the name into the photo ---
    const opening = document.querySelector('[data-opening]');
    if (opening) {
        const word = opening.querySelector('.opening-word'), target = opening.querySelector('.opening-target');
        const mask = opening.querySelector('.opening-mask'), photo = opening.querySelector('.opening-photo');
        const wind = opening.querySelector('.opening-wind'), intro = opening.querySelector('.opening-intro');
        const after = opening.querySelector('.opening-after');
        // Zoom towards the upright stroke of one letter, so that letter ends up filling the screen
        const setOrigin = () => {
            word.style.transformOrigin = (target.offsetLeft + target.offsetWidth * 0.26) + 'px ' + (target.offsetTop + target.offsetHeight * 0.5) + 'px';
        };
        setOrigin();
        window.addEventListener('resize', setOrigin);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(setOrigin);
        addScene(pinProgress(opening), p => {
            let gone;                                             // the point where the dark sheet has fully cleared
            if (reduceMotion) {                                   // no zoom: the name simply fades into the photo
                mask.style.opacity = (1 - span(p, 0.3, 0.6)).toFixed(3);
                gone = 0.6;
            } else {
                const z = span(p, 0.04, 0.74);
                word.style.transform = 'scale(' + Math.exp(z * z * Math.log(70)).toFixed(3) + ')';
                mask.style.opacity = (1 - span(p, 0.7, 0.8)).toFixed(3);
                photo.style.transform = 'scale(' + (1.18 - p * 0.18).toFixed(4) + ')';
                if (seaCanvas) seaCanvas.style.transform = photo.style.transform;   // the moving sea follows the photo
                gone = 0.8;
            }
            mask.style.visibility = p >= gone ? 'hidden' : 'visible';   // stop drawing the giant letters once they are gone
            const windOn = 1 - span(p, 0.2, 0.55);
            wind.style.opacity = (windOn * 0.7).toFixed(3);
            wind.style.visibility = windOn > 0 ? 'visible' : 'hidden';
            const introOn = 1 - span(p, 0.01, 0.1);
            intro.style.opacity = introOn.toFixed(3);
            intro.style.visibility = introOn > 0 ? 'visible' : 'hidden';
            const a = ease(span(p, gone, gone + 0.13));
            after.style.opacity = a.toFixed(3);
            after.style.transform = 'translateY(' + ((1 - a) * 28).toFixed(1) + 'px)';
            after.classList.toggle('is-live', a > 0.5);
        });
    }

    // --- Sideways sections: you scroll down, the cards move across ---
    document.querySelectorAll('[data-hscroll]').forEach(scene => {
        const pin = scene.querySelector('.pin'), track = scene.querySelector('.h-track');
        const bar = scene.querySelector('.h-bar i'), count = scene.querySelector('.hscroll-count b');
        if (!pin || !track) return;
        const cards = [...track.children];
        let max = 0, travel = -1;
        addScene(() => {
            // The section is one screen tall plus the distance the cards have to travel
            max = Math.max(0, track.offsetWidth - pin.clientWidth);
            const want = Math.round(max * 1.3);
            if (want !== travel) { travel = want; scene.style.height = 'calc(100vh + ' + want + 'px)'; }
            return pinProgress(scene)();
        }, p => {
            const q = span(p, 0.04, 0.96);
            track.style.transform = 'translate3d(' + (-q * max).toFixed(1) + 'px,0,0)';
            if (bar) bar.style.transform = 'scaleX(' + q.toFixed(4) + ')';
            if (count) count.textContent = String(Math.round(q * (cards.length - 1)) + 1).padStart(2, '0');
        });
        // Keyboard users: when a card gets focus, scroll to the point where that card is on screen
        track.addEventListener('focusin', (e) => {
            const card = e.target.closest('.h-card');
            if (!card || !e.target.matches(':focus-visible')) return;
            const i = cards.indexOf(card);
            const p = 0.04 + 0.92 * (cards.length > 1 ? i / (cards.length - 1) : 0);
            const top = scene.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: top + p * (scene.offsetHeight - vh()), behavior: 'auto' });
            pin.scrollLeft = 0;
        });
    });

    // --- A line that draws itself down a list and switches each step on as it arrives ---
    document.querySelectorAll('[data-draw]').forEach(box => {
        const steps = [...box.children].filter(el => el.matches('.timeline-item, .pipeline-step'));
        if (steps.length < 2) return;
        const line = document.createElement('span');
        const fill = document.createElement('i');
        line.className = 'draw-line';
        line.setAttribute('aria-hidden', 'true');
        line.append(fill);
        box.append(line);
        box.classList.add('draw-ready');
        // Where the centre of a step's dot (or number box) sits, measured from the top of the list
        const dotY = step => {
            const num = step.querySelector('.step-num');
            return step.offsetTop + (num ? num.offsetTop + num.offsetHeight / 2 : 34);
        };
        let top = 0, length = 0, dots = [];
        addScene(() => {
            dots = steps.map(dotY);
            top = dots[0];
            length = dots[dots.length - 1] - top;
            const r = box.getBoundingClientRect();
            return length > 0 ? clamp((vh() * 0.62 - (r.top + top)) / length) : 0;
        }, f => {
            line.style.top = top + 'px';
            line.style.height = length + 'px';
            fill.style.transform = 'scaleY(' + f.toFixed(4) + ')';
            const y = top + f * length;
            steps.forEach((step, i) => {
                const on = span(y, dots[i] - 30, dots[i] + 6);
                step.style.setProperty('--on', on.toFixed(3));
                step.classList.toggle('is-on', on > 0.6);
            });
        });
    });

    // --- Run the scenes ---
    let scenesRunning = false;
    function nextFrame(cb) {
        let done = false;
        const run = () => { if (!done) { done = true; cb(); } };
        requestAnimationFrame(run);
        setTimeout(run, 60);                                      // keeps things moving if the browser is not drawing frames
    }
    function sceneFrame() {
        let moving = false;
        for (const s of scenes) {
            if (s.cur === null) s.cur = s.target;
            const d = s.target - s.cur;
            if (Math.abs(d) > 0.0005) { s.cur += d * 0.16; moving = true; } else s.cur = s.target;
            if (s.cur !== s.last) { s.apply(s.cur); s.last = s.cur; }
        }
        if (moving) nextFrame(sceneFrame); else scenesRunning = false;
    }
    function measureScenes() {
        if (!scenes.length) return;
        for (const s of scenes) s.target = s.measure();
        if (!scenesRunning) { scenesRunning = true; nextFrame(sceneFrame); }
    }
    // Jump straight to the right state (used on load and when the window changes size)
    function settleScenes() {
        for (const s of scenes) { s.target = s.measure(); s.cur = s.target; s.apply(s.cur); s.last = s.cur; }
    }
    if (scenes.length) {
        window.addEventListener('scroll', measureScenes, { passive: true });
        window.addEventListener('resize', settleScenes);
        window.addEventListener('load', settleScenes);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(settleScenes);
        settleScenes();
        settleScenes();   // a second pass: the first one may have changed section heights
    }

    // --- Footer year ---
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

    observeReveals();
    onScroll();

    // Let journal.js reveal content it adds after load
    window.Site = { observeReveals: observeReveals, settleScenes: settleScenes };
})();
