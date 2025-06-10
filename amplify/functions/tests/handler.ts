import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../utils/clientUtil";
import { env } from "$amplify/env/testFnc";
import { syncDataFromBebrock } from "../../services/aiAgentService";
import { getBedrockClient } from "../../utils/clients";

export const handler : APIGatewayProxyHandlerV2 = async (event) => {

  const queryParams = event.queryStringParameters || {};
  const { aiAgentId } = queryParams;

  if(!aiAgentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "aiAgentId is required."
      })
    };
  }

  //Clients
  const amplifyClient = await getAmplifyClient(env);
  const bedrockClient = getBedrockClient();
  try {

    const agentData = await syncDataFromBebrock(amplifyClient, aiAgentId, bedrockClient);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Agent data synced successfully",
        data: agentData,
      }),
    };
  } catch (error: any) {
    console.error("Error log: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error syncing agent data",
        error: error.message || "Unknown error",
      }),
    };
  }
};
