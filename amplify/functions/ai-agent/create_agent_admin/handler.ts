import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  BedrockAgentClient,
  CreateAgentCommand,
  CreateAgentAliasCommand,
  PrepareAgentCommand,
  GetAgentCommand,
  GetAgentAliasCommand,
} from "@aws-sdk/client-bedrock-agent";
import {
  IAMClient,
  CreateRoleCommand,
  AttachRolePolicyCommand,
  GetRoleCommand,
} from "@aws-sdk/client-iam";

// Configure logging
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
};

interface CreateAgentRequest {
  agentName: string;
  agentResourceRoleArn: string;
  foundationModel: string;
  instruction: string;
  description?: string;
  aliasName?: string;
  aliasDescription?: string;
}

interface AgentResponse {
  success: boolean;
  message: string;
  agent: {
    agentId: string;
    agentArn: string;
    agentName: string;
    agentStatus: string;
    description: string;
    foundationModel: string;
    instruction: string;
    agentResourceRoleArn: string;
    createdAt: string;
    updatedAt: string;
    agentVersion: string;
    idleSessionTTLInSeconds?: number;
  };
  alias: {
    agentAliasId: string;
    agentAliasArn: string;
    agentAliasName: string;
    description: string;
    agentAliasStatus: string;
    createdAt: string;
    updatedAt: string;
    routingConfiguration: any[];
  };
  usage_instructions: {
    invoke_agent: {
      service: string;
      operation: string;
      parameters: {
        agentId: string;
        agentAliasId: string;
        sessionId: string;
        inputText: string;
      };
    };
    sample_code: string;
  };
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // ✅ Initialize AWS clients
    const bedrockAgentClient = new BedrockAgentClient({ region: process.env.AWS_REGION || "us-east-1" });
    
    // ✅ Parse request body
    let requestData: CreateAgentRequest;
    
    if (event.body) {
      try {
        requestData = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      } catch (parseError) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: "Invalid JSON in request body",
            message: "Request body must be valid JSON"
          })
        };
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing request body",
          message: "Request body is required"
        })
      };
    }

    // ✅ Extract and validate parameters
    const {
      agentName,
      agentResourceRoleArn,
      foundationModel,
      instruction,
      description = `Agent created by Lambda: ${agentName}`,
      aliasName = "LIVE",
      aliasDescription = `Live alias for ${agentName}`
    } = requestData;

    // ✅ Validate required parameters
    const requiredParams = {
      agentName,
      agentResourceRoleArn,
      foundationModel,
      instruction
    };

    const missingParams = Object.entries(requiredParams)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingParams.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Missing required parameters: ${missingParams.join(", ")}`,
          required_parameters: Object.keys(requiredParams)
        })
      };
    }

    logger.info(`Creating agent with name: ${agentName}`);

    // ✅ Step 1: Create Agent
    const createAgentCommand = new CreateAgentCommand({
      agentName,
      agentResourceRoleArn,
      foundationModel,
      instruction,
      description,
      idleSessionTTLInSeconds: 1800, // 30 minutes session timeout
    });

    const createAgentResponse = await bedrockAgentClient.send(createAgentCommand);
    
    if (!createAgentResponse.agent) {
      throw new Error("Failed to create agent - no agent data returned");
    }

    const { agentId, agentArn } = createAgentResponse.agent;
    logger.info(`Agent created successfully. Agent ID: ${agentId}`);

    // ✅ Step 2: Wait for agent creation to complete
    logger.info(`Waiting for agent creation to complete: ${agentId}`);
    
    await waitForAgentStatus(bedrockAgentClient, agentId!, ["NOT_PREPARED", "PREPARED"], 180000, 5000);

    // ✅ Step 3: Prepare Agent
    logger.info(`Preparing agent: ${agentId}`);
    
    const prepareAgentCommand = new PrepareAgentCommand({ agentId: agentId! });
    await bedrockAgentClient.send(prepareAgentCommand);

    // ✅ Wait for agent to be prepared
    await waitForAgentStatus(bedrockAgentClient, agentId!, ["PREPARED"], 300000, 10000);

    // ✅ Step 4: Create Agent Alias
    logger.info(`Creating alias '${aliasName}' for agent: ${agentId}`);

    const createAliasCommand = new CreateAgentAliasCommand({
      agentAliasName: aliasName,
      agentId: agentId!,
      description: aliasDescription
    });

    const createAliasResponse = await bedrockAgentClient.send(createAliasCommand);
    
    if (!createAliasResponse.agentAlias) {
      throw new Error("Failed to create agent alias - no alias data returned");
    }

    const { agentAliasId, agentAliasArn } = createAliasResponse.agentAlias;
    logger.info(`Agent alias created successfully. Alias ID: ${agentAliasId}`);

    // ✅ Step 5: Get final agent and alias information
    const [finalAgentInfo, finalAliasInfo] = await Promise.all([
      bedrockAgentClient.send(new GetAgentCommand({ agentId: agentId! })),
      bedrockAgentClient.send(new GetAgentAliasCommand({ 
        agentId: agentId!, 
        agentAliasId: agentAliasId! 
      }))
    ]);

    // ✅ Prepare comprehensive response
    const responseData: AgentResponse = {
      success: true,
      message: "Agent and alias created successfully (NOT invoked)",
      agent: {
        agentId: agentId!,
        agentArn: agentArn!,
        agentName,
        agentStatus: finalAgentInfo.agent?.agentStatus || "UNKNOWN",
        description,
        foundationModel,
        instruction,
        agentResourceRoleArn,
        createdAt: finalAgentInfo.agent?.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: finalAgentInfo.agent?.updatedAt?.toISOString() || new Date().toISOString(),
        agentVersion: finalAgentInfo.agent?.agentVersion || "DRAFT",
        idleSessionTTLInSeconds: finalAgentInfo.agent?.idleSessionTTLInSeconds,
      },
      alias: {
        agentAliasId: agentAliasId!,
        agentAliasArn: agentAliasArn!,
        agentAliasName: aliasName,
        description: aliasDescription,
        agentAliasStatus: finalAliasInfo.agentAlias?.agentAliasStatus || "UNKNOWN",
        createdAt: finalAliasInfo.agentAlias?.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: finalAliasInfo.agentAlias?.updatedAt?.toISOString() || new Date().toISOString(),
        routingConfiguration: finalAliasInfo.agentAlias?.routingConfiguration || []
      },
      usage_instructions: {
        invoke_agent: {
          service: "bedrock-agent-runtime",
          operation: "invoke_agent",
          parameters: {
            agentId: agentId!,
            agentAliasId: agentAliasId!,
            sessionId: "unique-session-id",
            inputText: "Your question or prompt here"
          }
        },
        sample_code: `
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

