import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/getAgentCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const { categoryId } = event.pathParameters || {};
    
    if (!categoryId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing required parameter: id",
            }),
        };
    }

    const amplifyClient = await getAmplifyClient(env);

    try {
        const result = await amplifyClient.models.AgentCategories.get({ id: categoryId });
        
        if (!result.data) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Agent category not found",
                }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Agent category retrieved successfully",
                data: result.data,
            })
        };

    } catch (error) {
        console.error("Error getting agent category:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error getting agent category",
                error: error,
            }),
        };
    }
};
