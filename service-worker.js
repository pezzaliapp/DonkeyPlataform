const CACHE = 'donkey-platform-iphone-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js',
  './main.js',
  './Mario.js',
  './DK.js',
  './Barrel.js',
  './Platform.js',
  './Ladder.js',
  './sprites.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k===CACHE?null:caches.delete(k))))); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
