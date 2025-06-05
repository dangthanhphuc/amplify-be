import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/deleteAgentCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        const { id } = event.pathParameters || {};

        if (!id) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    error: "Agent category ID is required",
                }),
            };
        }

        const amplifyClient = await getAmplifyClient(env);

        // Delete the agent category
        await amplifyClient.models.AgentCategories.delete({ id });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Agent category deleted successfully",
                categoryId: id,
            }),
        };
    } catch (error: any) {
        if (error.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    error: "Agent category not found",
                }),
            };
        }

        console.error("Error deleting agent category:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                error: "Internal server error",
            }),
        };
    }
};
