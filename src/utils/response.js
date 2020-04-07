
const sendSuccess = function(callback, data) {
	if (!data) data = {};

	callback(null, {
		statusCode: 200,
		body: JSON.stringify(data),
	});
};

const sendError = function(callback, message) {
	const data = {
		message
	};

	callback(null, {
		statusCode: 200,
		body: JSON.stringify(data),
	});
};


module.exports = {
	sendSuccess,
	sendError,
};
