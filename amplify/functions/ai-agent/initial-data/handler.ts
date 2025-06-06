import type { APIGatewayProxyHandler } from "aws-lambda";
import { RDSDataClient } from "@aws-sdk/client-rds-data";
import { initialDataForAiAgent } from "../../../services/bedrockService";
import { BedrockAgentClient } from "@aws-sdk/client-bedrock-agent";
import {
  SecretsManagerClient
} from "@aws-sdk/client-secrets-manager";
import { env } from "$amplify/env/initialDataForAiAgentFnc";

const region = "us-east-1";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const rdsClient = new RDSDataClient({
      region
    });
    const bedrockClient = new BedrockAgentClient({
      region
    });
    const secretManagerClient = new SecretsManagerClient({
      region
    });

    const result = await initialDataForAiAgent(
      env.RDS_ARN,
      env.RDS_DATABASE,
      secretManagerClient,
      rdsClient,
      bedrockClient
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Agents fetched and stored successfully",
        result,
      }),
    };

  } catch (error) {
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
