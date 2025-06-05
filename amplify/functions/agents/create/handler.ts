import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/createAgentFnc";
import { randomUUID } from "crypto";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const requestBody = JSON.parse(event.body || "{}");
  const {
    nameAgent,
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

  // version,
  // isPublic,
  // like_count,
  // total_interactions, Không tạo

  // Clients
  const amplifyClient = await getAmplifyClient(env);

  // Validate required fields
  if (!nameAgent || !creatorId || !introduction || !description || !foreword) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "Missing required fields: name, creator_id, introduction, description, or foreword",
      }),
    };
  }

  try {
    const createAgentResult = await amplifyClient.models.AiAgents.create({
      id: randomUUID().toString(),
      name: nameAgent,
      icon: "",
      description: description,
      introduction: introduction,
      foreword: foreword,
      create_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      suggested_questions: JSON.stringify(suggestedQuestions),
      creator_id: String(creatorId),
      is_public: 0,
      like_count: 0,
      total_interactions: 0,
      alias_ids: JSON.stringify(""), 
      sys_prompt: "",
      capabilities: JSON.stringify(""), 
      model: "",
      cost: 0,
      status: "ACTIVE",
      knowledge_base_url: "",
      last_version: "1.0.0",
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "User like created successfully",
        data: JSON.stringify(createAgentResult),
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
