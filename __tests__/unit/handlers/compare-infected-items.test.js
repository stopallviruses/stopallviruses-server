// Import dynamodb from aws-sdk
const dynamodb = require('aws-sdk/clients/dynamodb');

// Import all functions from compare-infected-items.js
const lambda = require('../../../src/handlers/compare-infected-items.js');

const tableName = process.env.SAMPLE_TABLE;

// This includes all tests for compareInfectedItemsHandler
describe('Test compareInfectedItemsHandler', () => {
    let batchGetSpy;
    let items;

    // One-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown
    beforeAll(() => {
        // Mock DynamoDB batchGet method
        // https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname
		batchGetSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'batchGet');

		items = [
			{
				"id": "internal"
			},
			{
				"id": "qdqsd"
			}
		];
		const Responses = {};
		Responses[tableName] = items;

		// Return the specified value whenever the spied batchGet function is called
		batchGetSpy.mockReturnValue({
			promise: () => Promise.resolve({ Responses }),
		});
    });

    // Clean up mocks
    afterAll(() => {
		batchGetSpy.mockRestore();
    });

    // This test invokes compareInfectedItemsHandler and compares the result
    it('should return ids', async () => {
        const event = {
            httpMethod: 'POST',
			body: "{\"ids\": [\"internal\", \"qdqsd\"]}",
        };

        // Invoke compareInfectedItemsHandler
        const result = await lambda.compareInfectedItemsHandler(event);

        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify({
				items,
            	success: true,
			}),
        };

        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });

	// This test invokes compareInfectedItemsHandler and compares the result
	it('should return nothing when parameters is null', async () => {


		const event = {
			httpMethod: 'POST'
		};

		// Invoke compareInfectedItemsHandler
		const result = await lambda.compareInfectedItemsHandler(event);

		const expectedResult = {
			statusCode: 200,
			body: JSON.stringify({
				'message': "Nothing to compare",
				'item': [],
				"success": true,
			}),
		};

		// Compare the result with the expected result
		expect(result).toEqual(expectedResult);
	});

	// This test invokes compareInfectedItemsHandler and compares the result
	it('should return nothing when parameters is not an array of ids', async () => {


		const event = {
			httpMethod: 'POST',
			body: "{\"ids\": \"qds\"}",
		};

		// Invoke compareInfectedItemsHandler
		const result = await lambda.compareInfectedItemsHandler(event);

		const expectedResult = {
			statusCode: 200,
			body: JSON.stringify({
				'message': "Nothing to compare",
				'item': [],
				"success": true,
			}),
		};

		// Compare the result with the expected result
		expect(result).toEqual(expectedResult);
	});
});
