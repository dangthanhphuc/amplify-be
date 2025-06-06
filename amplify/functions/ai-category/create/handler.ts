import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/createAiCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const requestBody = JSON.parse(event.body || '{}');
    console.log("Received request body:", JSON.stringify(requestBody, null, 2));
    const { agentCategoryId, aiAgentId} = requestBody;
    
    if (!agentCategoryId || !aiAgentId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing required field: agentCategoryId or aiAgentId",
            }),
        };
    }

    const amplifyClient = await getAmplifyClient(env);

    try {

        const existingCategory = await amplifyClient.models.AiCategories.get({ agent_category_id: agentCategoryId, ai_agent_id: aiAgentId });

        if (existingCategory.data) {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    message: "AI category already exists for the given agent category and AI agent",
                }),
            };
        }

        const result = await amplifyClient.models.AiCategories.create({
            agent_category_id: agentCategoryId,
            ai_agent_id: aiAgentId,
        });
        console.log("AI Category result:", JSON.stringify(result, null, 2));

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "AI category created successfully",
                data: result.data,
            })
        };

    } catch (error) {
        console.error("Error creating AI category:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error creating AI category",
                error: error,
            }),
        };
    }
};
