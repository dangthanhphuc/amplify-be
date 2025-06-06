import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/deleteAgentFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const { agentId } = event.pathParameters || {};

  if (!agentId) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Agent ID is required",
      }),
    };
  }

  const amplifyClient = await getAmplifyClient(env);
  try {
    const agentExist = await amplifyClient.models.AiAgents.get({
      id: agentId,
    });

    if (!agentExist.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Agent not found",
        }),
      };
    }

    // Delete the agent
    const result = await amplifyClient.models.AiAgents.delete({
      id: agentId,
    });

    console.log("Delete result:", result);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Agent deleted successfully",
        agentId: agentId,
      }),
    };
  } catch (error: any) {
    console.error("Error deleting agent:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Error deleting agent",
      }),
    };
  }
};
