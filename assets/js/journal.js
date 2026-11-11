// Builds the journal from journal/entries.js: the teaser on the home page
// and the feed, map and Goodreads card on the Journal page (journal.html).
(function () {
    const data = window.JOURNAL || {};
    const posts = data.posts || [];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Small helper to build elements safely (text is never treated as HTML)
    function h(tag, props) {
        const el = document.createElement(tag);
        Object.keys(props || {}).forEach(key => {
            const value = props[key];
            if (value == null || value === false) return;
            if (key === 'class') el.className = value;
            else if (key === 'text') el.textContent = value;
            else el.setAttribute(key, value);
        });
        for (let i = 2; i < arguments.length; i++) {
            const child = arguments[i];
            if (child == null || child === false) continue;
            el.append(child);
        }
        return el;
    }
    function icon(name) { return h('i', { class: name, 'aria-hidden': 'true' }); }

    function parseDate(s) {
        const p = String(s || '').split('-').map(Number);
        return p[0] ? { y: p[0], m: p[1] || 0, d: p[2] || 0 } : null;
    }
    function fmtDate(s) {
        const d = parseDate(s);
        if (!d) return '';
        if (!d.m) return String(d.y);
        return (d.d ? d.d + ' ' : '') + MONTHS[d.m - 1] + ' ' + d.y;
    }
    function fmtRange(from, to) {
        const a = parseDate(from), b = parseDate(to);
        if (!a) return '';
        if (!b || from === to) return fmtDate(from);
        if (a.y === b.y && a.m === b.m && a.d && b.d) return a.d + ' – ' + fmtDate(to);
        if (a.y === b.y && a.d) return a.d + ' ' + MONTHS[a.m - 1] + ' – ' + fmtDate(to);
        return fmtDate(from) + ' – ' + fmtDate(to);
    }
    function paragraphs(post) { return Array.isArray(post.text) ? post.text : (post.text ? [post.text] : []); }
    function photoUrls(post) { return (post.photos || []).map(name => (post.folder || '') + name); }
    function metaLine(post) { return [fmtRange(post.date, post.to), post.tag].filter(Boolean).join(' · '); }
    function gridClass(count) {
        return 'photo-grid' + (count === 1 ? ' is-one' : '') + (count >= 3 && count % 2 ? ' is-odd' : '') + (count >= 3 && count !== 4 ? ' is-wide' : '');
    }

    // ------------------------------------------------------------------
    // Home page: latest post
    // ------------------------------------------------------------------
    function renderHomeTeaser() {
        const latest = document.getElementById('journal-latest');
        const photosBox = document.getElementById('journal-photos');
        const post = posts[0];
        if (!post) return;
        const url = 'journal.html#' + encodeURIComponent(post.id);
        if (latest) {
            latest.append(
                h('p', { class: 'font-mono text-xs text-accent', text: 'Latest · ' + metaLine(post) }),
                h('a', { href: url, class: 'block mt-2 text-2xl font-display font-semibold text-ink hover:text-accent transition-colors', text: post.title }),
                h('p', { class: 'mt-2 leading-relaxed', text: paragraphs(post)[0] || '' })
            );
        }
        if (photosBox) {
            const urls = photoUrls(post).slice(0, 3);
            photosBox.className = gridClass(urls.length).replace(' is-wide', '');
            urls.forEach(src => photosBox.append(h('a', { href: url, class: 'photo-tile', style: 'cursor:pointer', 'aria-label': post.title },
                h('img', { src: src, alt: '', loading: 'lazy' }))));
        }
    }

    // ------------------------------------------------------------------
    // Journal page: the feed
    // ------------------------------------------------------------------
    function renderFeed() {
        const feed = document.getElementById('journal-feed');
        if (!feed) return;
        if (!posts.length) {
            feed.append(h('p', { class: 'card p-8 text-center', text: 'Nothing posted yet. The first post is on its way.' }));
            return;
        }
        posts.forEach(post => {
            const urls = photoUrls(post);
            const text = h('div', { class: 'post-text mt-4 text-lg leading-relaxed text-slate-light' });
            paragraphs(post).forEach(p => text.append(h('p', { text: p })));
            const article = h('article', { id: post.id, class: 'card p-6 md:p-8 reveal scroll-mt-28' },
                h('p', { class: 'font-mono text-xs text-accent', text: metaLine(post) }),
                h('h2', { class: 'mt-2 text-2xl md:text-3xl font-semibold text-ink', text: post.title }),
                text);
            if (urls.length) {
                const grid = h('div', { class: gridClass(urls.length) + ' mt-6' });
                urls.forEach((src, i) => grid.append(h('a', { href: src, class: 'photo-tile', 'data-lightbox': post.id },
                    h('img', { src: src, alt: post.title + ', photo ' + (i + 1), loading: 'lazy' }))));
                article.append(grid);
            }
            feed.append(article);
        });
    }

    // ------------------------------------------------------------------
    // Journal page: map of places visited
    // ------------------------------------------------------------------
    function renderMap() {
        const box = document.getElementById('journal-map');
        if (!box || !data.map || !data.map.image) return;
        box.append(
            h('h2', { class: 'font-display font-semibold text-ink', text: "Where I've been" }),
            data.map.caption ? h('p', { class: 'mt-1 text-sm', text: data.map.caption }) : null,
            h('a', { href: data.map.image, 'data-lightbox': 'map', class: 'block mt-4', style: 'cursor:zoom-in' },
                h('img', { src: data.map.image, alt: 'Map of Bangladesh with the districts I have visited highlighted', loading: 'lazy' }))
        );
        box.hidden = false;
    }

    // ------------------------------------------------------------------
    // Journal page: Goodreads card. The "currently reading" list comes
    // straight from Goodreads' own widget, so it stays up to date by itself.
    // ------------------------------------------------------------------
    function renderReading() {
        const box = document.getElementById('journal-reading');
        if (!box || !data.goodreads) return;
        box.append(h('h2', { class: 'font-display font-semibold text-ink flex items-center gap-2' }, icon('fab fa-goodreads-g text-accent'), ' Reading now'));
        if (data.goodreadsId) {
            const widgetId = '1794300000';
            const holder = h('div', { class: 'gr-widget mt-2' }, h('div', { id: 'gr_custom_widget_' + widgetId }));
            const script = h('script', {
                src: 'https://www.goodreads.com/review/custom_widget/' + encodeURIComponent(data.goodreadsId) + '.Currently%20reading'
                    + '?cover_position=left&cover_size=small&num_books=5&order=d&shelf=currently-reading&show_author=1&show_cover=1'
                    + '&show_rating=0&show_review=0&show_tags=0&show_title=1&sort=date_added&widget_bg_transparent=true'
                    + '&widget_border_width=none&widget_id=' + widgetId + '&widget_title_size=small&widget_width=full',
                async: '',
            });
            script.addEventListener('error', () => holder.remove());
            script.addEventListener('load', () => holder.querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'noopener nofollow'; }));
            box.append(holder);
            document.body.append(script);
        }
        box.append(h('a', { href: data.goodreads, target: '_blank', rel: 'noopener', class: 'mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline' },
            'My books and reviews on Goodreads ', icon('fas fa-arrow-up-right-from-square text-xs')));
        box.hidden = false;
    }

    renderHomeTeaser();
    renderFeed();
    renderMap();
    renderReading();
})();
