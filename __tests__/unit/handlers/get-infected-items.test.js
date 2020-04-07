// Import dynamodb from aws-sdk
const dynamoDb = require('aws-sdk/clients/dynamodb');

// Import all functions from get-infected-items.js
const lambda = require('../../../src/handlers/get-infected-items.js');

// This includes all tests for getInfectedItemsHandler
describe('Test getInfectedItemsHandler', () => {
	let scanSpy;

	// One-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown
	beforeAll(() => {
		// Mock DynamoDB scan method
		// https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname
		scanSpy = jest.spyOn(dynamoDb.DocumentClient.prototype, 'scan');
	});

	// Clean up mocks
	afterAll(() => {
		scanSpy.mockRestore();
	});


	it('should return infected ids', (done) => {
		const response = {
			Items: [
				{submitter_id: "id1"},
				{submitter_id: "id2"}
			]
		};

		// Return the specified value whenever the spied scan function is called
		scanSpy.mockImplementation((params, callback) => {
			callback(null, response);
		});

		const event = {
			httpMethod: 'GET',
			pathParameters: {id: "id5"},
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {
			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					infected_ids: ["id1", "id2"],
				}),
			};

			// Compare the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});


	it('should return error for a wrong method', (done) => {
		const event = {
			httpMethod: 'POST'
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {

			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					'message': "only accept GET method, you tried: POST",
				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});


	it('should return nothing when parameters pathParameters is missing', async (done) => {
		const event = {
			httpMethod: 'GET'
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {

			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					'message': "Wrong parameters, please send id into query.",
				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});


	it('should return nothing when parameters id is missing', async (done) => {
		const event = {
			httpMethod: 'GET',
			pathParameters: {},
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {

			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					'message': "Nothing to read, please send id.",
				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});


	it('should return nothing when parameters id is empty', async (done) => {
		const event = {
			httpMethod: 'GET',
			pathParameters: {id: ""},
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {

			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					'message': "Nothing to read, please send id.",
				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});
});
