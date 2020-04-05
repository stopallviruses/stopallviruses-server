// Import dynamodb from aws-sdk
const dynamodb = require('aws-sdk/clients/dynamodb');

// Import all functions from put-item.js
const lambda = require('../../../src/handlers/put-item.js');

// This includes all tests for putItemHandler
describe('Test putItemHandler', () => {
    let batchWriteSpy;

    // One-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown
    beforeAll(() => {
        // Mock DynamoDB batchWrite method
        // https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname
        batchWriteSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'batchWrite');
    });

    // Clean up mocks
    afterAll(() => {
        batchWriteSpy.mockRestore();
    });

    // This test invokes putItemHandler and compares the result
    it('should add id to the table', async () => {
        // Return the specified value whenever the spied batchWrite function is called
        batchWriteSpy.mockReturnValue({
            promise: () => Promise.resolve('data'),
        });

        const event = {
            httpMethod: 'POST',
            body: '{"ids":["test", "test1", "test2"]}',
        };

        // Invoke putItemHandler()
        const result = await lambda.putItemHandler(event);
        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify({
            	added: 3,
				success: true
			}),
        };

        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });

	// This test invokes putItemHandler and compares the result
	it('should nothing if body is missing', async () => {
		// Return the specified value whenever the spied batchWrite function is called
		batchWriteSpy.mockReturnValue({
			promise: () => Promise.resolve('data'),
		});

		const event = {
			httpMethod: 'POST',
		};

		// Invoke putItemHandler()
		const result = await lambda.putItemHandler(event);
		const expectedResult = {
			statusCode: 200,
			body: JSON.stringify({
				"added": 0,
				"message": "Nothing to add",
				"success": true,
			}),
		};

		// Compare the result with the expected result
		expect(result).toEqual(expectedResult);
	});

	// This test invokes putItemHandler and compares the result
	it('should nothing if body is not an array', async () => {
		// Return the specified value whenever the spied batchWrite function is called
		batchWriteSpy.mockReturnValue({
			promise: () => Promise.resolve('data'),
		});

		const event = {
			httpMethod: 'POST',
			body: '{"ids":"sdfsd"}',
		};

		// Invoke putItemHandler()
		const result = await lambda.putItemHandler(event);
		const expectedResult = {
			statusCode: 200,
			body: JSON.stringify({
				"added": 0,
				"message": "Nothing to add",
				"success": true,
			}),
		};

		// Compare the result with the expected result
		expect(result).toEqual(expectedResult);
	});
});
