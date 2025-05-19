import type { APIGatewayProxyHandler } from "aws-lambda";
import { getBedrockAgents } from "../../../utils/bedrockClient";
import { getSecret } from "../../../utils/secretManager";
import { ExecuteStatementCommand } from "@aws-sdk/client-rds-data";
import { rdsClient } from "../../../utils/rdsClient";
import { env } from "$amplify/env/initialDataForAiAgentFnc";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // 1. Lấy danh sách agents từ Bedrock (Chưa xử lý nextToken)
    const maxResults = event.queryStringParameters?.maxResults;
    const nextToken = event.queryStringParameters?.nextToken;
    if (!maxResults)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing maxResults parameter",
        }),
      };
    const bedrockResponse = await getBedrockAgents(
      Number(maxResults),
      nextToken
    );

    // 2. Lấy secret để truy cập RDS
    const secretResponse = await getSecret("prod/RDS_SECRET_ARN");

    // 3. Lưu từng agent vào RDS (giả sử bảng agents có cột id, name, description)
    if (bedrockResponse.agentSummaries) {
      for (const agent of bedrockResponse.agentSummaries) {
        const result = rdsClient.send(
          new ExecuteStatementCommand({
            resourceArn: env.RDS_ARN,
            secretArn: secretResponse.ARN,
            database: env.RDS_DATABASE,
            includeResultMetadata: true,
            sql: `
                    INSERT INTO agents (id, name, description)
                    VALUES (:id, :name, :desc)
                    ON DUPLICATE KEY UPDATE name = :name, description = :desc
                `,
            parameters: [
              { name: "id", value: { stringValue: agent.agentId ?? "" } },
              { name: "name", value: { stringValue: agent.agentName ?? "" } },
              { name: "desc", value: { stringValue: agent.description ?? "" } },
            ],
          })
        );
      }
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Agents fetched and stored successfully",
        }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error fetching agents",
          error: "Agent summaries not found",
        }),
      };
    }
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
