// Shared behaviour for every page: header, mobile menu, scroll reveal,
// active nav link, accordions, image lightbox and footer year.
(function () {
    document.documentElement.classList.remove('no-js');

    // --- Header: shadow once scrolled, hide when scrolling down ---
    const header = document.querySelector('.site-header');
    let lastY = window.scrollY;
    function onScroll() {
        const y = window.scrollY;
        if (header) {
            header.classList.toggle('is-scrolled', y > 10);
            const menuOpen = document.body.classList.contains('menu-open');
            header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 200);
        }
        lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- Mobile menu ---
    const menuButton = document.getElementById('menu-button');
    const menu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('menu-backdrop');
    function setMenu(open) {
        if (!menu) return;
        menu.classList.toggle('is-open', open);
        backdrop && backdrop.classList.toggle('is-open', open);
        document.body.classList.toggle('menu-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menuButton.querySelector('i').className = open ? 'fas fa-xmark text-2xl' : 'fas fa-bars text-2xl';
        menu.setAttribute('aria-hidden', String(!open));
    }
    if (menuButton && menu) {
        menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
        backdrop && backdrop.addEventListener('click', () => setMenu(false));
        menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
        window.addEventListener('resize', () => { if (window.innerWidth >= 768) setMenu(false); });
    }

    // --- Reveal sections on scroll ---
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => revealObserver.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
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
            section && sectionObserver.observe(section);
        });
    }

    // --- Accordions ---
    document.querySelectorAll('.accordion').forEach(acc => {
        const button = acc.querySelector('.accordion-button');
        button && button.addEventListener('click', () => {
            const open = acc.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(open));
        });
    });

    // --- Lightbox for gallery images ---
    const galleryLinks = document.querySelectorAll('[data-lightbox]');
    if (galleryLinks.length) {
        const box = document.createElement('div');
        box.className = 'lightbox';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-label', 'Image preview');
        box.innerHTML = '<button class="lightbox-close" aria-label="Close preview"><i class="fas fa-xmark"></i></button><img alt="">';
        document.body.appendChild(box);
        const img = box.querySelector('img');
        const close = () => { box.classList.remove('is-open'); document.body.style.overflow = ''; };
        galleryLinks.forEach(link => link.addEventListener('click', (e) => {
            e.preventDefault();
            img.src = link.getAttribute('href');
            img.alt = link.querySelector('img') ? link.querySelector('img').alt : '';
            box.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            box.querySelector('.lightbox-close').focus();
        }));
        box.addEventListener('click', (e) => { if (e.target !== img) close(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

    // --- Footer year ---
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
