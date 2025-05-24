import type { APIGatewayProxyHandler } from 'aws-lambda';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { getBedrockAgentRuntimeClient } from '../../../utils/clients';
import { invokeAgentCommand } from '../../../services/bedrockService';


export const handler : APIGatewayProxyHandler = async (event) => {
    try {

        if (!event.body) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "No request body",
                }),
            };
        }

        console.log("Event: ", JSON.stringify(event));
        const requestBody = JSON.parse(event.body);
        const {prompt, agentId, agentAliasId, sessionId} = requestBody;

        console.log("Prompt: ", prompt);
        console.log("AgentId: ", agentId);
        console.log("AgentAliasId: ", agentAliasId);
        console.log("SessionId: ", sessionId);

        const bedrockAgentRuntime = getBedrockAgentRuntimeClient();
        const command = new InvokeAgentCommand({
            agentId: agentId,
            agentAliasId: agentAliasId,
            sessionId: sessionId,
            inputText: prompt,
            enableTrace: true
        });

        const response = await invokeAgentCommand(bedrockAgentRuntime, command, sessionId);
    
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Success",
                body: response
            }),
        }
    } catch (error: any) {
        console.error("Error log: ", error);
         return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Error",
                body: error
            }),
        }
    }
}
