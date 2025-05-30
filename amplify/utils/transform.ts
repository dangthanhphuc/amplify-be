import {
  AgentSummary,
  ListAgentAliasesCommand,
  ListAgentAliasesResponse,
} from "@aws-sdk/client-bedrock-agent";
import { AiAgent } from "../interfaces/aiAgent";
import { getBedrockClient } from "./clients";

export async function transformAgentSummariesToModels(
  agentSummaries: AgentSummary[]
) {
  const aiAgents: AiAgent[] = [];
  const bedrockClient = getBedrockClient();
  const agentPromises = agentSummaries.map(async (agent) => {
    const aiAgentAlias: (string | undefined)[] = [];
    const agentId = agent.agentId;
    const maxTokenAlias = 10;
    let nextTokenAlias = undefined;

    // Get aliasIds on agentId
    do {
      const aiAgentAliasResponse: ListAgentAliasesResponse =
        await bedrockClient.send(
          new ListAgentAliasesCommand({
            maxResults: maxTokenAlias,
            nextToken: nextTokenAlias,
            agentId,
          })
        );
      aiAgentAlias.push(
        ...(aiAgentAliasResponse.agentAliasSummaries?.map(
          (alias) => alias.agentAliasId
        ) ?? [])
      );
      nextTokenAlias = aiAgentAliasResponse.nextToken;
    } while (nextTokenAlias != undefined);

    // Chuyển đổi alias thành mảng string
    const aiAgentAliasStrings: string[] = aiAgentAlias.filter(
      (id): id is string => typeof id === "string"
    );
    console.log("AI Agent Alias:", aiAgentAliasStrings);

    const aiAgent: AiAgent = {
      id: agent.agentId || "",
      aliasIds: aiAgentAliasStrings,
      name: agent.agentName || "",
      status: agent.agentStatus || "",
      description: agent.description || "",
      lastVersion: agent.latestAgentVersion || "",
      knowledgeBaseUrl: "",
      likeCount: 0,
      totalInteractions: 0,
      creatorId: 1,
      introduction: "",
      icon: "",
      foreword: "",
      sysPrompt: "",
      createAt: new Date(),
      model: "",
      capabilities: [],
      cost: 0,
      suggestQuestions: [],
    };
    console.log("AI Agent:", aiAgent);
    return aiAgent;
  });
  const newAgents = await Promise.all(agentPromises);
  aiAgents.push(...newAgents);

  return aiAgents;
}
