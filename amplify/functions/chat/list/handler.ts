import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {env} from "$amplify/env/listChatByUserIdFnc";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { Schema } from "../../../data/resource";
import { generateClient } from "aws-amplify/data";

export const handler : APIGatewayProxyHandlerV2 = async (event) => {

    const queryParams = event.queryStringParameters || {};
    const {userId, agentId} = queryParams;

    if (!userId || !agentId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Bad Request",
                error: "Missing required query parameter: userId or agentId"
            })
        };  
    }

    // Clients
    const amplifyClient = await getAmplifyClient(env);
    const e = generateClient<Schema>(); 

    try {

        const existingUser = await amplifyClient.models.Users.get({
            id: userId
        });
        const existingAgent = await amplifyClient.models.AiAgents.get({
            id: agentId
        });

        if (!existingUser.data || !existingAgent.data) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Not Found",
                    error: `User with ID ${userId} does not exist or Agent with ID ${agentId} does not exist`
                })
            };
        }

        const existingChat = await e.models.Chats.list({
            filter: {
                user_id: {eq: userId},
                ai_agent_id: {eq: agentId}
            },
            selectionSet: [
                "id",
                "create_at",
                "create_by",
                "raw_content", 
                "user_id",  
                "ai_agent_id",  
                "ai_agent.icon",
                "ai_agent.name",
                "ai_agent.version_value_use"
            ] 
        } as any);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Success",
                data: existingChat.data
            })
        }

    } catch (error : any) {
        console.error("Error in handler:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error",
                error: error.message || "An unexpected error occurred"
            })
        };
    }
}