// Create bedrock agent runtime client
const runtimeClient = new BedrockAgentRuntimeClient({ region: "us-east-1" });

// Invoke the agent
const command = new InvokeAgentCommand({
  agentId: "${agentId}",
  agentAliasId: "${agentAliasId}",
  sessionId: "your-unique-session-id",
  inputText: "Hello, how can you help me?"
});

const response = await runtimeClient.send(command);

// Process the response stream
if (response.completion) {
  for await (const event of response.completion) {
    if (event.chunk?.bytes) {
      const chunk = new TextDecoder().decode(event.chunk.bytes);
      console.log(chunk);
    }
  }
}
        `.trim()
      }
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(responseData, null, 2)
    };

  } catch (error: any) {
    logger.error("Error creating agent:", error);

    // ✅ Handle AWS SDK errors
    if (error.name === "ValidationException" || error.name === "InvalidParameterException") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `AWS API Error: ${error.name}`,
          message: error.message,
          details: error.toString()
        })
      };
    }

    // ✅ Handle other AWS errors
    if (error.$metadata) {
      return {
        statusCode: error.$metadata.httpStatusCode || 500,
        body: JSON.stringify({
          error: `AWS API Error: ${error.name || "Unknown"}`,
          message: error.message || "Unknown AWS error",
          details: error.toString()
        })
      };
    }

    // ✅ Handle generic errors
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message || "Unknown error occurred"
      })
    };
  }
};

// ✅ Helper function: Wait for agent status
async function waitForAgentStatus(
  client: BedrockAgentClient,
  agentId: string,
  targetStatuses: string[],
  maxWaitTime: number = 180000, // 3 minutes default
  checkInterval: number = 5000   // 5 seconds default
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const getAgentCommand = new GetAgentCommand({ agentId });
      const response = await client.send(getAgentCommand);
      
      const agentStatus = response.agent?.agentStatus;
      logger.info(`Current agent status: ${agentStatus}`);
      
      if (targetStatuses.includes(agentStatus || "")) {
        logger.info(`Agent reached target status: ${agentStatus}`);
        return;
      }
      
      if (agentStatus === "FAILED") {
        throw new Error("Agent creation/preparation failed");
      }
      
      await sleep(checkInterval);
      
    } catch (error: any) {
      if (error.name === "ResourceNotFoundException") {
        logger.info("Agent not found yet, continuing to wait...");
        await sleep(checkInterval);
        continue;
      }
      throw error;
    }
  }
  
  throw new Error(`Timeout waiting for agent to reach status: ${targetStatuses.join(" or ")}`);
}

// ✅ Helper function: Sleep
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ✅ Helper function: Create IAM role for agent
export async function createAgentRole(roleName: string, accountId: string): Promise<string> {
  const iamClient = new IAMClient({ region: process.env.AWS_REGION || "us-east-1" });
  
  const trustPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Service: "bedrock.amazonaws.com"
        },
        Action: "sts:AssumeRole"
      }
    ]
  };

  try {
    const createRoleCommand = new CreateRoleCommand({
      RoleName: roleName,
      AssumeRolePolicyDocument: JSON.stringify(trustPolicy),
      Description: "IAM role for Bedrock Agent"
    });

    const roleResponse = await iamClient.send(createRoleCommand);

    // Attach basic policies
    const attachPolicyCommand = new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: "arn:aws:iam::aws:policy/AmazonBedrockFullAccess"
    });

    await iamClient.send(attachPolicyCommand);

    return roleResponse.Role?.Arn || "";

  } catch (error: any) {
    if (error.name === "EntityAlreadyExistsException") {
      // Role already exists, get its ARN
      const getRoleCommand = new GetRoleCommand({ RoleName: roleName });
      const roleResponse = await iamClient.send(getRoleCommand);
      return roleResponse.Role?.Arn || "";
    }
    throw error;
  }
}