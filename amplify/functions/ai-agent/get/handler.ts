import type { APIGatewayProxyHandler } from "aws-lambda";
import { getRdsClient, getSecretManagerClient } from "../../../utils/clients";
import { getAllAiAgents } from "../../../services/rdsService";
import { AiAgentResponse } from "../../../interfaces/response/aiAgentResponse";
import { env } from "$amplify/env/getAgentsFnc";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    
    // Required clients
    const rdsClient = getRdsClient();
    const secretManagerClient = getSecretManagerClient();

    // Get all ai_agents from db included ai_categories
    const secret = await secretManagerClient.send(
      new GetSecretValueCommand({ SecretId: "prod/RDS_SECRET_ARN" })
    );

    const aiAgentResponse: AiAgentResponse[] = await getAllAiAgents(
      rdsClient,
      env.RDS_ARN,
      secret.ARN ?? "",
      env.RDS_DATABASE
    );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Get all ai agents successfully!",
          body: {
            aiAgents: aiAgentResponse,
          },
        }),
      };
    // }

  } catch (error: any) {
    console.error("Error fetching agents:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching agents",
        error: error,
      }),
    };
  }
};
