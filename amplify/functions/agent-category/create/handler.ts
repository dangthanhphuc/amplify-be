import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/createAgentCategoryFnc";
import { randomUUID } from "crypto";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const requestBody = JSON.parse(event.body || '{}');
    console.log("Received request body:", JSON.stringify(requestBody, null, 2));
    const { name, description } = requestBody;
    
    if (!name) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing required field: name",
            }),
        };
    }

    const amplifyClient = await getAmplifyClient(env);

    try {
        const result = await amplifyClient.models.AgentCategories.create({
            id: randomUUID().toString(),
            name: name,
            description: description || "",
            created_at: new Date().toISOString(),
        });
        
        console.log("Agent Category result:", JSON.stringify(result, null, 2));

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Agent category created successfully",
                data: result.data,
            })
        };

    } catch (error) {
        console.error("Error creating agent category:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error creating agent category",
                error: error,
            }),
        };
    }
};
