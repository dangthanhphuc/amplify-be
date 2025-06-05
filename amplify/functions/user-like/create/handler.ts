import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/createUserLikeFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
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
    const userLikeExists = await amplifyClient.models.UserLikes.get({
      user_id: userId,
      ai_agent_id: aiAgentId,
    });

    if (userLikeExists.data != null) {
      console.log(
        "User like already exists:",
        JSON.stringify(userLikeExists.data)
      );
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: "User like already exists",
          data: userLikeExists.data,
        }),
      };
    } else {
      const result = await amplifyClient.models.UserLikes.create({
        user_id: userId,
        ai_agent_id: aiAgentId,
        liked: isLiked,
        create_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "User like created successfully",
          data: result,
        }),
      };
    }
  } catch (error) {
    console.error("Error creating user like:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating user like",
        error: error,
      }),
    };
  }
};
