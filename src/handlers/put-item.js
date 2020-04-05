// Create clients and set shared const values outside of the handler

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.putItemHandler = async (event) => {
	//stopallvirus/api-backend
    const { body, httpMethod } = event;
    if (httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${httpMethod} method.`);
    }
	// All log statements are written to CloudWatch by default. For more information, see
	// https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
	console.log('received:', JSON.stringify(event));

    // Get id and name from the body of the request
	const ids = getIdsFromBody(body);

	if (!ids) {
		return formatResponse({added: 0, message: "Nothing to add"});
	}

	let items = ids.map(id => {
		return {
			PutRequest: {
				Item: {
					id: id
				}
			}
		};
	});

	let RequestItems = {};
	RequestItems[tableName] = items;

	let params = {
		RequestItems
	};

    await docClient.batchWrite(params).promise();

	return formatResponse({added: ids.length});
};

function getIdsFromBody(data) {
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
