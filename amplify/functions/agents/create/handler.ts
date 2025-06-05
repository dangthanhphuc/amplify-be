import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/createAgentFnc";
import { randomUUID } from "crypto";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../../data/resource";
import { getRdsClient, getSecretManagerClient } from "../../../utils/clients";
import {
  ExecuteStatementCommand,
  RDSDataClient,
} from "@aws-sdk/client-rds-data";
import { getSecret } from "../../../services/secretManagerService";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const requestBody = JSON.parse(event.body || "{}");
  const {
    name,
    // icon,
    introduction,
    description,
    foreword,
    creatorId,
    suggestedQuestions,
    // cost,
    // knowledge_base_url,
    // model,
    // sys_prompt,
    // capabilities,
    // alias,
  } = requestBody;
  console.log("Request body:", requestBody);

  // version,
  // isPublic,
  // like_count,
  // total_interactions, Không tạo

  // Clients
  // const amplifyClient = await getAmplifyClient(env);
  const rdsClient = new RDSDataClient();

  // Validate required fields
  if (!name || !creatorId || !introduction || !description || !foreword) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "Missing required fields: name, creator_id, introduction, description, or foreword",
      }),
    };
  }

  const agentId = randomUUID().toString();
  const createAt = new Date().toISOString().replace(/\.\d{3}Z$/, "");
  const updatedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "");

  const insertQuery = `
  INSERT INTO ai_agents (
    id, name, icon, description, introduction, foreword,
    create_at, updated_at, suggested_questions, creator_id,
    is_public, like_count, total_interactions, alias_ids,
    sys_prompt, capabilities, model, cost, status,
    knowledge_base_url, last_version
  ) VALUES (
    :id, :name, :icon, :description, :introduction, :foreword,
    :create_at, :updated_at, :suggested_questions, :creator_id,
    :is_public, :like_count, :total_interactions, :alias_ids,
    :sys_prompt, :capabilities, :model, :cost, :status,
    :knowledge_base_url, :last_version
  )
`;



  try {
    const secretManagerClient = getSecretManagerClient();
    const secretValue = await getSecret(
      secretManagerClient,
      "prod/RDS_SECRET_ARN"
    );

    const result = await rdsClient.send(
  new ExecuteStatementCommand({
    resourceArn: env.RDS_ARN,
    secretArn: secretValue.ARN,
    database: env.RDS_DATABASE,
    sql: insertQuery,
    parameters: [
      { name: "id", value: { stringValue: agentId } },
      { name: "name", value: { stringValue: name } },
      { name: "icon", value: { stringValue: "public-images/ai.png" } },
      { name: "description", value: { stringValue: description } },
      { name: "introduction", value: { stringValue: introduction } },
      { name: "foreword", value: { stringValue: foreword } },
      { name: "create_at", value: { stringValue: createAt } },
      { name: "updated_at", value: { stringValue: updatedAt } },
      { name: "suggested_questions", value: { stringValue: JSON.stringify(suggestedQuestions || []) } },
      { name: "creator_id", value: { stringValue: String(creatorId) } },
      { name: "is_public", value: { longValue: 0 } },
      { name: "like_count", value: { longValue: 0 } },
      { name: "total_interactions", value: { longValue: 0 } },
      { name: "alias_ids", value: { stringValue: JSON.stringify([]) } },
      { name: "sys_prompt", value: { stringValue: "" } },
      { name: "capabilities", value: { stringValue: JSON.stringify([]) } },
      { name: "model", value: { stringValue: "" } },
      { name: "cost", value: { doubleValue: 0 } },
      { name: "status", value: { stringValue: "ACTIVE" } },
      { name: "knowledge_base_url", value: { stringValue: "" } },
      { name: "last_version", value: { stringValue: "1.0.0" } },
    ],
  })
);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "User like created successfully",
        data: JSON.stringify(result),
      }),
    };
  } catch (error) {
    console.error("Error creating user like:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating agent",
        error: error,
      }),
    };
  }
};
