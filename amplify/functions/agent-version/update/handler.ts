import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/updateAgentVersionFnc";
import {
  AgentVersionDTO,
  updateAgentVersion,
} from "../../../services/agentVersionService";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const requestBody = JSON.parse(event.body || "{}");
  const { aiAgentId, versionValue, description } = requestBody;

  // Clients
  const amplifyClient = await getAmplifyClient(env);

  try {
    const agentVersionDTO: AgentVersionDTO = {
      aiAgentId,
      versionValue,
      description,
    };

    const result = await updateAgentVersion(amplifyClient, agentVersionDTO);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Agent version updated successfully",
        data: result,
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
