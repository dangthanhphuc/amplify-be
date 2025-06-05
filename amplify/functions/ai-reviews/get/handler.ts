import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/getAiReviewFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const reviewId = event.pathParameters?.reviewId;
    
    if (!reviewId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing reviewId parameter",
            }),
        };
    }

    // Clients
    const amplifyClient = await getAmplifyClient(env);

    try {
        const result = await amplifyClient.models.AiReviews.get({
            id: reviewId
        });

        if (!result.data) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "AI review not found",
                }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "AI review retrieved successfully",
                data: result.data,
            })
        }

    } catch (error) {
        console.error("Error retrieving AI review:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error retrieving AI review",
                error: error,
            }),
        };
    }
}
