import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { env } from "$amplify/env/syncAllDataFromBedrockFnc";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { getBedrockClient } from "../../../utils/clients";
import { syncDataFromBebrock } from "../../../services/aiAgentService";
import { generateClient } from "aws-amplify/data";
import { Schema } from "../../../data/resource";
import { BedrockAgentClient, ListAgentsCommand } from "@aws-sdk/client-bedrock-agent";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  //Clients
  const amplifyClient = await getAmplifyClient(env);
  const bedrockClient = new BedrockAgentClient();
  const s = generateClient<Schema>();
  try {
    const result: any[] = [];

    const listAgentCommand = new ListAgentsCommand({
      maxResults: 200, // Adjust the limit as needed
    });
    const listAgent = await bedrockClient.send(listAgentCommand);
    const listAgentIds : string[] = [];
    listAgent.agentSummaries?.forEach((agent) => {
      listAgentIds.push(agent.agentId ?? "");
    });

    const syncAllDataPromises = listAgentIds.map(async (agentId : string) => {
      return await syncDataFromBebrock(amplifyClient, agentId, bedrockClient);
    });
    const versionResults = await Promise.all(syncAllDataPromises);
    result.push(...versionResults);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Agent data synced successfully",
        data: result,
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
