import {
  BedrockAgentClient,
  ListAgentsCommand,
  ListAgentsCommandOutput,
  AgentSummary,
  ListAgentAliasesCommand,
  ListAgentAliasesResponse,
} from "@aws-sdk/client-bedrock-agent";
import { AiAgent, AliasIds } from "../interfaces/aiAgent";
import {
  BatchExecuteStatementCommand,
  BeginTransactionCommand,
  CommitTransactionCommand,
  ExecuteStatementCommand,
  RDSDataClient,
} from "@aws-sdk/client-rds-data";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { match } from "assert";

export async function invokeAgentCommand(
  bedrockAgentRuntimeClient: BedrockAgentRuntimeClient,
  command: InvokeAgentCommand,
  sessionId: string
) {
  const response = await bedrockAgentRuntimeClient.send(command);

  let completion = "";
  const traces: Record<string, string> = {};

  if (response.completion) {
    for await (const event of response.completion) {
      const chunk = event.chunk || {};

      if (chunk.bytes) {
        completion += new TextDecoder().decode(chunk.bytes);
      }

      const t = event.trace || {};
      if (t.trace) {
        traces[t.agentId || ""] = t.agentAliasId || "";
      }
    }
  }

  console.log("Completion: ", completion);
  console.log("Traces:", traces);

  // Trả về kết quả
  return {
    response: completion,
    sessionId: sessionId,
    trace: traces,
  };
}

