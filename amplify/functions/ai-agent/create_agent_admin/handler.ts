import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  BedrockAgentClient,
  CreateAgentCommand,
  PrepareAgentCommand,
  CreateAgentAliasCommand,
  CreateKnowledgeBaseRequest,
  CreateKnowledgeBaseCommand,
  AssociateAgentKnowledgeBaseCommand,
  GetAgentCommand,
  GetKnowledgeBaseCommand,
  GetAgentAliasCommand,
  CreateDataSourceCommand,
  StartIngestionJobCommand,
} from "@aws-sdk/client-bedrock-agent";
import { randomUUID } from "node:crypto";
import { getBedrockClient } from "../../../utils/clients";
import {
  createSuccessResponse,
  waitForAgentStatus,
  waitForAliasStatus,
  waitForDataSourceStatus,
  waitForIngestionJobStatus,
  waitForKnowledgeBaseStatus,
} from "../../../helper/waitBebrock";
import { Schema } from "../../../data/resource";
import { generateClient } from "aws-amplify/data";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/createAgentExpertFnc";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) =>
    console.error(`[ERROR] ${msg}`, ...args),
};

export const handler = awslambda.streamifyResponse(
  async (event, responseStream) => {
    console.log("Full event:", JSON.stringify(event));

    responseStream = awslambda.HttpResponseStream.from(responseStream, {
      statusCode: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Transfer-Encoding": "chunked",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      },
    });

    // Client
    const bedrockClient = getBedrockClient();
    const amplifyClient = await getAmplifyClient(env);
    const s = generateClient<Schema>();

    try {
      // Parse event body
      let body: any;
      if (event.body) {
        body =
          typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      } else {
        body = event;
      }

      logger.info("Received event:", JSON.stringify(body));

      // Initialize Bedrock Agent client
      const bedrockAgentClient = new BedrockAgentClient({
        region: process.env.AWS_REGION || "us-east-1",
      });

      // Extract parameters
      const {
        name,
        instruction,
        introduction,
        description,
        foreword,
        creatorId,
        knowledgeBaseUrl,
        model = "arn:aws:bedrock:us-east-1:842676020404:inference-profile/us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        capabilities,
        cost,
        type,
        suggestedQuestions,
        categoryIds,
        icon,
        s3Arn,
        aliasName,
        aliasDescription,
      } = body;

      // Validate required parameters
      const requiredParams = {
        name,
        instruction,
        description,
        foreword,
        creatorId,
        knowledgeBaseUrl,
        introduction,
        model,
        capabilities,
        categoryIds,
        cost,
        type,
      };
      const missingParams = Object.entries(requiredParams)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingParams.length > 0) {
        responseStream.write(
          `data: {"status": "error", "message": "Missing required parameters: ${missingParams.join(", ")}"}`
        );
        responseStream.write(`data: [DONE]`);
        responseStream.end();
        return;
      }

      responseStream.write(
        `data: {"step": 0, "status": "started", "message": "🚀 Starting Agent Creation Process..."}`
      ); // 1. Create knowledgeBase
      logger.info("🔄 Step 1: Creating Knowledge Base...");
      responseStream.write(
        `data: {"step": 1, "status": "progress", "message": "🔄 Creating Knowledge Base..."}`
      );

      const nameKnowledgeBase = `knowledge-base-${randomUUID().toString()}`;
      const createKnowledgeBaseRequest: CreateKnowledgeBaseRequest = {
        name: nameKnowledgeBase,
        roleArn: "arn:aws:iam::842676020404:role/BedrockAIAgentRole", // Revert back to existing role
        knowledgeBaseConfiguration: {
          type: "VECTOR",
          vectorKnowledgeBaseConfiguration: {
            embeddingModelArn:
              "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0",
          },
        },
        storageConfiguration: {
          type: "PINECONE",
          pineconeConfiguration: {
            connectionString:
              "https://phuc-create-agent-iag21ns.svc.aped-4627-b74a.pinecone.io",
            credentialsSecretArn:
              "arn:aws:secretsmanager:us-east-1:842676020404:secret:prod/bedrock/pinecone-phuc-tqruE8",
            namespace: nameKnowledgeBase,
            fieldMapping: {
              textField: "text",
              metadataField: "metadata",
            },
          },
        },
      };
      const createKnowledgeBaseResponse = await bedrockClient.send(
        new CreateKnowledgeBaseCommand(createKnowledgeBaseRequest)
      );

      const knowledgeBaseId =
        createKnowledgeBaseResponse.knowledgeBase?.knowledgeBaseId;
      if (!knowledgeBaseId) {
        throw new Error("Failed to create knowledge base - no ID returned");
      }
      logger.info(`✅ Knowledge base created: ${knowledgeBaseId}`);
      responseStream.write(
        `data: {"step": 1, "status": "completed", "message": "✅ Knowledge base created", "data": {"knowledgeBaseId": "${knowledgeBaseId}"}}`
      );

      // Step 2: Wait for Knowledge Base to be ready
      logger.info("⏳ Step 2: Waiting for Knowledge Base to be ready...");
      responseStream.write(
        `data: {"step": 2, "status": "progress", "message": "⏳ Waiting for Knowledge Base to be ready..."}`
      );
      await waitForKnowledgeBaseStatus(bedrockAgentClient, knowledgeBaseId, [
        "ACTIVE",
      ]);
      responseStream.write(
        `data: {"step": 2, "status": "completed", "message": "✅ Knowledge Base is ready"}`
      );

      // Create data sources for knowledebase
      responseStream.write(
        `data: {"step": 3, "status": "progress", "message": "🔄 Creating Data Source..."}`
      );
      const createDataSourceResponse = await bedrockClient.send(
        new CreateDataSourceCommand({
          knowledgeBaseId: knowledgeBaseId,
          name: `data-source-${randomUUID().toString()}`,
          dataSourceConfiguration: {
            type: "S3",
            s3Configuration: {
              bucketArn: `arn:aws:s3:::${s3Arn}`,
              inclusionPrefixes: [knowledgeBaseUrl],
            },
          },
        })
      );

      const dataSourceId = createDataSourceResponse.dataSource?.dataSourceId;
      if (!dataSourceId) {
        throw new Error("Failed to create data source - no ID returned");
      }
      logger.info(`✅ Data source created: ${dataSourceId}`);
      responseStream.write(
        `data: {"step": 3, "status": "completed", "message": "✅ Data source created", "data": {"dataSourceId": "${dataSourceId}"}}`
      );

      // ✅ Wait for Data Source to be ready
      logger.info("⏳ Waiting for Data Source to be ready...");
      responseStream.write(
        `data: {"step": 4, "status": "progress", "message": "⏳ Waiting for Data Source to be ready..."}`
      );
      await waitForDataSourceStatus(
        bedrockAgentClient,
        knowledgeBaseId,
        dataSourceId,
        ["AVAILABLE"]
      );
      responseStream.write(
        `data: {"step": 4, "status": "completed", "message": "✅ Data Source is ready"}`
      );

      // ✅ START INGESTION JOB - This is what was missing!
      logger.info("🔄 Starting data ingestion job...");
      responseStream.write(
        `data: {"step": 5, "status": "progress", "message": "🔄 Starting data ingestion job..."}`
      );
      const startIngestionJobResponse = await bedrockClient.send(
        new StartIngestionJobCommand({
          knowledgeBaseId: knowledgeBaseId,
          dataSourceId: dataSourceId,
          description: "Initial data ingestion for knowledge base",
        })
      );

      const ingestionJobId =
        startIngestionJobResponse.ingestionJob?.ingestionJobId;
      if (!ingestionJobId) {
        throw new Error("Failed to start ingestion job - no ID returned");
      }
      logger.info(`✅ Ingestion job started: ${ingestionJobId}`);
      responseStream.write(
        `data: {"step": 5, "status": "completed", "message": "✅ Ingestion job started", "data": {"ingestionJobId": "${ingestionJobId}"}}`
      );

      // ✅ Wait for ingestion to complete
      logger.info("⏳ Waiting for data ingestion to complete...");
      responseStream.write(
        `data: {"step": 6, "status": "progress", "message": "⏳ Waiting for data ingestion to complete..."}`
      );
      await waitForIngestionJobStatus(
        bedrockAgentClient,
        knowledgeBaseId,
        dataSourceId,
        ingestionJobId,
        ["COMPLETE"]
      );

      logger.info("✅ Data ingestion completed successfully!");
      responseStream.write(
        `data: {"step": 6, "status": "completed", "message": "✅ Data ingestion completed successfully!"}`
      );

      // 2. Create Agent
      logger.info("🔄 Step 7: Creating Bedrock Agent...");
      responseStream.write(
        `data: {"step": 7, "status": "progress", "message": "🔄 Creating Bedrock Agent..."}`
      );

      // Transform name to AWS Bedrock compatible format
      const bedrockCompatibleName =
        name
          .replace(/[^a-zA-Z0-9\-_\s]/g, "") // Remove invalid characters
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/[-_]+/g, "-") // Replace multiple hyphens/underscores with single hyphen
          .replace(/^[-_]+|[-_]+$/g, "") // Remove leading/trailing hyphens
          .toLowerCase()
          .substring(0, 100) // Truncate to 100 characters
          .replace(/[-_]+$/, "") || // Remove trailing hyphens after truncation
        `ai-agent-${Date.now()}`; // Fallback if empty

      // Validate transformed name
      if (!/^[a-zA-Z0-9][a-zA-Z0-9\-_]*$/.test(bedrockCompatibleName)) {
        throw new Error(
          `Transformed name "${bedrockCompatibleName}" is still invalid for AWS Bedrock`
        );
      }

      // Validate description length
      if (description && description.length > 200) {
        throw new Error(
          `Description is too long: ${description.length} characters. Maximum allowed is 200 characters.`
        );
      }
      const createAgentResponse = await bedrockAgentClient.send(
        new CreateAgentCommand({
          agentName: bedrockCompatibleName,
          foundationModel: model,
          instruction,
          description,
          idleSessionTTLInSeconds: 1800,
          agentResourceRoleArn:
            "arn:aws:iam::842676020404:role/BedrockAIAgentRole", // Revert back to existing role
        })
      );

      const agentId = createAgentResponse.agent?.agentId;
      if (!agentId) {
        throw new Error("Failed to create agent - no ID returned");
      }
      logger.info(`✅ Step 7 Complete: Agent created: ${agentId}`);
      responseStream.write(
        `data: {"step": 7, "status": "completed", "message": "✅ Agent created", "data": {"agentId": "${agentId}", "agentName": "${bedrockCompatibleName}"}}`
      );

      // Step 8: Wait for Agent to be ready
      logger.info("⏳ Step 8: Waiting for Agent to be ready...");
      responseStream.write(
        `data: {"step": 8, "status": "progress", "message": "⏳ Waiting for Agent to be ready..."}`
      );
      await waitForAgentStatus(bedrockAgentClient, agentId, ["NOT_PREPARED"]);
      logger.info("✅ Step 8 Complete: Agent is ready for configuration");
      responseStream.write(
        `data: {"step": 8, "status": "completed", "message": "✅ Agent is ready for configuration"}`
      );

      // Step 9: Associate Knowledge Base with Agent
      logger.info("🔗 Step 9: Associating Knowledge Base with Agent...");
      responseStream.write(
        `data: {"step": 9, "status": "progress", "message": "🔗 Associating Knowledge Base with Agent..."}`
      );
      const associateAgentKnowledgeBaseResponse = await bedrockAgentClient.send(
        new AssociateAgentKnowledgeBaseCommand({
          agentId: agentId,
          agentVersion: "DRAFT",
          knowledgeBaseId: knowledgeBaseId,
          description: "Description for knowledge base association",
        })
      );
      logger.info("✅ Step 9 Complete: Knowledge base associated successfully");
      responseStream.write(
        `data: {"step": 9, "status": "completed", "message": "✅ Knowledge base associated successfully"}`
      );

      // Step 10: Prepare Agent after association
      logger.info(
        "⏳ Step 10: Preparing Agent after Knowledge Base association..."
      );
      responseStream.write(
        `data: {"step": 10, "status": "progress", "message": "⏳ Preparing Agent after Knowledge Base association..."}`
      );
      const prepareAgentResponse = await bedrockAgentClient.send(
        new PrepareAgentCommand({ agentId })
      );
      logger.info("⏳ Step 11: Waiting for Agent preparation to complete...");
      responseStream.write(
        `data: {"step": 11, "status": "progress", "message": "⏳ Waiting for Agent preparation to complete..."}`
      );
      await waitForAgentStatus(bedrockAgentClient, agentId, ["PREPARED"]);
      responseStream.write(
        `data: {"step": 11, "status": "completed", "message": "✅ Agent preparation completed"}`
      ); // Step 12: Get the prepared agent version
      logger.info("📋 Step 12: Getting prepared agent version...");
      responseStream.write(
        `data: {"step": 12, "status": "progress", "message": "📋 Getting prepared agent version..."}`
      );
      const preparedAgentInfo = await bedrockAgentClient.send(
        new GetAgentCommand({ agentId })
      );

      // Step 13: Create Agent Alias with proper routing configuration
      logger.info("📝 Step 13: Creating Agent Alias...");
      responseStream.write(
        `data: {"step": 13, "status": "progress", "message": "📝 Creating Agent Alias..."}`
      );

      const preparedAgentVersion = preparedAgentInfo.agent?.agentVersion;
      logger.info(
        `✅ Step 12 Complete: Agent prepared with version: ${preparedAgentVersion}`
      );

      const createAliasResponse = await bedrockAgentClient.send(
        new CreateAgentAliasCommand({
          agentAliasName: aliasName,
          agentId,
          description: aliasDescription,
        })
      );

      const aliasId = createAliasResponse.agentAlias?.agentAliasId;
      if (!aliasId) {
        throw new Error("Failed to create agent alias - no ID returned");
      }
      logger.info(`✅ Step 13 Complete: Agent alias created: ${aliasId}`);
      responseStream.write(
        `data: {"step": 13, "status": "completed", "message": "✅ Agent alias created", "data": {"aliasId": "${aliasId}"}}`
      );

      // Step 14: Wait for Alias to be ready
      logger.info("⏳ Step 14: Waiting for Alias to be ready...");
      responseStream.write(
        `data: {"step": 14, "status": "progress", "message": "⏳ Waiting for Alias to be ready..."}`
      );
      await waitForAliasStatus(bedrockAgentClient, agentId, aliasId, [
        "PREPARED",
      ]);
      logger.info("✅ Step 14 Complete: Agent alias is ready");
      responseStream.write(
        `data: {"step": 14, "status": "completed", "message": "✅ Agent alias is ready"}`
      );

      // Step 15: Create Agent on rds
      logger.info("🔄 Step 15: Creating Agent in RDS...");
      responseStream.write(
        `data: {"step": 15, "status": "progress", "message": "🔄 Creating Agent in RDS..."}`
      );
      const agentResult = await amplifyClient.models.AiAgents.create({
        id: createAgentResponse.agent?.agentId,
        name: name || "",
        introduction: introduction || "",
        description: createAgentResponse.agent?.description || "",
        foreword: foreword || "",
        last_version: createAgentResponse.agent?.agentVersion || "1",
        status: createAgentResponse.agent?.agentStatus || "", 
        cost: cost || 0,
        total_interactions: 0,
        like_count: 0,
        creator_id: creatorId || "1",
        sys_prompt: instruction || "",
        knowledge_base_url: knowledgeBaseUrl || "",
        suggested_questions: JSON.stringify(suggestedQuestions || []),
        is_public: 0,
        type: type || "EXPERT",
        model: createAgentResponse.agent?.foundationModel || "",
        icon: icon || "public-images/ai.png",
        capabilities: JSON.stringify(capabilities || []),
      });
      console.log(
        "Agent created in RDS:",
        JSON.stringify(agentResult, null, 2)
      );
      responseStream.write(
        `data: {"step": 15, "status": "completed", "message": "✅ Agent created in RDS", "data": {"agentId": "${agentId}"}}`
      );

      responseStream.write(
        `data: {"step": 16, "status": "progress", "message": "🔄 Creating Agent Version..."}`
      );
      const agentVersion = await amplifyClient.models.AgentVersion.create({
        ai_agent_id: agentId,
        version_value: createAliasResponse.agentAlias?.agentAliasId || "",
        name: createAliasResponse.agentAlias?.agentAliasName || "",
        description: createAliasResponse.agentAlias?.description || "",
        status: createAliasResponse.agentAlias?.agentAliasStatus || "FAILED",
        created_at: new Date().toISOString(),
        update_at: new Date().toISOString(),
        enable: 0,
      });
      console.log(
        "Agent version created in RDS:",
        JSON.stringify(agentVersion, null, 2)
      );
      responseStream.write(
        `data: {"step": 16, "status": "completed", "message": "✅ Agent Version created"}`
      );

      responseStream.write(
        `data: {"step": 17, "status": "progress", "message": "🔄 Associating Categories..."}`
      );
      for (const categoryId of categoryIds) {
        const existingCategory = await amplifyClient.models.AgentCategories.get(
          {
            id: categoryId,
          }
        );

        if (!existingCategory) {
          throw new Error(`Category with ID ${categoryId} does not exist`);
        }

        const result = await amplifyClient.models.AiCategories.create({
          ai_agent_id: agentId,
          agent_category_id: categoryId,
        });
        console.log(
          "Category associated with agent in RDS:",
          JSON.stringify(result, null, 2)
        );
      }
      responseStream.write(
        `data: {"step": 17, "status": "completed", "message": "✅ Categories associated successfully"}`
      );

      // Step 16: Get final information
      logger.info("📋 Step 18: Getting final information for response...");
      responseStream.write(
        `data: {"step": 18, "status": "progress", "message": "📋 Getting final information..."}`
      );
      const [finalAgentInfo, finalAliasInfo, finalKnowledgeBaseInfo] =
        await Promise.all([
          bedrockAgentClient.send(new GetAgentCommand({ agentId })),
          bedrockAgentClient.send(
            new GetAgentAliasCommand({ agentId, agentAliasId: aliasId })
          ),
          bedrockAgentClient.send(
            new GetKnowledgeBaseCommand({ knowledgeBaseId })
          ),
        ]);

      // Return comprehensive response
      responseStream.write(
        `data: {"step": 18, "status": "completed", "message": "✅ Final information collected"}`
      );

      const responseData = {
        message: "🎉 Agent, knowledge base, and alias created successfully!",
        knowledgeBase: {
          knowledgeBaseId,
          name: nameKnowledgeBase,
          status: finalKnowledgeBaseInfo.knowledgeBase?.status,
          createdAt:
            finalKnowledgeBaseInfo.knowledgeBase?.createdAt?.toISOString(),
        },
        agent: {
          agentId,
          agentArn: finalAgentInfo.agent?.agentArn,
          agentName: name,
          agentStatus: finalAgentInfo.agent?.agentStatus,
          description,
          foundationModel: model,
          instruction,
          createdAt: finalAgentInfo.agent?.createdAt?.toISOString(),
          updatedAt: finalAgentInfo.agent?.updatedAt?.toISOString(),
        },
        alias: {
          agentAliasId: aliasId,
          agentAliasArn: finalAliasInfo.agentAlias?.agentAliasArn,
          agentAliasName: aliasName,
          description: aliasDescription,
          agentAliasStatus: finalAliasInfo.agentAlias?.agentAliasStatus,
          createdAt: finalAliasInfo.agentAlias?.createdAt?.toISOString(),
          updatedAt: finalAliasInfo.agentAlias?.updatedAt?.toISOString(),
        },
        association: {
          agentId,
          knowledgeBaseId,
          associationId:
            associateAgentKnowledgeBaseResponse.agentKnowledgeBase
              ?.knowledgeBaseId,
        },
      };

      logger.info(
        "🎊 All steps completed successfully! Agent creation process finished."
      );
      responseStream.write(
        `data: {"step": 19, "status": "completed", "message": "🎊 Agent creation completed successfully!", "data": ${JSON.stringify(responseData)}}`
      );
      responseStream.write(`data: [DONE]`);
      responseStream.end();
    } catch (error: any) {
      logger.error(`❌ Error occurred during agent creation process:`, error);
      responseStream.write(
        `data: {"status": "error", "message": "❌ Error: ${error.message || error.toString()}"}`
      );
      responseStream.write(`data: [DONE]`);
      responseStream.end();
    }
  }
);
