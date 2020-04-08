// Create a DocumentClient that represents the query to add an item
const dynamoDb = require('aws-sdk/clients/dynamodb');
const response = require('../utils/response');
const parseBody = require('../utils/parseBody');
const _ = require('underscore');
const async = require('async');

const docClient = new dynamoDb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

exports.getInfectedItemsHandler = (event, context, callbackApi) => {
	const {body, httpMethod} = event;
	if (httpMethod !== 'POST') {
		response.sendError(callbackApi, `only accept POST method, you tried: ${httpMethod}`);
		return;
	}

	let bodyObject = parseBody.getBodyObject(body);
	if (!bodyObject || (!bodyObject.collected_ids && !bodyObject.id)) {
		response.sendError(callbackApi, `Wrong body parameters, please send and an id string or collected_ids [string]`);
		return;
	}

	async.parallel({
		byMacId: (callback) => {
			getByMacId(bodyObject.id, callback)
		},
		byCollectedIds: (callback) => {
			getByCollectedId(bodyObject.collected_ids, callback)
		}
	}, (error, results) => {
		if (error) return callbackApi(error);

		const items = _.union(results.byMacId, results.byCollectedIds);
		const infectedIds = _.map(items, item => item.submitter_id || null);
		let filteredInfectedIds = _.uniq(_.filter(infectedIds, item => item !== null));

		return response.sendSuccess(callbackApi, {
			infected_ids: filteredInfectedIds,
			count: filteredInfectedIds.length
		});
	});
};

function getByMacId(macId, callback) {
	if (!macId) {
		callback(null, []);
		return;
	}

	const params = {
		TableName: tableName,
		FilterExpression: `contains(#collision, :collision)`,
		ExpressionAttributeNames: {'#collision': 'collision'},
		ExpressionAttributeValues: {":collision": macId},
	};

	docClient.scan(params, function (error, results) {
		if (error) return callback(error);

		callback(null, results.Items);
	});
}

function getByCollectedId(collectedIds, callback) {
	if (!collectedIds) {
		callback(null, []);
		return;
	}

	const params = {
		TableName: tableName,
		ScanFilter: {
			"submitter_id": {
				AttributeValueList: collectedIds,
				ComparisonOperator: "IN"
			}
		}
	};

	docClient.scan(params, function (error, results) {
		if (error) return callback(error);

		callback(null, results.Items);
	});
}
