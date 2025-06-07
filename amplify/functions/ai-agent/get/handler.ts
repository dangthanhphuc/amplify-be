import type {
  APIGatewayProxyHandler,
  APIGatewayProxyHandlerV2,
} from "aws-lambda";
import { getRdsClient, getSecretManagerClient } from "../../../utils/clients";
import { getAllAiAgents } from "../../../services/rdsService";
import { AiAgentResponse } from "../../../interfaces/response/aiAgentResponse";
import { env } from "$amplify/env/getAgentsFnc";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { initializeAmplifyClient } from "../../../utils/clientUtil";
import { generateClient } from "aws-amplify/data";
import { Schema } from "../../../data/resource";

// export const handler: APIGatewayProxyHandler = async (event) => {
//   try {

//     // Required clients
//     const rdsClient = getRdsClient();
//     const secretManagerClient = getSecretManagerClient();

//     // Get all ai_agents from db included ai_categories
//     const secret = await secretManagerClient.send(
//       new GetSecretValueCommand({ SecretId: "prod/RDS_SECRET_ARN" })
//     );

//     const aiAgentResponse: AiAgentResponse[] = await getAllAiAgents(
//       rdsClient,
//       env.RDS_ARN,
//       secret.ARN ?? "",
//       env.RDS_DATABASE
//     );

//       return {
//         statusCode: 200,
//         body: JSON.stringify({
//           message: "Get all ai agents successfully!",
//           body: {
//             aiAgents: aiAgentResponse,
//           },
//         }),
//       };

//   } catch (error: any) {
//     console.error("Error fetching agents:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: "Error fetching agents",
//         error: error,
//       }),
//     };
//   }
// };

await initializeAmplifyClient(env);

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const queryParams = event.queryStringParameters || {};
  const { creatorId, limit = "20", nextToken } = queryParams;

  // Clients
  const amplifyClient = generateClient<Schema>();

  try {
    let result;

    const selectionSet = [
          "alias_ids",
          "capabilities",
          "cost",
          "create_at",
          "description",
          "foreword",
          "id",
          "icon",
          "introduction",
          "knowledge_base_url",
          "model",
          "status",
          "updated_at",
          "total_interactions",
          "type",
          "sys_prompt",
          "suggested_questions",
          "name",
          "like_count",
          "last_version",
          "is_public",
          "created_agents.name",
          "categories.agent_category.name",
          "categories.agent_category.id"
        ] as any;

    if (creatorId) {
      // Filter by Creator ID
      result = await amplifyClient.models.AiAgents.list({
        filter: {
          creator_id: {
            eq: creatorId,
          },
        },
        limit: parseInt(limit),
        nextToken: nextToken || undefined,
        selectionSet: selectionSet,
      });
    } else {
      // Get all ai agents
      result = await amplifyClient.models.AiAgents.list({
        limit: parseInt(limit),
        nextToken: nextToken || undefined,
        selectionSet: selectionSet,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Ai agent retrieved successfully",
        data: result.data,
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
