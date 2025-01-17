const CACHE_NAME = "my-pwa-cache-v2.1";

const urlsToCache = [
	"./",
	"./index.html",
	"./common-english-words.js",
	"./manifest.json",
	"./README.md",
	"./styles.css",
	"./script.js",
	"./images/chart-simple-solid.svg",
	"./images/lightbulb-solid.svg",
	"./images/ranking-star-solid.svg",
	"./images/triangle-exclamation-solid.svg",
	"./favicons/32x32.png",
	"https://code.jquery.com/jquery-3.6.0.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js",
	"https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,100..900;1,100..900&display=swap",
];

self.addEventListener("install", (event) => {
	console.log("Service Worker installing.");
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log("Opened cache");
				return cache.addAll(urlsToCache);
			})
			.then(() => {
				console.log("All files cached");
			})
			.catch((error) => {
				console.error("Failed to cache files", error);
			})
	);
});

// Activate event - Clean old caches

self.addEventListener("activate", (event) => {
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cache) => {
					if (!cacheWhitelist.includes(cache)) {
						return caches.delete(cache);
					}
				})
			);
		})
	);
});

self.addEventListener("fetch", (event) => {
	console.log("Fetch event for ", event.request.url);
	event.respondWith(
		caches
			.match(event.request)
			.then((response) => {
				if (response) {
					// console.log("Found ", event.request.url, " in cache");
					return response;
				}
				// console.log("Network request for ", event.request.url);
				return fetch(event.request);
			})
			.catch((error) => {
				console.error("Fetch failed; returning offline page instead.", error);
				return caches.match("./index.html");
			})
	);
});
