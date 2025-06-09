import type {
  APIGatewayProxyHandlerV2,
} from "aws-lambda";
import { env } from "$amplify/env/getAgentsFnc";
import { getAmplifyClient } from "../../../utils/clientUtil";


export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const queryParams = event.queryStringParameters || {};
  const { type, creatorId, limit = "20", nextToken } = queryParams;

  if( type && type !== "ADMIN" && type !== "EXPERT" && type !== "OUTSIDE") { 
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid type parameter. Must be one of: ADMIN, EXPERT, OUTSIDE.",
      }),
    };
  }

  // Clients
  const amplifyClient = await getAmplifyClient(env);

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
          "knowledge_base_url",
          "model",
          "status",
          "type",
          "sys_prompt",
          "suggested_questions",
          "name",
          "last_version",
          "is_public",
          "created_agents.name",
          "categories.agent_category.name",
          "categories.agent_category.id"
        ] as any;

    // ✅ Build filter dynamically based on provided parameters
    const filter: any = {};
    
    if (creatorId) {
      filter.creator_id = { eq: creatorId };
    }
    
    if (type) {
      filter.type = { eq: type };
    }   

    // ✅ Apply filter only if we have any filters, otherwise get all
    if (Object.keys(filter).length > 0) {
      result = await amplifyClient.models.AiAgents.list({
        filter: filter,
        limit: parseInt(limit),
        nextToken: nextToken || undefined,
        selectionSet: selectionSet,
      });
      console.log("Applied filters:", JSON.stringify(filter, null, 2));
    } else {
      // Get all ai agents when no filters
      result = await amplifyClient.models.AiAgents.list({
        limit: parseInt(limit),
        nextToken: nextToken || undefined,
        selectionSet: selectionSet,
      });
      console.log("No filters applied - fetching all agents");
    }


    // if (creatorId) {
    //   // Filter by Creator ID
    //   result = await amplifyClient.models.AiAgents.list({
    //     filter: {
    //       creator_id: {
    //         eq: creatorId,
    //       },
    //     },
    //     limit: parseInt(limit),
    //     nextToken: nextToken || undefined,
    //     selectionSet: selectionSet,
    //   });
    //   console.log("Filter:", JSON.stringify(result, null, 2));
    // } else if (type) {
    //   // Filter by Type
    //   result = await amplifyClient.models.AiAgents.list({
    //     filter: {
    //       type: {
    //         eq: type,
    //       },
    //     },
    //     limit: parseInt(limit),
    //     nextToken: nextToken || undefined,
    //     selectionSet: selectionSet,
    //   });
    //   console.log("Filter by type:", JSON.stringify(result, null, 2));
    // } else {
    //   // Get all ai agents
    //   result = await amplifyClient.models.AiAgents.list({
    //     limit: parseInt(limit),
    //     nextToken: nextToken || undefined,
    //     selectionSet: selectionSet,
    //   });
    // }
    const finalResult = result.data.map((data : any) => ({
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
