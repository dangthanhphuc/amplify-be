import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { env } from "$amplify/env/getAgentsFnc";
import { getAmplifyClient, initializeAmplifyClient } from "../../../utils/clientUtil";
import { generateClient } from "aws-amplify/data";
import { Schema } from "../../../data/resource";
import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const queryParams = event.queryStringParameters || {};
  const { isPublic , agentId, type, creatorId, limit = "20", nextToken } = queryParams;

  if (type && type !== "ADMIN" && type !== "EXPERT" && type !== "OUTSIDE") {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "Invalid type parameter. Must be one of: ADMIN, EXPERT, OUTSIDE.",
      }),
    };
  }

  // Clients
  await initializeAmplifyClient(env);
  const amplifyClient = generateClient<Schema>();
 
  try {
    let result;

    const selectionSet = [
      "capabilities",
      "cost",
      "description",
      "foreword",
      "id",
      "icon",
      "introduction",
      "model",
      "status",
      "type",
      "sys_prompt",
      "suggested_questions",
      "name",
      "last_version",
      "is_public",
      "like_count",
      "created_agents.name",
      "categories.agent_category.name",
      "categories.agent_category.id",
      "versions.*",
      "version_value_use",
      "knowledge_base.data_source_url"
    ] as any;

    // ✅ Build filter dynamically based on provided parameters
    const filter: any = {};

    if (creatorId) {
      filter.creator_id = { eq: creatorId };
    }

    if (type) {
      filter.type = { eq: type };
    }

    if( isPublic) 
      filter.is_public = { eq: isPublic ? 1 : 0 };
    

    const se =generateClient <Schema>();
    // ✅ Apply filter only if we have any filters, otherwise get all
    if (agentId) {
      // If agentId is provided, fetch a specific agent
      result = await se.models.AiAgents.get({
        id: agentId}, 
        {
          selectionSet: selectionSet
        }
      );
      if (!result) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Ai agent not found",
          }),
        };
      }
      console.log("Fetched specific agent:", result);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Ai agent retrieved successfully",
          data: result,
        }),
      };
    } else if (Object.keys(filter).length > 0) {
      result = await amplifyClient.models.AiAgents.list({
        filter: filter,
        limit: parseInt(limit),
        nextToken: nextToken || undefined,
        selectionSet: selectionSet
      });
      console.log("Applied filters:", JSON.stringify(filter, null, 2));
    } else {
      // Get all ai agents when no filters
      result = await amplifyClient.models.AiAgents.list({
        filter: { is_public: { eq: 1 }, and: { type: { ne: "OUTSIDE" } } }, 
        limit: parseInt(limit),
        nextToken: nextToken || undefined,
        selectionSet: selectionSet,
      });
      console.log("No filters applied - fetching all agents");
    }

    const finalResult = result.data.map((data: any) => ({
      ...data,
      suggested_questions: JSON.parse(data.suggested_questions ?? "[]"),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Ai agent retrieved successfully",
        data: finalResult,
        nextToken: result.nextToken,
      }),
    };
  } catch (error: any) {
    console.error("Error fetching agents:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching agents",
        error: error.message || "Unknown error",
      }),
    };
  }
};
