
exports.getIds = function(data) {
	let ids;
	if (data) {
		let dataJson = data;
		if (typeof data === 'string') {
			dataJson = JSON.parse(data);
		}
		ids = dataJson.ids || null;
	}
	if (!ids || !Array.isArray(ids)) {
		return null;
	}

	return ids;
};
