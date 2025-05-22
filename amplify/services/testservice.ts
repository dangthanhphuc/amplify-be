import { AgentSummary, BedrockAgentClient, ListAgentsCommand, ListAgentsCommandOutput } from "@aws-sdk/client-bedrock-agent";

export async function getAllBedrockAgents(
bedrockClient: BedrockAgentClient,
  maxResults: number,
  nextToken: string | undefined
): Promise<AgentSummary[]> {
  const listAgentsSummary: AgentSummary[] = [];
  do {
    const bedrockResponse: ListAgentsCommandOutput = await bedrockClient.send(
      new ListAgentsCommand({
        maxResults,
        nextToken,
      })
    );
    listAgentsSummary.push(...(bedrockResponse.agentSummaries || []));
    nextToken = bedrockResponse.nextToken;
  } while (nextToken != null);
  return listAgentsSummary;
}
