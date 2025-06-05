import type { APIGatewayProxyHandler } from "aws-lambda";
import { env } from "$amplify/env/getUserInfoFnc";
import { getAmplifyClient } from "../../../utils/clientUtil";

export const handler: APIGatewayProxyHandler = async (event) => {
  console.info("Received event:", JSON.stringify(event, null, 2));
  const userId = event.pathParameters?.userId;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing userId parameter",
      }),
    };
  }

  const amplifyClient = await getAmplifyClient(env);

  try {
    const result = await amplifyClient.models.Users.get({
      id: userId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User info retrieved successfully",
        data: result.data,
      }),
    };
  } catch (error: any) {
    console.error("Error retrieving user info:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error retrieving user info",
        error: error.message,
      }),
    };
  }
};
