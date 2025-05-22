import type { APIGatewayProxyHandler } from 'aws-lambda';

export const handler : APIGatewayProxyHandler = async (event) => {
    try {

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Add user to group function executed successfully"
            })
        }
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error adding user to group",
                error: error.message,
            }),
        };
    }
}