// Create a DocumentClient that represents the query to add an item
const dynamoDb = require('aws-sdk/clients/dynamodb');
const uuid = require('node-uuid');
const _ = require('underscore');
const async = require('async');
const moment = require('moment');
const parseBody = require('../utils/parseBody');
const response = require('../utils/response');

const docClient = new dynamoDb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

const limitOfItemsPerRequest = 10000;

// https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html

exports.putItemHandler = (event, context, callbackApi) => {

	const {body, httpMethod} = event;
	if (httpMethod !== 'POST') {
		response.sendError(callbackApi, `postMethod only accepts POST method, you tried: ${httpMethod} method.`);
		return;
	}

	let bodyObject = parseBody.getBodyObject(body);
	if (!bodyObject) {
		response.sendError(callbackApi, `Wrong body parameters, collected_ids must be an array and id must be a string.`);
		return;
	}

	if (!bodyObject.collected_ids) {
		response.sendError(callbackApi, `Wrong body parameter : collected_ids must be an array of ids.`);
		return;
	}

	if (!bodyObject.id) {
		response.sendError(callbackApi, `Wrong body parameter : id must be a string.`);
		return;
	}

	if (bodyObject.collected_ids.length === 0) {
		response.sendError(callbackApi, `Collected ids is empty.`);
		return;
	}

	const submissionId = uuid.v4();

	//Only for tests this line generate a random list of collected ids
	//bodyObject.collected_ids = new Array(limitOfItemsPerRequest * 10).fill(null).map(() => uuid.v4());

	//Split my array by 10 000 line, dynamoDb has a limit of item size
	const chunkedIds = _.chunk(bodyObject.collected_ids, limitOfItemsPerRequest);

	async.each(chunkedIds, (ids, callback) => {
		const params = {
			Item: {
				id: uuid.v4(),
				submission_id: submissionId,
				submitter_id: bodyObject.id,
				created_at: moment().format(),
				collision: docClient.createSet(ids)
			},
			TableName: tableName
		};

		docClient.put(params, callback);
	}, (error) => {
		if (error) return callbackApi(error);

		return response.sendSuccess(callbackApi, {
			id: submissionId
		});
	});
};
