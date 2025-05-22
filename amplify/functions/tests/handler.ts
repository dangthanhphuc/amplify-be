import type { APIGatewayProxyHandler } from "aws-lambda";
import {
  BedrockAgentClient,
  AgentSummary
} from "@aws-sdk/client-bedrock-agent";
import { getAllBedrockAgents } from "../../services/testservice";
import { getBedrockClient } from "../../utils/clients";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const bedrockClient = getBedrockClient();

    // 1. Lấy danh sách agents từ Bedrock (Chưa xử lý nextToken)
    const maxResults = event.queryStringParameters?.maxResults;
    const nextToken = event.queryStringParameters?.nextToken;
    if (!maxResults || isNaN(Number(maxResults)))
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing maxResults parameter",
        }),
      };
    else {
      const listAgentsSummary: AgentSummary[] = [];

      const bedrockResponse = await getAllBedrockAgents(bedrockClient, Number(maxResults), undefined)

      listAgentsSummary.push(...(bedrockResponse || []));

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Hello from the API function!",
          body: {
            agentCategories: listAgentsSummary,
          },
        }),
      };
    }

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
