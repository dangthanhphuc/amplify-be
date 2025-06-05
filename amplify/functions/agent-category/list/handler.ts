import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/listAgentCategoriesFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const queryParams = event.queryStringParameters || {};
    const { limit = "20", nextToken } = queryParams;

    const amplifyClient = await getAmplifyClient(env);

    try {
        const result = await amplifyClient.models.AgentCategories.list({
            limit: parseInt(limit),
            nextToken: nextToken || undefined
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Agent categories retrieved successfully",
                data: result.data,
                nextToken: result.nextToken,
            })
        };

    } catch (error) {
        console.error("Error listing agent categories:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error listing agent categories",
                error: error,
            }),
        };
    }
};