export async function getAllAgentsAndConvertAiAgent(
  bedrockClient: BedrockAgentClient,
  rdsClient: RDSDataClient,
  secretArn: string,
  rdsArn: string,
  rdsDatabase: string
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

  // 2. Filter the agents not added yet
  const idsAgentSavedResult = rdsClient.send(
    new ExecuteStatementCommand({
      resourceArn: rdsArn,
      secretArn: secretArn,
      database: rdsDatabase,
      sql: `SELECT id FROM ai_agents WHERE id IN (${agentsBebrock.map((agent) => `'${agent.agentId}'`).join(", ")})`,
    })
  );
  console.log("IDs of agents already saved:", await idsAgentSavedResult);

  const idsAgentSaved = ((await idsAgentSavedResult).records || [])
    .map((record) => record[0].stringValue)
    .filter(
      (id) =>
        id != undefined && agentsBebrock.some((agent) => agent.agentId === id)
    )
    .filter((id): id is string => typeof id === "string");
  console.log("IDs of agents saved:", idsAgentSaved);

  const agentsNotSaved = agentsBebrock.filter((agent) =>
    idsAgentSaved.some((id) => {
      const result = id != agent.agentId;
      console.log(
        `Checking agent: ${agent.agentId}, Against saved ID: ${id}, Result: ${result}`
      );
      return result;
    })
  );
  console.log("Agents not saved yet:", agentsNotSaved);

  // 3. Proccess data for agents not saved yet
  const aiAgents: AiAgent[] = [];
  const agentSummaries =
    agentsNotSaved.length > 0 ? agentsNotSaved : agentsBebrock;
  console.log("Agent summaries to process:", agentSummaries);
  const agentPromises = agentSummaries.map(async (agent) => {
    const aiAgentAlias: AliasIds[] = [];
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
              (alias) : AliasIds => ({
                agentAliasId: alias.agentAliasId || "",
                updateAt: alias.updatedAt ? alias.updatedAt.toISOString().replace(/\.\d{3}Z$/, "") : new Date().toISOString().replace(/\.\d{3}Z$/, "")
              })
            ) ?? [])
          );
        else{
          console.warn(`No agentAliasSummaries found for agentId: ${agentId}`);
        }
      nextTokenAlias = aiAgentAliasResponse.nextToken;
    } while (nextTokenAlias != undefined);

    // Chuyển đổi alias thành mảng string
    console.log("AI Agent Alias:", aiAgentAlias);
    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    const randomDays = Math.floor(Math.random() * 20);
    const randomDate = new Date(now.getTime() - randomDays * msInDay);

    const aiAgent: AiAgent = {
      id: agentId || "",
      aliasIds: aiAgentAlias,
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
      createAt: randomDate,
      model: "",
      capabilities: [],
      cost: 0,
      suggestQuestions: [
        "Cuốn sách này nói gì về mối quan hệ với tiền bạc?",
        "Làm sao để chữa lành năng lượng tiền bạc?",
        "Tác giả đưa ra phương pháp nào cụ thể?",
      ]
    };
    console.log("AI Agent:", aiAgent);
    return aiAgent;
  });
  const newAgents = await Promise.all(agentPromises);
  aiAgents.push(...newAgents);

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

  // Note: Chưa xử lý chuyển về model

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
    const secret = await secretManagerClient.send(
      new GetSecretValueCommand({ SecretId: "prod/RDS_SECRET_ARN" })
    );
    console.log("Secret", secret);

    const aiAgents: AiAgent[] = await getAllAgentsAndConvertAiAgent(
      bedrockClient,
      rdsClient,
      secret.ARN ?? "",
      rdsArn,
      rdsDatabase
    );
    console.log("AI Agents:", aiAgents);
    // Begin transaction to insert agents into RDS
    const beginTransactionCommand = new BeginTransactionCommand({
      resourceArn: rdsArn,
      secretArn: secret.ARN,
      database: rdsDatabase,
    });
    const beginResult = await rdsClient.send(beginTransactionCommand);
    const transactionId = beginResult.transactionId;

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
      {
        name: "creatorId",
        value: { stringValue: String(agent.creatorId || 1) },
      },
      {
        name: "introduction",
        value: { stringValue: agent.introduction || "" },
      },
      { name: "icon", value: { stringValue: agent.icon || "" } },
      { name: "foreword", value: { stringValue: agent.foreword || "" } },
      { name: "sysPrompt", value: { stringValue: agent.sysPrompt || "" } },
      {
        name: "createAt",
        value: {
          stringValue: agent.createAt.toISOString().replace(/\.\d{3}Z$/, ""),
        },
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
      {
        name: "suggestQuestions",
        value: { stringValue: JSON.stringify(agent.suggestQuestions) },
      },
    ]);

    const command = new BatchExecuteStatementCommand({
      resourceArn: rdsArn,
      secretArn: secret.ARN,
      database: rdsDatabase,
      transactionId: transactionId,
      sql: `
              INSERT INTO ai_agents (
                  id, name, status, description, last_version, knowledge_base_url,
                  like_count, total_interactions, creator_id, introduction, icon,
                  foreword, sys_prompt, create_at, model, capabilities, cost, alias_ids, suggested_questions
              )
              VALUES (
                  :id, :name, :status, :description, :lastVersion, :knowledgeBaseUrl,
                  :likeCount, :totalInteractions, :creatorId, :introduction, :icon,
                  :foreword, :sysPrompt, :createAt, :model, :capabilities, :cost, :aliasIds, :suggestQuestions
              )
          `,
      parameterSets,
    });

    const result = await rdsClient.send(command);
    console.log("RDS send command successful");

    // Random categories for ai agents

    const randomCategoriesForAgent = (agentId: string, quantity: number) => {
      const categoryIds: number[] = [];
      for (let i = 0; i < quantity; i++) {
        const randomCategoryId = Math.ceil(Math.random() * 10);
        if (!categoryIds.includes(randomCategoryId)) {
          categoryIds.push(randomCategoryId);
        }
      }
      return categoryIds.map((categoryId) => ({ agentId, categoryId }));
    };

    const categoriesForAgent = aiAgents
      .map((agent) => {
        const random = Math.ceil(Math.random() * 3);
        return randomCategoriesForAgent(agent.id, random);
      })
      .flatMap((item) =>
        item.map((object) => ({
          agentId: object.agentId,
          categoryId: object.categoryId,
        }))
      );
      console.log("Categories for agents:", categoriesForAgent);

    const resultInsertCategoriesForAgent = await rdsClient.send(
      new BatchExecuteStatementCommand({
        resourceArn: rdsArn,
        secretArn: secret.ARN,
        database: rdsDatabase,
        transactionId: transactionId,
        sql: `
          INSERT INTO ai_categories (ai_agent_id, agent_category_id)
          VALUES (:agentId, :categoryId)
        `,
        parameterSets: categoriesForAgent.map((item) => [
          { name: "agentId", value: { stringValue: item.agentId } },
          { name: "categoryId", value: { longValue: item.categoryId } }, 
        ]),
      })
    );
    console.log("ResultInsertCategoriesForAgent send command successful");

    // Commit transaction
    const commitCommand = new CommitTransactionCommand({
      resourceArn: rdsArn,
      secretArn: secret.ARN,
      transactionId,
    });
    const commitResult = await rdsClient.send(commitCommand);
    console.log("Transaction committed successfully:", commitResult);

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
