// Minimal service worker so browsers offer "Install app". It caches nothing:
// duties and logins always come live from the server.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
