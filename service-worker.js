// Bump CACHE_VERSION on every deploy to bust old caches on clients.
const CACHE_VERSION = 'v1';
const CACHE_NAME = `eduquiz-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
    './index.html',
    './manifest.json',
    'css/style.css',
    'css/variables.css',
    'css/base.css',
    'css/layout.css',
    'css/components/home.css',
    'css/components/import.css',
    'css/components/detail.css',
    'css/components/quiz.css',
    'css/components/result.css',
    'js/app.js',
    'js/elements.js',
    'js/store.js',
    'js/components/router.js',
    'js/components/theme.js',
    'js/components/timer.js',
    'js/components/pwa.js',
    'js/utils/error.js',
    'js/utils/helpers.js',
    'js/views/home.js',
    'js/views/import.js',
    'js/views/detail.js',
    'js/views/quiz.js',
    'js/views/result.js',
    'assets/icons/icon.svg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    if (url.origin === self.location.origin) {
        // App shell (HTML/CSS/JS): network-first so users always get the newest
        // build when online; falls back to cache when offline.
        event.respondWith(networkFirst(request));
    } else {
        // Third-party assets (fonts, icon CDN): stale-while-revalidate.
        event.respondWith(staleWhileRevalidate(request));
    }
});

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    try {
        const networkResponse = await fetch(request);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (err) {
        const cached = await cache.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
            const shell = await cache.match('./index.html');
            if (shell) return shell;
        }
        throw err;
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const networkFetch = fetch(request)
        .then((response) => {
            cache.put(request, response.clone());
            return response;
        })
        .catch(() => cached);
    return cached || networkFetch;
}
