import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/updateAiCategoryFnc";
import { getRdsClient, getSecretManagerClient } from "../../../utils/clients";
import { ExecuteStatementCommand } from "@aws-sdk/client-rds-data";
import { getSecret } from "../../../services/secretManagerService";
const { RDSDataService } = require('aws-sdk');

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
  const queryParams = event.queryStringParameters || {};
  const { updateAgentCategoryId, updateAiAgentId } = queryParams;
  
  const requestBody = JSON.parse(event.body || "{}");
  console.log("Received request body:", JSON.stringify(requestBody, null, 2));
  const { agentCategoryId, aiAgentId } = requestBody;

  if (!updateAgentCategoryId || !updateAiAgentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required query parameters: updateAgentCategoryId or updateAiAgentId",
      }),
    };
  }

  if (!agentCategoryId || !aiAgentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required field: agentCategoryId or aiAgentId",
      }),
    };
  }
  
  const amplifyClient = await getAmplifyClient(env);

  try {
    const existingCategory = await amplifyClient.models.AiCategories.get({
      agent_category_id: updateAgentCategoryId,
      ai_agent_id: updateAiAgentId,
    });

    if (!existingCategory.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "AI category not found for the given agent category and AI agent",
        }),
      };
    }

    // Check if the new agentCategoryId exists in AgentCategories table
    const existingAgentCategory = await amplifyClient.models.AgentCategories.get({
      id: agentCategoryId,
    });

    if (!existingAgentCategory.data) {
      return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Agent category not found",
      }),
      };
    }

    // Check if the new aiAgentId exists in AiAgents table
    const existingAiAgent = await amplifyClient.models.AiAgents.get({
      id: aiAgentId,
    });

    if (!existingAiAgent.data) {
      return {
      statusCode: 404,
      body: JSON.stringify({
        error: "AI agent not found",
      }),
      };
    }

    // Check if the new agentCategoryId and aiAgentId combination already exists
    const existingNewCategory = await amplifyClient.models.AiCategories.get({
      agent_category_id: agentCategoryId,
      ai_agent_id: aiAgentId,
    });

    if (existingNewCategory.data) {
      return {
      statusCode: 409,
      body: JSON.stringify({
        error: "AI category with the new agentCategoryId and aiAgentId combination already exists",
      }),
      };
    }

    // Update using RDS client
    const rdsClient = getRdsClient();
    const secretManageClient = getSecretManagerClient();
    const seccretValue = await getSecret(secretManageClient, "prod/RDS_SECRET_ARN");
    
    const updateParams = {
      resourceArn: env.RDS_ARN,
      secretArn: seccretValue.ARN,
      database: env.RDS_DATABASE,
      sql: `UPDATE AiCategories 
        SET agent_category_id = :newAgentCategoryId, 
          ai_agent_id = :newAiAgentId 
        WHERE agent_category_id = :oldAgentCategoryId 
        AND ai_agent_id = :oldAiAgentId`,
      parameters: [
      { name: 'newAgentCategoryId', value: { stringValue: agentCategoryId } },
      { name: 'newAiAgentId', value: { stringValue: aiAgentId } },
      { name: 'oldAgentCategoryId', value: { stringValue: updateAgentCategoryId } },
      { name: 'oldAiAgentId', value: { stringValue: updateAiAgentId } }
      ]
    };
    const aiCategoryUpdated = await rdsClient.send(new ExecuteStatementCommand(updateParams));

    // Check if the update was successful by checking the number of records affected
    if (aiCategoryUpdated.numberOfRecordsUpdated === 0) {
      console.error("AI category update failed - no records updated");
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "AI category not found or no changes made",
        }),
      };
    }

    // Fetch the updated record to return to client
    const fetchUpdatedRecord = await amplifyClient.models.AiCategories.get({
      agent_category_id: agentCategoryId,
      ai_agent_id: aiAgentId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "AI category updated successfully",
        data: fetchUpdatedRecord.data
      }),
    };
  } catch (error: any) {
    console.error("Error updating AI category:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
      }),
    };
  }
};
