self.addEventListener("install", () => {
  console.log("Service Worker Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");

  event.waitUntil(clients.claim());
});
