
const getBodyObject = function (body) {
	if (!body) {
		return null;
	}

	let bodyJson = body;
	if (typeof body === 'string') {
		bodyJson = JSON.parse(body);
	}

	return {
		collected_ids: Array.isArray(bodyJson.collected_ids) ? bodyJson.collected_ids : null,
		id: typeof bodyJson.id === 'string' ? bodyJson.id : null,
	};
};

module.exports = {
	getBodyObject,
};

