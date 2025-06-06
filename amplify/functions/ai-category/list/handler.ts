import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient, initializeAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/listAiCategoriesFnc";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../../data/resource";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const queryParams = event.queryStringParameters || {};
    const { agentCategoryId, aiAgentId, limit = "20", nextToken } = queryParams;
    
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

        if (agentCategoryId) {
            // Filter by Agent Category ID
            const query = `
                query ListAiCategoriesByAgentCategoryId($agentCategoryId: String!, $limit: Int, $nextToken: String) {
                    listAiCategories(
                        filter: { agent_category_id: { eq: $agentCategoryId } }
                        limit: $limit
                        nextToken: $nextToken
                    ) {
                        items {
                            agent_category_id
                            ai_agent_id
                        }
                        nextToken
                    }
                }
            `;
            
            const variables = {
                agentCategoryId: agentCategoryId,
                limit: parseInt(limit),
                nextToken: nextToken || null
            };
            
            const response = await amplifyClient.graphql({
                query,
                variables
            });
            
            result = {
                data: response.data?.listAiCategories?.items || [],
                nextToken: response.data?.listAiCategories?.nextToken || null,
                errors: response.errors || null,
                queryType: 'agentCategoryId'
            };

        } else if (aiAgentId) {
            // Filter by AI Agent ID
            const query = `
                query ListAiCategoriesByAgentId($aiAgentId: String!, $limit: Int, $nextToken: String) {
                    listAiCategories(
                        filter: { ai_agent_id: { eq: $aiAgentId } }
                        limit: $limit
                        nextToken: $nextToken
                    ) {
                        items {
                            agent_category_id
                            ai_agent_id
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
                data: response.data?.listAiCategories?.items || [],
                nextToken: response.data?.listAiCategories?.nextToken || null,
                errors: response.errors || null,
                queryType: 'aiAgentId'
            };

        } else {
            // Get all AI categories
            const query = `
                query ListAiCategories($limit: Int, $nextToken: String) {
                    listAiCategories(limit: $limit, nextToken: $nextToken) {
                        items {
                            agent_category_id
                            ai_agent_id
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
                data: response.data?.listAiCategories?.items || [],
                nextToken: response.data?.listAiCategories?.nextToken || null,
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
        let message = "AI categories retrieved successfully";
        let statusCode = 200;

        if (dataCount === 0) {
            switch (result.queryType) {
                case 'agentCategoryId':
                    message = `No AI categories found for agent category ID: ${agentCategoryId}`;
                    break;
                case 'aiAgentId':
                    message = `No AI categories found for AI agent ID: ${aiAgentId}`;
                    break;
                case 'all':
                    message = "No AI categories found in the system";
                    break;
                default:
                    message = "No data found";
            }
        } else {
            switch (result.queryType) {
                case 'agentCategoryId':
                    message = `Found ${dataCount} AI categories for agent category ID: ${agentCategoryId}`;
                    break;
                case 'aiAgentId':
                    message = `Found ${dataCount} AI categories for AI agent ID: ${aiAgentId}`;
                    break;
                case 'all':
                    message = `Found ${dataCount} AI categories`;
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
        console.error("Error listing AI categories:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error listing AI categories",
                error: error,
                data: null,
                count: 0,
                isEmpty: true
            }),
        };
    }
};
