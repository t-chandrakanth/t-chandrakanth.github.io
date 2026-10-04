// Service worker: lets browsers offer "Install app" and shows the daily duty alerts.
// It caches nothing: duties and logins always come live from the server.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

self.addEventListener("push", (e) => {
  let d = { title: "Duty", body: "" };
  try { d = e.data.json(); } catch { d.body = e.data ? e.data.text() : ""; }
  e.waitUntil(self.registration.showNotification(d.title, {
    body: d.body, icon: "/icon-192.png", badge: "/icon-192.png", tag: d.tag || "duty", renotify: true, data: { url: "/" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) if ("focus" in c) return c.focus();
    return self.clients.openWindow("/");
  }));
});
