import {
  BedrockAgentClient,
  ListAgentsCommand,
  ListAgentsCommandOutput,
  AgentSummary,
  ListAgentAliasesCommand,
  ListAgentAliasesResponse,
} from "@aws-sdk/client-bedrock-agent";
import { AiAgent } from "../interfaces/aiAgent";
import {
  BatchExecuteStatementCommand,
  RDSDataClient,
} from "@aws-sdk/client-rds-data";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

export async function getAllAgentsAndConvertAiAgent(
  bedrockClient: BedrockAgentClient
): Promise<AiAgent[]> {
  const aiAgents: AiAgent[] = [];
  const maxResults = 10;
  let nextToken = undefined;
  do {
    const bedrockResponse: ListAgentsCommandOutput = await bedrockClient.send(
      new ListAgentsCommand({
        maxResults,
        nextToken,
      })
    );
    console.log(
      "Bedrock response: agentSummaries",
      bedrockResponse.agentSummaries
    );
    if (bedrockResponse.agentSummaries) {
      const agentPromises = bedrockResponse.agentSummaries.map(
        async (agent) => {
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
          };
          console.log("AI Agent:", aiAgent);
          return aiAgent;
        }
      );
        const newAgents = await Promise.all(agentPromises);
        aiAgents.push(...newAgents);
    }

    nextToken = bedrockResponse.nextToken;
  } while (nextToken != null);

  return aiAgents;
}

export async function getAllBedrockAgents(
  maxResults: number,
  nextToken: string | undefined,
  bedrockClient: BedrockAgentClient
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

export async function initialDataForAiAgent(
  rdsArn: string,
  rdsDatabase: string,
  secretManagerClient: SecretsManagerClient,
  rdsClient: RDSDataClient,
  bedrockClient: BedrockAgentClient
) {
  try {
    const aiAgents: AiAgent[] = await getAllAgentsAndConvertAiAgent(bedrockClient);
    console.log("AI Agents:", aiAgents);

    const parameterSets = aiAgents.map((agent) => [
      { name: "id", value: { stringValue: agent.id } },
      { name: "name", value: { stringValue: agent.name } },
      { name: "status", value: { stringValue: agent.status } },
      { name: "description", value: { stringValue: agent.description } },
      { name: "lastVersion", value: { stringValue: agent.lastVersion } },
      {
        name: "knowledgeBaseUrl",
        value: { stringValue: agent.knowledgeBaseUrl },
      },
      { name: "likeCount", value: { longValue: agent.likeCount } },
      {
        name: "totalInteractions",
        value: { longValue: agent.totalInteractions },
      },
      { name: "creatorId", value: { stringValue: String(agent.creatorId || 1) } },
      {
        name: "introduction",
        value: { stringValue: agent.introduction || "" },
      },
      { name: "icon", value: { stringValue: agent.icon || "" } },
      { name: "foreword", value: { stringValue: agent.foreword || "" } },
      { name: "sysPrompt", value: { stringValue: agent.sysPrompt || "" } },
      {
        name: "createAt",
        value: { stringValue: agent.createAt.toISOString().replace(/\.\d{3}Z$/, '') },
      },
      { name: "model", value: { stringValue: agent.model || "" } },
      {
        name: "capabilities",
        value: { stringValue: JSON.stringify(agent.capabilities) },
      },
      { name: "cost", value: { doubleValue: agent.cost } },
      {
        name: "aliasIds",
        value: { stringValue: JSON.stringify(agent.aliasIds) },
      },
    ]);

    const secret = await secretManagerClient.send(
      new GetSecretValueCommand({ SecretId: "prod/RDS_SECRET_ARN" })
    );
    console.log("Secret", secret);

    const command = new BatchExecuteStatementCommand({
      resourceArn: rdsArn,
      secretArn: secret.ARN,
      database: rdsDatabase,
      sql: `
              INSERT INTO ai_agents (
                  id, name, status, description, last_version, knowledge_base_url,
                  like_count, total_interactions, creator_id, introduction, icon,
                  foreword, sys_prompt, create_at, model, capabilities, cost, alias_ids
              )
              VALUES (
                  :id, :name, :status, :description, :lastVersion, :knowledgeBaseUrl,
                  :likeCount, :totalInteractions, :creatorId, :introduction, :icon,
                  :foreword, :sysPrompt, :createAt, :model, :capabilities, :cost, :aliasIds
              )
          `,
      parameterSets,
    });

    const result = await rdsClient.send(command);
    console.log("RDS send command successful");

    return JSON.stringify({
      result,
      insertedAgents: aiAgents,
    });
  } catch (error) {
    console.error("Error inserting agents:", error);
    return JSON.stringify({
      message: "Error inserting agents",
      error: error,
    });
  }
}
