import { APIGatewayProxyHandler } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/createAiReviewFnc";
import { randomUUID } from "crypto";


export const handler : APIGatewayProxyHandler = async (event: any) => {
    const requestBody = JSON.parse(event.body || '{}');
    console.log("Received request body:", JSON.stringify(requestBody, null, 2));
    const { description, rating, aiAgentId, reporterId, reportCatergoriesId } = requestBody;
    
    if (!description || !rating || !aiAgentId || !reporterId || !reportCatergoriesId) {
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

        const result = await amplifyClient.models.AiReviews.create({
            id: randomUUID().toString(),
            description: description,
            rating: rating,
            created_at: new Date().toISOString(),
            ai_agent_id: aiAgentId,
            reporter_id: reporterId,
            report_categories_id: reportCatergoriesId
        })
        console.log("AI date:", new Date().toISOString());
        console.log("AI Review result:", JSON.stringify(result, null, 2));

        return {
            statusCode: 201,    
            body: JSON.stringify({
                message: "AI review created successfully",
                data: result.data,
            })
        }

    } catch (error) {
        console.error("Error creating AI review:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error creating AI review",
                error: error,
            }),
        };
    }
}