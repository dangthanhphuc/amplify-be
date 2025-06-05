import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/listAiReviewsFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const queryParams = event.queryStringParameters || {};
    const { aiAgentId, reporterId, limit = "20", nextToken } = queryParams;

    // Clients
    const amplifyClient = await getAmplifyClient(env);

    try {
        let result;

        if (aiAgentId) {
            // Filter by AI Agent ID
            result = await amplifyClient.models.AiReviews.list({
                filter: {
                    ai_agent_id: {
                        eq: aiAgentId
                    }
                },
                limit: parseInt(limit),
                nextToken: nextToken || undefined
            });
        } else if (reporterId) {
            // Filter by Reporter ID
            result = await amplifyClient.models.AiReviews.list({
                filter: {
                    reporter_id: {
                        eq: reporterId
                    }
                },
                limit: parseInt(limit),
                nextToken: nextToken || undefined
            });
        } else {
            // Get all reviews
            result = await amplifyClient.models.AiReviews.list({
                limit: parseInt(limit), 
                nextToken: nextToken || undefined
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "AI reviews retrieved successfully",
                data: result.data,
                nextToken: result.nextToken
            })
        }

    } catch (error) {
        console.error("Error listing AI reviews:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error listing AI reviews",
                error: error,
            }),
        };
    }
}
