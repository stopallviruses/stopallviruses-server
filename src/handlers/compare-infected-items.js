// Create clients and set shared const values outside of the handler

// Create a DocumentClient that represents the query to get all items
const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.compareInfectedItemsHandler = async (event) => {
    const { httpMethod, body } = event;
    if (httpMethod !== 'POST') {
        throw new Error(`compareInfectedItems only accept POST method, you tried: ${httpMethod}`);
    }
	// All log statements are written to CloudWatch by default. For more information, see
	// https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
	console.log('received:', JSON.stringify(event));

	const ids = getIdsFromParameters(body);

	if (!ids) {
		return formatResponse({message: "Nothing to compare", item: []});
	}

	let RequestItems = {};

	RequestItems[tableName] = {Keys: ids.map(id => {
			return {id}
		})
	};

	let params = {
		RequestItems
	};

	const { Responses } = await docClient.batchGet(params).promise();
	const Items = Responses[tableName];

    return formatResponse({items: Items});
};

function getIdsFromParameters(data) {
	let ids;
	if (data) {
		let dataJson = data;
		if (typeof data === 'string') {
			dataJson = JSON.parse(data);
		}
		ids = dataJson.ids || null;
	}
	if (!ids || !Array.isArray(ids) || ids.length === 0) {
		return null;
	}

	return ids;
}

function formatResponse(data) {
	data.success = true;
	return {
		statusCode: 200,
		body: JSON.stringify(data),
	};
}
