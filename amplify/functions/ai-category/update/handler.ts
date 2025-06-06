import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/updateAiCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
  const queryParams = event.queryStringParameters || {};
  const { updateAgentCategoryId, updateAiAgentId } = queryParams;
  
  const requestBody = JSON.parse(event.body || "{}");
  console.log("Received request body:", JSON.stringify(requestBody, null, 2));
  const { agentCategoryId, aiAgentId } = requestBody;

  if (!updateAgentCategoryId || !updateAiAgentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required query parameters: updateAgentCategoryId or updateAiAgentId",
      }),
    };
  }

  if (!agentCategoryId || !aiAgentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required field: agentCategoryId or aiAgentId",
      }),
    };
  }
  
  const amplifyClient = await getAmplifyClient(env);

  try {
    const existingCategory = await amplifyClient.models.AiCategories.get({
      agent_category_id: updateAgentCategoryId,
      ai_agent_id: updateAiAgentId,
    });

    if (!existingCategory.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "AI category not found for the given agent category and AI agent",
        }),
      };
    }

    // Check if the new agentCategoryId exists in AgentCategories table
    const existingAgentCategory = await amplifyClient.models.AgentCategories.get({
      id: agentCategoryId,
    });

    if (!existingAgentCategory.data) {
      return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Agent category not found",
      }),
      };
    }

    // Check if the new aiAgentId exists in AiAgents table
    const existingAiAgent = await amplifyClient.models.AiAgents.get({
      id: aiAgentId,
    });

    if (!existingAiAgent.data) {
      return {
      statusCode: 404,
      body: JSON.stringify({
        error: "AI agent not found",
      }),
      };
    }

    // Check if the new agentCategoryId and aiAgentId combination already exists
    const existingNewCategory = await amplifyClient.models.AiCategories.get({
      agent_category_id: agentCategoryId,
      ai_agent_id: aiAgentId,
    });

    if (existingNewCategory.data) {
      return {
      statusCode: 409,
      body: JSON.stringify({
        error: "AI category with the new agentCategoryId and aiAgentId combination already exists",
      }),
      };
    }

    const aiCategoryUpdated = await amplifyClient.models.AiCategories.update({
      agent_category_id: agentCategoryId,
      ai_agent_id: aiAgentId,
    });

    if (!aiCategoryUpdated.data) {
      console.error("AI category update failed:", aiCategoryUpdated);
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Ai category not found",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Ai category updated successfully",
        data: aiCategoryUpdated.data
      }),
    };
  } catch (error: any) {
    console.error("Error updating AI category:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
      }),
    };
  }
};
