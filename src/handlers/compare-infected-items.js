// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const parseBody = require('../utils/parseBody');
const response = require('../utils/response');
const _ = require('underscore');
const async = require('async');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

exports.compareInfectedItemsHandler = (event, context, callback) => {

	const { body, httpMethod } = event;
	if (httpMethod !== 'POST') {
		throw new Error(`compareInfectedItems only accept POST method, you tried: ${httpMethod}`);
	}
	// All log statements are written to CloudWatch by default. For more information, see
	// https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html


	// Get id and name from the body of the request
	const ids = parseBody.getIds(body);
	if (!ids) {
		response.sendError(callback, `Nothing to get, please send ids.`);
		return;
	}

	const rowOfIds = _.chunk(_.uniq(ids), 100);
	let foundIds = [];
	async.each(rowOfIds, (ids, callback) => {
		read100Items(ids, (error, result) => {
			if (error) return callback(error);


			console.log(result);
			foundIds = foundIds.concat(result);
			callback(null);
		});
	}, (error) => {
		if (error) return callback(error);

		response.sendSuccess(callback, {ids: _.uniq(foundIds)});
	});
};

function read100Items(ids, callback) {
	let RequestItems = {};

	RequestItems[tableName] = {Keys: ids.map(id => {
			return {id}
		})
	};

	let params = {
		RequestItems
	};

	docClient.batchGet(params, (error, result) => {
		if (error) return callback(error);

		const Items = result.Responses[tableName];
		callback(null, Items.map(item => item.id));
	});
}
