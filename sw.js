/* DJFL 4 service worker.
 *
 * Offline: the app shell is cached on first visit, so it opens with no signal.
 * Updates: the page itself is fetched network-first with a short timeout, so anyone
 * with a connection gets the newest version on their next open, and anyone without
 * one gets the copy from last time. Bump VERSION when shipping to purge old caches.
 */
var VERSION = '2026.09.14.2';
var CACHE = 'djfl4-' + VERSION;
var SHELL = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];
var NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;           // CDN scripts etc. are left alone
  if (e.request.method !== 'GET') return;
  var isPage = e.request.mode === 'navigate' || /\/(index\.html)?$/.test(url.pathname);
  e.respondWith(isPage ? pageNetworkFirst(e.request) : assetCacheFirst(e.request));
});

function pageNetworkFirst(req) {
  return caches.open(CACHE).then(function (cache) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, NETWORK_TIMEOUT_MS) : null;
    var opts = { cache: 'no-store' };
    if (ctrl) opts.signal = ctrl.signal;
    return fetch(req, opts).then(function (res) {
      if (timer) clearTimeout(timer);
      if (res && res.ok) {
        cache.put('./index.html', res.clone());
        cache.put('./', res.clone());
      }
      return res;
    }).catch(function () {
      if (timer) clearTimeout(timer);
      return cache.match('./index.html').then(function (hit) {
        return hit || cache.match('./');
      }).then(function (hit) {
        return hit || new Response('Offline and no saved copy yet. Open once with a connection.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      });
    });
  });
}

function assetCacheFirst(req) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      });
    });
  });
}

// The page asks for this right before it reloads to pick up a new version.
self.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'refresh') return;
  var client = e.source;
  var pageUrl = new URL('index.html?u=' + Date.now(), self.registration.scope).href;
  caches.open(CACHE).then(function (cache) {
    return fetch(pageUrl, { cache: 'no-store' }).then(function (res) {
      if (res && res.ok) return Promise.all([cache.put('./index.html', res.clone()), cache.put('./', res.clone())]);
    });
  }).catch(function () {}).then(function () {
    if (client) client.postMessage({ type: 'refreshed' });
  });
});
