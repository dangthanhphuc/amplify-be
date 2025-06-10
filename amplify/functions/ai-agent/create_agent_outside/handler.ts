import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { randomUUID } from "crypto";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/createAgentOutsideFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const requestBody = JSON.parse(event.body || "{}");
  const {
    name,
    introduction,
    description,
    foreword,
    lastVersion,
    creatorId,
    capabilities,
    cost,
  } = requestBody;
  console.log("Request body:", requestBody);

// id varchar(255) PK 
// icon varchar(255) 
// last_version varchar(20) 
// status varchar(50) 
// sys_prompt text 
// model varchar(255) 
// is_public tinyint(1) 
// type enum('ADMIN','EXPERT','OUTSIDE') 
// like_count int 
// total_interactions int
// suggestedQuestions



  // Validate required fields
  if (!name || !creatorId || !introduction || !description || !foreword || !lastVersion
    || !capabilities || !cost
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "Missing required fields: name, creatorId, introduction, description, foreword, lastVersion, capabilities, cost",}),
    };
  }

  // Clients
  const amplifyClient = await getAmplifyClient(env);
  // const amplifyClient = generateClient<Schema>();

  try {

    const existingUser = await amplifyClient.models.Users.get({
      id: creatorId,
    });

    if (!existingUser.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Creator not found",
        }),
      };
    }

    const result = await amplifyClient.models.AiAgents.create({
      id: randomUUID().toString(),
      name: name,
      introduction: introduction,
      description: description,
      foreword: foreword,
      last_version: lastVersion,
      creator_id: creatorId,
      capabilities: JSON.stringify(capabilities),
      cost: cost,
      like_count: 0,
      total_interactions: 0,
      is_public: 0,
      type: "OUTSIDE",
      status: "ACTIVE",
      knowledge_base_url: "",
      sys_prompt: "",
      suggested_questions: JSON.stringify([]),
      icon: "",
      model: "gpt-3.5-turbo",
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Agent outside created successfully",
        agent: result,
      }),
    }

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
