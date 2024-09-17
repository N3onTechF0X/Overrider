const createPattern = url => new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const resourcesParam = new URLSearchParams(window.location.search).get('resources');
const resourcesURL = resourcesParam ?
    new URL(resourcesParam, window.location.origin).href :
    window.location.hostname === '3dtank.com' ?
    'https://res.3dtank.com' :
    window.location.hostname === 'tankionline.com' ?
    'https://s.eu.tankionline.com' :
    undefined;
if (!resourcesURL) {
	console.error("[Overrider] Cant find resource server");
	return;
}
const resourcesOverrider = [];
const originalFetch = unsafeWindow.fetch;
unsafeWindow.fetch = async (url, options) => {
	const override = resourcesOverrider.find(override => createPattern(override.from).test(url));
	if (override) {
		try {
			const response = await new Promise((resolve, reject) => {
				GM_xmlhttpRequest({
					method: 'GET',
					url: override.to,
					responseType: 'blob',
					onload: (res) => res.status === 200 ? resolve(res) : reject(res),
					onerror: reject
				});
			});
			console.info(`[Overrider] Resource overridden successfully.\nFrom: ${override.from}\nTo: ${override.to}\nComment: ${override.comment}`);
			return new Response(response.response, {
				status: 200,
				statusText: 'OK',
				headers: { 'Content-Type': response.response.type }
			});
		} catch (error) {
			console.error(`[Overrider] Failed to load resource.\nLink: ${override.to}\nComment: ${override.comment}\nStatus: ${error.status}`);
			throw error;
		}
	}
	return await originalFetch(url, options);
};
