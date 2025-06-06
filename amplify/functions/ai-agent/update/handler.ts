import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  getAmplifyClient,
  initializeAmplifyClient,
} from "../../../utils/clientUtil";
import { env } from "$amplify/env/updateAgentFnc";
import { generateClient } from "aws-amplify/data";
import { Schema } from "../../../data/resource";
import { getVietnamTimestamp } from "../../../utils/transform";

const fieldMapping: { [key: string]: string } = {
  name: "name",
//   icon: "icon",
  introduction: "introduction",
  description: "description",
  foreword: "foreword",
  lastVersion: "last_version",
  last_version: "last_version",
  status: "status",
  likeCount: "like_count",
  totalInteractions: "total_interactions",
  creatorId: "creator_id",
  knowledgeBaseUrl: "knowledge_base_url",
  sysPrompt: "sys_prompt",
  model: "model",
  capabilities: "capabilities",
//   aliasIds: "alias_ids",
  cost: "cost",
  suggestedQuestions: "suggested_questions",
  isPublic: "is_public",
  type: "type",
};


export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // Extract agent ID from path parameters
  const agentId = event.pathParameters?.agentId;
  if (!agentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Agent ID is required" }),
    };
  }

  // Parse request body
  const requestBody = JSON.parse(event.body || "{}");

  // Validate at least one field to update
  if (Object.keys(requestBody).length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "At least one field must be provided for update",
      }),
    };
  }

  // Clients
  const amplifyClient = await getAmplifyClient(env);

  try {
    // Transform request body to database format
    const updateData: any = {};

    Object.keys(requestBody).forEach((key) => {
      const dbField = fieldMapping[key];
      if (dbField && requestBody[key] !== undefined) {
        updateData[dbField] = requestBody[key];
      }
    });

    if (requestBody.capabilities) {
      updateData.capabilities = JSON.stringify(requestBody.capabilities);
    }
    if (requestBody.alias_ids) {
      updateData.alias_ids = JSON.stringify(requestBody.alias_ids);
    }
    if (requestBody.suggested_questions) {
      updateData.suggested_questions = JSON.stringify(
        requestBody.suggested_questions
      );
    }

    // Prepare update input for GraphQL
    console.log("Update data:", updateData);
    const updateInput = {
      id: agentId,
      ...updateData,
      updated_at: getVietnamTimestamp(),
    };

    // Execute GraphQL mutation
    const result = await amplifyClient.models.AiAgents.update(updateInput);

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Update failed",
          details: result.errors,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Agent updated successfully",
        data: result.data,
      }),
    };
  } catch (error) {
    console.error("Update agent error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
