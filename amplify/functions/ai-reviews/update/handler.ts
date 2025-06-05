import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/updateAiReviewFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const reviewId = event.pathParameters?.reviewId;
    const requestBody = JSON.parse(event.body || '{}');
    const { description, rating, reportCatergoriesId } = requestBody;
    
    if (!reviewId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing reviewId parameter",
            }),
        };
    }

    if (!description && !rating && !reportCatergoriesId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "At least one field must be provided for update",
            }),
        };
    }

    // Clients
    const amplifyClient = await getAmplifyClient(env);

    try {
        // First check if the review exists
        const existingReview = await amplifyClient.models.AiReviews.get({
            id: reviewId
        });

        if (!existingReview.data) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "AI review not found",
                }),
            };
        }

        // Update the review
        const updateData: any = {
            id: reviewId,
            // updatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "")
        };

        if (description !== undefined) updateData.description = description;
        if (rating !== undefined) updateData.rating = rating;
        if (reportCatergoriesId !== undefined) updateData.report_categories_id = reportCatergoriesId;

        const result = await amplifyClient.models.AiReviews.update(updateData);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "AI review updated successfully",
                data: result.data,
            })
        }

    } catch (error) {
        console.error("Error updating AI review:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error updating AI review",
                error: error,
            }),
        };
    }
}
