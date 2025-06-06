import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/deleteAiCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const requestBody = JSON.parse(event.body || "{}");
  console.log("Received request body:", JSON.stringify(requestBody, null, 2));
  const { agentCategoryId, aiAgentId } = requestBody;

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
 
    const aiCategoryExist = await amplifyClient.models.AiCategories.get({
      agent_category_id: agentCategoryId,
      ai_agent_id: aiAgentId,
    });

    if (!aiCategoryExist.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "AI category not found",
        }),
      };
    }

    // Delete the AI category
    const result = await amplifyClient.models.AiCategories.delete({
      agent_category_id: agentCategoryId,
      ai_agent_id: aiAgentId,
    });
    console.log("Delete result:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "AI category deleted successfully",
        agentCategoryId,
        aiAgentId,
      }),
    };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "AI category not found",
        }),
      };
    }

    console.error("Error deleting AI category:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
      }),
    };
  }
};
