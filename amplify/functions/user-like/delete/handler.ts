import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/deleteUserLikeFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
  const requestBody = JSON.parse(event.body || "{}");
  const { userId, aiAgentId } = requestBody;

  if (!userId || !aiAgentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing userId or aiAgentId parameter",
      }),
    };
  }

  // Clients
  const amplifyClient = await getAmplifyClient(env);

  try {
    // First check if the user like exists
    const userLikeExists = await amplifyClient.models.UserLikes.get({
      user_id: userId,
      ai_agent_id: aiAgentId,
    });

    if (!userLikeExists.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "User like not found",
        }),
      };
    }

    // Delete the user like
    await amplifyClient.models.UserLikes.delete({
      user_id: userId,
      ai_agent_id: aiAgentId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User like deleted successfully",
      }),
    };
  } catch (error) {
    console.error("Error deleting user like:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error deleting user like",
        error: error,
      }),
    };
  }
};
