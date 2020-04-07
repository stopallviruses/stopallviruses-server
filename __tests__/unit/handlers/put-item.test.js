// Import dynamodb from aws-sdk
const dynamodb = require('aws-sdk/clients/dynamodb');
const uuid = require('node-uuid');

// Import all functions from put-item.js
const lambda = require('../../../src/handlers/put-item.js');

// This includes all tests for putItemHandler
describe('Test putItemHandler', () => {
	let putSpy;

	// One-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown
	beforeAll(() => {
		// Mock DynamoDB put method
		// https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname
		putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
		jest.spyOn(uuid, 'v4').mockReturnValue('test1234567');
	});

	// Clean up mocks
	afterAll(() => {
		putSpy.mockRestore();
	});


	it('should add id to the table', async (done) => {
		// Return the specified value whenever the spied scan function is called
		putSpy.mockImplementation((params, callback) => {
			callback(null);
		});

		const event = {
			httpMethod: 'POST',
			body: '{"collected_ids":["00b2a9d8-78a2-11ea-bc55-0242ac130003", "04ad3e4a-78a2-11ea-bc55-0242ac130003", "083ea5f8-78a2-11ea-bc55-0242ac130003"], "id": "ce029303-ae89-440d-b531-ff6f122dc31b"}',
		};

		lambda.putItemHandler(event, null, (error, result) => {
			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					id: 'test1234567'
				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});


	it('should nothing if body is missing', async (done) => {
		// Return the specified value whenever the spied put function is called
		putSpy.mockReturnValue({
			promise: () => Promise.resolve('data'),
		});

		const event = {
			httpMethod: 'POST',
		};

		// Invoke putItemHandler()
		lambda.putItemHandler(event, null, (error, result) => {
			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					"message": "Wrong body parameters, collected_ids must be an array and id must be a string.",

				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});


	it('should nothing if body is not an array', async (done) => {
		// Return the specified value whenever the spied put function is called
		putSpy.mockReturnValue({
			promise: () => Promise.resolve('data'),
		});

		const event = {
			httpMethod: 'POST',
			body: '{"ids":"sdfsd"}',
		};

		// Invoke putItemHandler()
		lambda.putItemHandler(event, null, (error, result) => {
			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					"message": "Wrong body parameter : collected_ids must be an array of ids.",
				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});


	it('should nothing if body id is missing', async (done) => {
		// Return the specified value whenever the spied put function is called
		putSpy.mockReturnValue({
			promise: () => Promise.resolve('data'),
		});

		const event = {
			httpMethod: 'POST',
			body: '{"collected_ids":["00b2a9d8-78a2-11ea-bc55-0242ac130003", "04ad3e4a-78a2-11ea-bc55-0242ac130003", "083ea5f8-78a2-11ea-bc55-0242ac130003"]}',
		};

		// Invoke putItemHandler()
		lambda.putItemHandler(event, null, (error, result) => {
			const expectedResult = {
				statusCode: 200,
				body: JSON.stringify({
					"message": "Wrong body parameter : id must be a string.",
				}),
			};

			// Get the result with the expected result
			expect(result).toEqual(expectedResult);
			done();
		});
	});
});
