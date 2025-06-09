import { APIGatewayProxyHandler } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/likeFnc";
import { likeAiAgent, UserLikeDTO } from "../../../services/userLikeService";

export const handler : APIGatewayProxyHandler = async (event) => {
    const requestBody = JSON.parse(event.body || "{}");
      const { userId, aiAgentId, isLiked } = requestBody;
    
      if (!userId || !aiAgentId || isLiked === undefined) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Missing required fields in request body",
          }),
        };
      }
    
    // Clients
    const amplifyClient = await getAmplifyClient(env);

    try {
        const userLikeDTO : UserLikeDTO = {
            userId: userId,
            aiAgentId: aiAgentId,
            isLiked: isLiked ? 1 : 0,
        };
        const result = await likeAiAgent(amplifyClient, userLikeDTO);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Like operation successful",
                data: result.data,
            }),
        };
    } catch (error : any) {
        console.error("Error in like handler:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Like operation failed",
                error: error.message,
            }),
        };
    }
}