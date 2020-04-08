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

		const response = {
			Items: [
				{submitter_id: "mac_infected_1"}
			]
		};

		// Return the specified value whenever the spied scan function is called
		scanSpy.mockImplementation((params, callback) => {
			callback(null, response);
		});
	});

	// Clean up mocks
	afterAll(() => {
		scanSpy.mockRestore();
	});

	it('should return infected ids with your mac id', (done) => {
		const event = {
			httpMethod: 'POST',
			body: {id: "mac1"},
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {
			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					infected_ids: ["mac_infected_1"],
					count: 1
				}),
			};

			// Compare the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});

	it('should return infected ids with your collected ids', (done) => {
		const event = {
			httpMethod: 'POST',
			body: {collected_ids: ["mac1"]},
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {
			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					infected_ids: ["mac_infected_1"],
					count: 1
				}),
			};

			// Compare the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});

	it('should return infected ids with both mac id and collected ids', (done) => {
		const event = {
			httpMethod: 'POST',
			body: {collected_ids: ["mac1"], id: "mac2"},
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {
			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					infected_ids: ["mac_infected_1"],
					count: 1
				}),
			};

			// Compare the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});
	it('should return error for a wrong method', (done) => {
		const event = {
			httpMethod: 'GET'
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {

			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					'message': "only accept POST method, you tried: GET",
				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});


	it('should return nothing when parameters pathParameters is missing', async (done) => {
		const event = {
			httpMethod: 'POST'
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {

			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					'message': "Wrong body parameters, please send and an id string or collected_ids [string]",
				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});


	it('should return nothing when parameters id is missing', async (done) => {
		const event = {
			httpMethod: 'POST',
			body: {},
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {

			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					'message': "Wrong body parameters, please send and an id string or collected_ids [string]",
				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});


	it('should return nothing when parameters id is empty', async (done) => {
		const event = {
			httpMethod: 'POST',
			pathParameters: {id: ""},
		};

		// Invoke getInfectedItemsHandler
		lambda.getInfectedItemsHandler(event, null, (error, result) => {

			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					'message': "Wrong body parameters, please send and an id string or collected_ids [string]",
				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});
});
