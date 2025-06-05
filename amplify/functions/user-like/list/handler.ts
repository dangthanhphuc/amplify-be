import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/listUserLikesFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const queryParams = event.queryStringParameters || {};
    const { userId, aiAgentId, limit = "20", nextToken } = queryParams;

    // Clients
    const amplifyClient = await getAmplifyClient(env);

    try {
        let result: {
            data: any[] | null;
            nextToken: string | null;
            errors: any[] | null;
            queryType: string | null;
        } = {
            data: null,
            nextToken: null,
            errors: null,
            queryType: null
        };

        if (userId) {
            // Filter by User ID
            const query = `
                query ListUserLikesByUserId($userId: String!, $limit: Int, $nextToken: String) {
                    listUserLikes(
                        filter: { user_id: { eq: $userId } }
                        limit: $limit
                        nextToken: $nextToken
                    ) {
                        items {
                            user_id
                            ai_agent_id
                            liked
                            create_at
                        }
                        nextToken
                    }
                }
            `;
            
            const variables = {
                userId: userId,
                limit: parseInt(limit),
                nextToken: nextToken || null
            };
            
            const response = await amplifyClient.graphql({
                query,
                variables
            });
            
            result = {
                data: response.data?.listUserLikes?.items || [],
                nextToken: response.data?.listUserLikes?.nextToken || null,
                errors: response.errors || null,
                queryType: 'userId'
            };

        } else if (aiAgentId) {
            // Filter by AI Agent ID
            const query = `
                query ListUserLikesByAgentId($aiAgentId: String!, $limit: Int, $nextToken: String) {
                    listUserLikes(
                        filter: { ai_agent_id: { eq: $aiAgentId } }
                        limit: $limit
                        nextToken: $nextToken
                    ) {
                        items {
                            user_id
                            ai_agent_id
                            liked
                            create_at
                        }
                        nextToken
                    }
                }
            `;
            
            const variables = {
                aiAgentId: aiAgentId,
                limit: parseInt(limit),
                nextToken: nextToken || null
            };
            
            const response = await amplifyClient.graphql({
                query,
                variables
            });
            
            result = {
                data: response.data?.listUserLikes?.items || [],
                nextToken: response.data?.listUserLikes?.nextToken || null,
                errors: response.errors || null,
                queryType: 'aiAgentId'
            };

        } else {
            // Get all user likes
            const query = `
                query ListUserLikes($limit: Int, $nextToken: String) {
                    listUserLikes(limit: $limit, nextToken: $nextToken) {
                        items {
                            user_id
                            ai_agent_id
                            liked
                            create_at
                        }
                        nextToken
                    }
                }
            `;
            
            const variables = {
                limit: parseInt(limit),
                nextToken: nextToken || null
            };
            
            const response = await amplifyClient.graphql({
                query,
                variables
            });
            
            result = {
                data: response.data?.listUserLikes?.items || [],
                nextToken: response.data?.listUserLikes?.nextToken || null,
                errors: response.errors || null,
                queryType: 'all'
            };
        }

        // Xử lý response cuối cùng
        if (result.errors && result.errors.length > 0) {
            console.error("GraphQL errors:", result.errors);
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "GraphQL query failed",
                    data: result.data,
                    errors: result.errors,
                    nextToken: result.nextToken
                })
            };
        }

        // Kiểm tra empty results và tạo message phù hợp
        const dataCount = result.data ? result.data.length : 0;
        let message = "User likes retrieved successfully";
        let statusCode = 200;

        if (dataCount === 0) {
            switch (result.queryType) {
                case 'userId':
                    message = `No likes found for user ID: ${userId}`;
                    break;
                case 'aiAgentId':
                    message = `No likes found for AI agent ID: ${aiAgentId}`;
                    break;
                case 'all':
                    message = "No user likes found in the system";
                    break;
                default:
                    message = "No data found";
            }
        } else {
            switch (result.queryType) {
                case 'userId':
                    message = `Found ${dataCount} likes for user ID: ${userId}`;
                    break;
                case 'aiAgentId':
                    message = `Found ${dataCount} likes for AI agent ID: ${aiAgentId}`;
                    break;
                case 'all':
                    message = `Found ${dataCount} user likes`;
                    break;
            }
        }

        return {
            statusCode,
            body: JSON.stringify({
                message,
                data: result.data,
                nextToken: result.nextToken,
                count: dataCount,
                isEmpty: dataCount === 0
            })
        }

    } catch (error) {
        console.error("Error listing user likes:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error listing user likes",
                error: error,
                data: null,
                count: 0,
                isEmpty: true
            }),
        };
    }
}
