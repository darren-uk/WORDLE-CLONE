if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("./service-worker.js", { scope: "./" })
			.then((registration) => {
				console.log(
					"Service worker registered with scope:",
					registration.scope
				);
			})
			.catch((error) => {
				console.log("Service worker registration failed:", error);
			});
	});
}
