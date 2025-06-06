import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/updateUserLikeFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
  const requestBody = JSON.parse(event.body || "{}");
  const { userId, aiAgentId, isLiked } = requestBody;

  if (!aiAgentId || !userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing userId or aiAgentId parameter",
      }),
    };
  }

  if (isLiked === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "isLiked field must be provided for update",
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

    // Update the user like
    const updateData = {
      user_id: userId,
      ai_agent_id: aiAgentId,
      liked: isLiked,
      updated_at: new Date().toISOString(),
    };

    const result = await amplifyClient.models.UserLikes.update(updateData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User like updated successfully",
        data: result.data,
      }),
    };
  } catch (error) {
    console.error("Error updating user like:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error updating user like",
        error: error,
      }),
    };
  }
};
