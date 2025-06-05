import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/updateAgentCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const { categoryId } = event.pathParameters || {};
    const requestBody = JSON.parse(event.body || '{}');
    
    if (!categoryId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing required parameter: categoryId",
            }),
        };
    }

    const { name, description } = requestBody;
    
    if (!name && !description) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "At least one field (name or description) is required for update",
            }),
        };
    }

    const amplifyClient = await getAmplifyClient(env);

    try {
        // First check if the category exists
        const existingCategory = await amplifyClient.models.AgentCategories.get({ id: categoryId });

        if (!existingCategory.data) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Agent category not found",
                }),
            };
        }

        const updateData: any = {
            id: categoryId,
        };

        if (name) updateData.name = name;

        const result = await amplifyClient.models.AgentCategories.update(updateData);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Agent category updated successfully",
                data: result.data,
            })
        };

    } catch (error) {
        console.error("Error updating agent category:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error updating agent category",
                error: error,
            }),
        };
    }
};
