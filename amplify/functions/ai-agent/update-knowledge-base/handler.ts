import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getBedrockClient } from "../../../utils/clients";
import { GetAgentCommand, GetKnowledgeBaseCommand, StartIngestionJobCommand } from "@aws-sdk/client-bedrock-agent";

export const handler : APIGatewayProxyHandlerV2 = async (event) => {

    const requestBody = JSON.parse(event.body || "{}");
    const {agentId, publishVersion} = requestBody;
    
    // Clients
    const bedrockAgentClient = getBedrockClient();

    try {
        
        // 1. Get agent existing
        const getAgentResponse = await bedrockAgentClient.send(new GetAgentCommand({
            agentId
        }));
        // const knowledgeBaseresponse = await bedrockAgentClient.send(new GetKnowledgeBaseCommand({

        // }))

        // const startIngestionJobResponse = await bedrockAgentClient.send(new StartIngestionJobCommand({
            
        // }));    

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "This function is deprecated. Please use the new updateKnowledgeBaseFnc function instead."
            })
        }

    } catch(error : any) {
        console.error("Error in updateKnowledgeBase handler:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error",
                error: error.message || "An unexpected error occurred"
            })
        };
    }
}