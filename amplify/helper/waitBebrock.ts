// ===== HELPER FUNCTIONS =====

import { BedrockAgentClient, GetAgentAliasCommand, GetAgentCommand, GetDataSourceCommand, GetIngestionJobCommand, GetKnowledgeBaseCommand } from "@aws-sdk/client-bedrock-agent";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
};


/**
 * Generic function to wait for resource status
 */
export async function waitForResourceStatus<T>(
  resourceName: string,
  resourceId: string,
  getResourceFunction: () => Promise<T>,
  getStatusFunction: (resource: T) => string | undefined,
  targetStatuses: string[],
  maxWaitMs: number = 600000, // 10 minutes default
  waitInterval: number = 5000 // 5 seconds default
): Promise<string> {
  let elapsed = 0;

  logger.info(`⏳ Waiting for ${resourceName} ${resourceId} to reach status: ${targetStatuses.join(" or ")}`);

  while (elapsed < maxWaitMs) {
    try {
      const resource = await getResourceFunction();
      const status = getStatusFunction(resource);

      logger.info(`📋 ${resourceName} ${resourceId} status: ${status} (${Math.round(elapsed / 1000)}s elapsed)`);

      if (targetStatuses.includes(status || "")) {
        logger.info(`✅ ${resourceName} ${resourceId} reached target status: ${status}`);
        logger.info(`Waiting for ${resourceName} ${resourceId} to be ready successfully: `, JSON.stringify(resource, null, 2));
        return status || "";
      }

      if (status === "FAILED") {
        console.log("Reason for failure:", JSON.stringify(resource, null, 2));
        logger.error(`❌ ${resourceName} ${resourceId} failed with status: ${status}`);
        logger.error(`Waiting for ${resourceName} ${resourceId} to be ready failed: `, JSON.stringify(resource, null, 2));
        throw new Error(`❌ ${resourceName} ${resourceId} failed`);
      }

      await sleep(waitInterval);
      elapsed += waitInterval;

    } catch (error: any) {
      if (error.name === "ResourceNotFoundException") {
        logger.info(`🔍 ${resourceName} ${resourceId} not found yet, continuing to wait...`);
        await sleep(waitInterval);
        elapsed += waitInterval;
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `⏰ Timeout waiting for ${resourceName} ${resourceId} to reach status: ${targetStatuses.join(" or ")} (waited ${Math.round(maxWaitMs / 1000)}s)`
  );
}

/**
 * Sleep utility function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for Data Source status
 */
export async function waitForDataSourceStatus(
  client: BedrockAgentClient,
  knowledgeBaseId: string,
  dataSourceId: string,
  targetStatuses: string[],
  maxWaitMs: number = 300000 // 5 minutes
): Promise<string> {
  return waitForResourceStatus(
    "Data Source",
    dataSourceId,
    () => client.send(new GetDataSourceCommand({ knowledgeBaseId, dataSourceId })),
    (response) => response.dataSource?.status,
    targetStatuses,
    maxWaitMs
  );
}

/**
 * Wait for Ingestion Job status
 */
export async function waitForIngestionJobStatus(
  client: BedrockAgentClient,
  knowledgeBaseId: string,
  dataSourceId: string,
  ingestionJobId: string,
  targetStatuses: string[],
  maxWaitMs: number = 600000 // 10 minutes
): Promise<string> {
  return waitForResourceStatus(
    "Ingestion Job",
    ingestionJobId,
    () => client.send(new GetIngestionJobCommand({ 
      knowledgeBaseId, 
      dataSourceId, 
      ingestionJobId 
    })),
    (response) => response.ingestionJob?.status,
    targetStatuses,
    maxWaitMs,
    10000 // 10 seconds interval for ingestion jobs
  );
}

/**
 * Wait for Agent status
 */
export async function waitForAgentStatus(
  client: BedrockAgentClient,
  agentId: string,
  targetStatuses: string[],
  maxWaitMs: number = 600000
): Promise<string> {
  return waitForResourceStatus(
    "Agent",
    agentId,
    () => client.send(new GetAgentCommand({ agentId })),
    (response) => response.agent?.agentStatus,
    targetStatuses,
    maxWaitMs
  );
}

/**
 * Wait for Knowledge Base status
 */
export async function waitForKnowledgeBaseStatus(
  client: BedrockAgentClient,
  knowledgeBaseId: string,
  targetStatuses: string[],
  maxWaitMs: number = 600000
): Promise<string> {
  return waitForResourceStatus(
    "Knowledge Base",
    knowledgeBaseId,
    () => client.send(new GetKnowledgeBaseCommand({ knowledgeBaseId })),
    (response) => response.knowledgeBase?.status,
    targetStatuses,
    maxWaitMs
  );
}

/**
 * Wait for Agent Alias status
 */
export async function waitForAliasStatus(
  client: BedrockAgentClient,
  agentId: string,
  agentAliasId: string,
  targetStatuses: string[],
  maxWaitMs: number = 300000
): Promise<string> {
  return waitForResourceStatus(
    "Agent Alias",
    agentAliasId,
    () => client.send(new GetAgentAliasCommand({ agentId, agentAliasId })),
    (response) => response.agentAlias?.agentAliasStatus,
    targetStatuses,
    maxWaitMs
  );
}

/**
 * Validate required parameters
 */
export function validateRequiredParams(params: Record<string, any>, requiredFields: string[]) {
  const missing = requiredFields.filter(field => !params[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(", ")}`);
  }
}

/**
 * Create error response
 */
export function createErrorResponse(statusCode: number, error: string, message: string, additional?: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      error,
      message,
      timestamp: new Date().toISOString(),
      ...additional
    }),
  };
}

/**
 * Create success response
 */
export function createSuccessResponse(data: any) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      ...data
    }, null, 2),
  };
}