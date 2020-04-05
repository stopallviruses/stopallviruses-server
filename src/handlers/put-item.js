// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const parseBody = require('../utils/parseBody');
const response = require('../utils/response');
const _ = require('underscore');
const async = require('async');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

exports.putItemHandler = (event, context, callback) => {

	const { body, httpMethod } = event;
	if (httpMethod !== 'POST') {
		callback(new Error(`postMethod only accepts POST method, you tried: ${httpMethod} method.`));
		return;
	}
	// All log statements are written to CloudWatch by default. For more information, see
	// https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html


	// Get id and name from the body of the request
	const ids = parseBody.getIds(body);
	if (!ids) {
		response.sendError(callback, `Nothing to add, please send ids.`);
		return;
	}

	const rowOfIds = _.chunk(_.uniq(ids), 25);
	async.each(rowOfIds, (ids, callback) => {
		insert25Items(ids, callback);
	}, (error) => {
		if (error) return callback(error);

		return response.sendSuccess(callback);
	});
};

function insert25Items(ids, callback) {
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

	docClient.batchWrite(params, (error, result) => {
		if (error) return callback(error);

		callback(null, result);
	});
}
