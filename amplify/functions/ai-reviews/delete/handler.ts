import { APIGatewayProxyHandlerV2, APIGatewayProxyResult } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/deleteAiReviewFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const reviewId = event.pathParameters?.reviewId;

    if (!reviewId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Review ID is required",
        }),
      };
    }

    // Clients
    const amplifyClient = await getAmplifyClient(env);

    // Delete the AI review
    await amplifyClient.models.AiReviews.delete({ id: reviewId });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Review deleted successfully",
        reviewId: reviewId,
      }),
    };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Review not found",
        }),
      };
    }

    console.error("Error deleting review:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
      }),
    };
  }
};
