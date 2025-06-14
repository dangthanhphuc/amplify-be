import { generateClient } from "aws-amplify/data";
import { Schema } from "../data/resource";
import {
  AgentAliasStatus,
  AgentAliasSummary,
  AgentSummary,
  BedrockAgentClient,
  ListAgentAliasesCommand,
  ListAgentAliasesCommandOutput,
  ListAgentAliasesResponse,
  ListAgentsCommand,
  ListAgentsCommandOutput,
  GetAgentCommand,
} from "@aws-sdk/client-bedrock-agent";
import { AiAgent, AgentVersion } from "../interfaces/aiAgent";

const s = generateClient<Schema>();

interface AgentAliasBebrock {
  id: string;
  name: string;
  enable: number;
  description: string;
  status: AgentAliasStatus;
  createdAt: string;
  updatedAt: string;
}

export async function syncDataFromBebrock(
  amplifyClient: any,
  aiAgentId: string,
  bedrockClient: BedrockAgentClient
) {
  console.log("🚀 [syncDataFromBebrock] Starting sync process", {
    aiAgentId,
    timestamp: new Date().toISOString(),
  });

  try {
    // 1. Tìm kiếm Agent trong Bedrock theo aiAgentId
    console.log("🔍 [syncDataFromBebrock] Searching for Agent in Bedrock...", {
      aiAgentId,
    });

    let bedrockAgent = null;
    try {
      // 1. Get Agent from Bedrock
      const getAgentResponse = await bedrockClient.send(
        new GetAgentCommand({ agentId: aiAgentId })
      );
      bedrockAgent = getAgentResponse.agent;
      console.log("✅ [syncDataFromBebrock] Agent found in Bedrock:", {
        agentId: bedrockAgent?.agentId,
        agentName: bedrockAgent?.agentName,
        status: bedrockAgent?.agentStatus,
      });
    } catch (error: any) {
      if (error.name === "ResourceNotFoundException") {
        console.error("❌ [syncDataFromBebrock] Agent not found in Bedrock:", {
          aiAgentId,
        });
        return {
          success: false,
          error: `Agent with ID ${aiAgentId} not found in Bedrock`,
          errorCode: "AGENT_NOT_FOUND",
        };
      }
      throw error;
    }

    // 2. Check agent exist
    if (!bedrockAgent) {
      // If not found in Bedrock, return error
      console.error(
        "❌ [syncDataFromBebrock] No agent data returned from Bedrock"
      );
      return {
        success: false,
        error: "No agent data returned from Bedrock",
        errorCode: "NO_AGENT_DATA",
      };
    }

    // 3. List Agent Aliases from Bedrock
    console.log(
      "📋 [syncDataFromBebrock] Fetching Agent Aliases from Bedrock..."
    );
    const bedrockAliases = await listAgentAliasFormBebrock(
      bedrockClient,
      aiAgentId 
    );

    const sortedAliases = bedrockAliases.sort((a, b) => { 
      const dateA = new Date(a.updatedAt); 
      const dateB = new Date(b.updatedAt);
      console.log("dateA: ", dateA, "dateB: ", dateB);
      return dateB.getTime() - dateA.getTime();
    });

    const aliasIdNewest = sortedAliases[0];
    console.log("Alias newest: ", JSON.stringify(aliasIdNewest, null, 2));

    console.log("✅ [syncDataFromBebrock] Agent Aliases retrieved:", {
      aliasCount: bedrockAliases.length,
      aliases: bedrockAliases.map((alias) => ({
        id: alias.id,
        status: alias.status,
      })),
    });

    // 3. Get agent from mysql
    console.log(
      "🔍 [syncDataFromBebrock] Checking if Agent exists in database..."
    );
    const existingAgent = await amplifyClient.models.AiAgents.get({
      id: aiAgentId,
    });
    console.log("Existing agent : ", JSON.stringify(existingAgent, null, 2));

    let agentResult;
    let versionsResults = [];

    // 4. If agent exists in database, update it, otherwise create a new one
    const resultData: any[] = [];
    if (existingAgent.data) {
      // 4a. Cập nhật Agent đã tồn tại
      console.log(
        "🔄 [syncDataFromBebrock] Updating existing Agent in database...",
        {
          agentId: aiAgentId,
          currentStatus: existingAgent.data.status,
          newStatus: bedrockAgent.agentStatus,
        }
      );

      agentResult = await amplifyClient.models.AiAgents.update({
        id: aiAgentId,
        introduction: existingAgent.data.introduction,
        description: existingAgent.data.description,
        status: bedrockAgent.agentStatus || existingAgent.data.status,
        last_version:
          bedrockAgent.agentVersion || existingAgent.data.last_version,
        model: bedrockAgent.foundationModel || existingAgent.data.model,
        version_value_use: aliasIdNewest.id,
      });
      console.log("Agent updated result: ", JSON.stringify(agentResult, null, 2));

      // ✅ Fix: Process versions properly with await
      if (bedrockAliases.length > 0) {
        // Get existing versions from database

        const query = `
          query ListAgentVersionsByAgentId($aiAgentId: String!) {
            listAgentVersions(
              filter: { ai_agent_id: { eq: $aiAgentId } }
            ) {
              items {
                ai_agent_id
                description
                update_at
                version_value
                created_at
                enable
                name
                status
              }
            }
          }
        `;

        const variables = {
          aiAgentId: aiAgentId, 
        };
        
        const existingVersions = await amplifyClient.graphql({
          query,
          variables
        });
        console.log("Existing versions: ", JSON.stringify(existingVersions, null, 2));

        const existingVersionsMap = new Map();
        existingVersions.data?.listAgentVersions?.items?.forEach((version: any) => {
          existingVersionsMap.set(version.version_value, version);
        });

        // ✅ Fix: Use Promise.all instead of forEach
        const versionPromises = bedrockAliases.map(async (alias: AgentAliasBebrock) => {
          console.log("existingVersionsMap:", JSON.stringify(existingVersionsMap, null, 2));
          console.log("Processing alias id:", alias.id);
          const existingVersion = existingVersionsMap.get(alias.id);
          
          if (existingVersion) {
            // Update existing version
            console.log("🔄 Updating version:", alias.id);
            const updatedVersion = await amplifyClient.models.AgentVersion.update({
              ai_agent_id: aiAgentId,
              version_value: alias.id,
              name: alias.name || existingVersion.name,
              enable: alias.enable || existingVersion.enable,
              description: existingVersion.description,
              status: alias.status || existingVersion.status,
              update_at: alias.updatedAt || new Date().toISOString(),
            });
            console.log("Updated version if exist: ", JSON.stringify(updatedVersion, null, 2));
            return updatedVersion;
          } else {
            // Create new version
            console.log("➕ Creating new version:", alias.id);
            const newVersion = await amplifyClient.models.AgentVersion.create({
              ai_agent_id: aiAgentId,
              version_value: alias.id,
              name: alias.name || "",
              enable: alias.enable || 1, 
              description: alias.description || "",
              status: alias.status || AgentAliasStatus.CREATING,
              created_at: alias.createdAt || new Date().toISOString(),
              update_at: alias.updatedAt || new Date().toISOString(),
            });
            console.log("Created new version if not exists in bedrock alias: ", JSON.stringify(newVersion, null, 2));
            return newVersion;
          }
        });

        const versionResults = await Promise.all(versionPromises);
        resultData.push(...versionResults);
      }

      console.log("✅ [syncDataFromBebrock] Agent updated successfully:", {
        success: !!agentResult.data,
        errors: agentResult.errors || "None",
      });
    } else {
      // 4b. Tạo Agent mới
      console.log(
        "➕ [syncDataFromBebrock] Creating new Agent in database...",
        {
          agentId: aiAgentId,
          agentName: bedrockAgent.agentName,
        }
      );
      console.log("Ai agent not found create one ");
      agentResult = await s.models.AiAgents.create({
        id: aiAgentId,
        name: bedrockAgent.agentName || "",
        status: bedrockAgent.agentStatus || "",
        description: bedrockAgent.description || "",
        last_version: bedrockAgent.agentVersion || "",
        // knowledgeBaseUrl: "",
        like_count: 0,
        total_interactions: 0,
        creator_id: "1",
        introduction: "",
        icon: "public-images/ai.png",
        foreword: "",
        sys_prompt: bedrockAgent.instruction || "",
        model: bedrockAgent.foundationModel || "",
        // capabilities: [],
        cost: 0,
        // suggestQuestions: [
        //   "Bạn có thể giúp tôi những gì?",
        //   "Hãy giới thiệu về khả năng của bạn",
        //   "Bạn được huấn luyện để làm gì?"
        // ],
        is_public: 0,
        type: "ADMIN",
      });
      console.log("Agent created result: ", JSON.stringify(agentResult, null, 2));

      const versionPromises = bedrockAliases.map(async (alias: AgentAliasBebrock) => {
        const createAgentVersion = await amplifyClient.models.AgentVersion.create({
          ai_agent_id: aiAgentId,
          version_value: alias.id,
          name: alias.name || "",
          enable: alias.enable || 1,
          description: alias.description || "",
          status: alias.status || AgentAliasStatus.CREATING,
          created_at: alias.createdAt || new Date().toISOString().replace(/\.\d{3}Z$/, ""),
          update_at: alias.updatedAt || new Date().toISOString().replace(/\.\d{3}Z$/, ""),
        });
        console.log("Created new Agent Version: ", JSON.stringify(createAgentVersion, null, 2));
        return createAgentVersion;
      });
      const versionResults = await Promise.all(versionPromises);
      resultData.push(...versionResults);
    }

    console.log("✅ [syncDataFromBebrock] New Agent created successfully:", {
      success: !!agentResult.data,
      errors: agentResult.errors || "None",
    });

    // 5. Đồng bộ Agent Versions/Aliases
    console.log("🔗 [syncDataFromBebrock] Syncing Agent Versions...");

    // 5. Return result
    const syncResult = {
      success: true,
      message: existingAgent.data ? "Agent updated successfully" : "New Agent created successfully",
      data: {
        agent: {
          id: aiAgentId,
          name: bedrockAgent.agentName,
          status: bedrockAgent.agentStatus,
          isNew: !existingAgent.data
        },
        agentResult: agentResult,
        versions: resultData,
        statistics: {
          totalVersions: bedrockAliases.length,
          versionsProcessed: resultData.length,
          versionsSuccess: resultData.filter(r => r.data).length,
          versionsErrors: resultData.filter(r => r.errors).length
        }
      },
      error: null,
      errorCode: null,
    };

    // console.log("🎉 [syncDataFromBebrock] Sync completed successfully:", syncResult.statistics);
    return syncResult;
  } catch (error: any) {
    console.error("💥 [syncDataFromBebrock] Sync failed:", {
      aiAgentId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: `Sync failed: ${error.message}`,
      errorCode: "SYNC_ERROR",
      data: null,
    };
  }
}

export async function listAgentAliasFormBebrock(
  bedrockClient: BedrockAgentClient,
  aiAgentId: string
) {
  // Variable
  const agentAliasBebrock: AgentAliasBebrock[] = [];
  let nextToken = undefined;
  let maxResults = 10;

  // 2. Get all agent aliases from aiAgentId Bedrock
  do {
    const agentAlias: ListAgentAliasesCommandOutput = await bedrockClient.send(
      new ListAgentAliasesCommand({
        maxResults,
        nextToken,
        agentId: aiAgentId,
      })
    );
    if (agentAlias.agentAliasSummaries)
      agentAliasBebrock.push(
        ...agentAlias.agentAliasSummaries.map(
          (alias: AgentAliasSummary): AgentAliasBebrock => ({
            id: alias.agentAliasId || "",
            name: alias.agentAliasName || "",
            enable: 1,
            description: alias.description || "",
            status: alias.agentAliasStatus || AgentAliasStatus.CREATING,
            createdAt: alias.createdAt
              ? alias.createdAt.toISOString()
              : new Date().toISOString(),
            updatedAt: alias.updatedAt
              ? alias.updatedAt.toISOString()
              : new Date().toISOString(),
          })
        )
      );

    nextToken = agentAlias.nextToken;
  } while (nextToken != undefined);

  console.log("Bedrock response: agentAliasBebrock", agentAliasBebrock);
  return agentAliasBebrock;
}

export async function getAllAgentsAndConvertAiAgent(
  bedrockClient: BedrockAgentClient
): Promise<AiAgent[]> {
  const maxResults = 10;
  let nextToken = undefined;
  // 1. Get all agents from Bedrock
  const agentsBebrock: AgentSummary[] = [];
  do {
    const bedrockResponse: ListAgentsCommandOutput = await bedrockClient.send(
      new ListAgentsCommand({
        maxResults,
        nextToken,
      })
    );
    agentsBebrock.push(...(bedrockResponse.agentSummaries || []));
    nextToken = bedrockResponse.nextToken;
  } while (nextToken != null);
  console.log("Bedrock response: agentsBebrock", agentsBebrock);

  // 3. Proccess data for agents not saved yet
  const agentPromises = agentsBebrock.map(async (agent) => {
    const aiAgentAlias: AgentVersion[] = [];
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
      if (aiAgentAliasResponse.agentAliasSummaries)
        aiAgentAlias.push(
          ...(aiAgentAliasResponse.agentAliasSummaries.map(
            (alias): AgentVersion => ({
              agentId: agentId ?? "",
              versionValue: alias.agentAliasId || "",
              description: alias.description || "",
              createdAt: alias.createdAt
                ? alias.createdAt.toISOString()
                : new Date().toISOString(),
              updateAt: alias.updatedAt
                ? alias.updatedAt.toISOString()
                : new Date().toISOString(),
            })
          ) ?? [])
        );
      else {
        console.warn(`No agentAliasSummaries found for agentId: ${agentId}`);
      }
      nextTokenAlias = aiAgentAliasResponse.nextToken;
    } while (nextTokenAlias != undefined);

    const aiAgent: AiAgent = {
      id: agentId || "",
      agentVersions: aiAgentAlias,
      name: agent.agentName || "",
      status: agent.agentStatus || "",
      description: agent.description || "",
      lastVersion: agent.latestAgentVersion || "",
      knowledgeBaseUrl: "",
      likeCount: 0,
      totalInteractions: 0,
      creatorId: 1,
      introduction:
        'Xin chào! Tôi là Agent sách "Heal Your Money Energy" của Ankur và Bell. Tôi có thể hỗ trợ bạn đọc cuốn sách này hiểu và chuyển đổi mối quan hệ của bạn với tiền bạc',
      icon: "public-images/ai.png",
      foreword: "",
      sysPrompt: "",
      model: "",
      capabilities: [],
      cost: 0,
      suggestQuestions: [
        "Cuốn sách này nói gì về mối quan hệ với tiền bạc?",
        "Làm sao để chữa lành năng lượng tiền bạc?",
        "Tác giả đưa ra phương pháp nào cụ thể?",
      ],
    };
    return aiAgent;
  });
  const newAgents = await Promise.all(agentPromises);

  const aiAgents: AiAgent[] = [];
  aiAgents.push(...newAgents);

  return aiAgents;
}
