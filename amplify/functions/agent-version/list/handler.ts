import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/listAgentVersionFnc";
import { listAgentVersion } from "../../../services/agentVersionService";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const queryParams = event.queryStringParameters || {};
  const { aiAgentId, versionValue, limit = "20", nextToken } = queryParams;

  // Clients
  const amplifyClient = await getAmplifyClient(env);

  try {
    const result = await listAgentVersion(
      amplifyClient,
      aiAgentId,
      versionValue,
      parseInt(limit),
      nextToken
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Agent version created successfully",
        body: result,
      }),
    };
  } catch (error) {
    console.error("Error in handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Catch internal Server Error" }),
    };
  }
};
