// Create a DocumentClient that represents the query to add an item
const dynamoDb = require('aws-sdk/clients/dynamodb');
const response = require('../utils/response');

const docClient = new dynamoDb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

exports.getInfectedItemsHandler = (event, context, callbackApi) => {
	const {httpMethod, pathParameters} = event;
	if (httpMethod !== 'GET') {
		response.sendError(callbackApi, `only accept GET method, you tried: ${httpMethod}`);
		return;
	}

	if (!pathParameters) {
		response.sendError(callbackApi, `Wrong parameters, please send id into query.`);
		return;
	}

	// Get id from pathParameters from APIGateway because of `/{id}` at template.yml
	const id = (pathParameters.hasOwnProperty('id')) ? pathParameters.id : null;
	if (!id || id === '') {
		response.sendError(callbackApi, `Nothing to read, please send id.`);
		return;
	}

	const params = {
		TableName: tableName,
		FilterExpression: `contains(#collision, :collision)`,
		ExpressionAttributeNames: {'#collision': 'collision'},
		ExpressionAttributeValues: {":collision": id},
	};

	docClient.scan(params, function (error, results) {
		if (error) return callbackApi(error);

		return response.sendSuccess(callbackApi, {
			infected_ids: results.Items.map(item => item.submitter_id || null).filter(item => item !== null)
		});
	});
};
