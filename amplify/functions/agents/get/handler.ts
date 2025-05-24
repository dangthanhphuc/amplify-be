import type { APIGatewayProxyHandler } from "aws-lambda";
import { getBedrockClient } from "../../../utils/clients";
import { getAllBedrockAgents } from "../../../services/bedrockService";
import { AiAgent } from "../../../interfaces/aiAgent";
import { transformAgentSummariesToModels } from "../../../utils/transform";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const bedrockClient = getBedrockClient();

    // 1. Lấy danh sách agents từ Bedrock (Chưa xử lý nextToken)
    // const maxResults = event.queryStringParameters?.maxResults;
    // const nextToken = event.queryStringParameters?.nextToken;
    // if (!maxResults || isNaN(Number(maxResults)))
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({
    //       message: "Missing maxResults parameter",
    //     }),
    //   };
    // else {
      

      const bedrockResponse = await getAllBedrockAgents(Number(10), undefined, bedrockClient)

      const aiAgents: AiAgent[] = await transformAgentSummariesToModels(bedrockResponse)

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Get all ai agents successfully!",
          body: {
            aiAgents: aiAgents,
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
