import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/listChatByUserIdFnc";

export const handler : APIGatewayProxyHandlerV2 = async (event) => {

        const {userId} = event.pathParameters || {};

        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Bad Request",
                    error: "Missing required query parameter: userId"
                })
            };  
        }
    
        // Clients
        const amplifyClient = await getAmplifyClient(env);
    
        try {
    
            const existingUser = await amplifyClient.models.Users.get({
                id: userId
            });

            if (!existingUser.data) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: "Not Found",
                        error: `User with ID ${userId} does not exist`
                    })
                };
            }
    
            const existingChat = await amplifyClient.models.Chats.list({
                filter: {
                    user_id: {eq: userId},
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