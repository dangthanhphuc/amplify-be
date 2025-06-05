import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/updateAgentCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const { id } = event.pathParameters || {};
    const requestBody = JSON.parse(event.body || '{}');
    
    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing required parameter: id",
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
        const existingCategory = await amplifyClient.models.AgentCategories.get({ id });

        if (!existingCategory.data) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Agent category not found",
                }),
            };
        }

        const updateData: any = {
            id: id,
            updated_at: new Date().toISOString(),
        };

        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;

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
