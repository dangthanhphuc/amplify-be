import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/updateAgentFnc";

interface UpdateAgentRequest {
    name?: string;
    icon?: string;
    introduction?: string;
    description?: string;
    foreword?: string;
    last_version?: string;
    status?: string;
    like_count?: number;
    total_interactions?: number;
    creator_id?: string;
    knowledge_base_url?: string;
    sys_prompt?: string;
    model?: string;
    capabilities?: string[];
    alias_ids?: string[];
    cost?: number;
    suggested_questions?: string[];
    is_public?: number;
    type?: string;
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {

    // Clients
    const amplifyClient = await getAmplifyClient(env);

    try {
        // Extract agent ID from path parameters
        const agentId = event.pathParameters?.agentId;
        if (!agentId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Agent ID is required" })
            };
        }

        // Parse request body
        const updateData: UpdateAgentRequest = JSON.parse(event.body || '{}');
        
        // Validate at least one field to update
        if (Object.keys(updateData).length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "At least one field must be provided for update" })
            };
        }

        // Prepare update input for GraphQL
        const updateInput = {
            id: agentId,
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        // Execute GraphQL mutation
        const result = await amplifyClient.models.AiAgents.update({
            updateInput
        });

        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({
                    error: "Update failed",
                    details: result.errors
                })
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                message: "Agent updated successfully",
                data: result.data.updateAiAgent
            })
        };

    } catch (error) {
        console.error('Update agent error:', error);
        
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error"
            })
        };
    }
}