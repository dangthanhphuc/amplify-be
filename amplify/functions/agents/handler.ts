
import type {APIGatewayProxyHandler} from 'aws-lambda';
// import { BedrockAgentClient, ListAgentsCommand } from "@aws-sdk/client-bedrock-agent";

// const bedrockClient = new BedrockAgentClient({
//     region: "us-east-1"
// });

export const handler : APIGatewayProxyHandler = async (event) => {
    
    // const input = {
    //     maxResults: Number(10),
    // };

    // const command = new ListAgentsCommand(input);
    // const response = await bedrockClient.send(command);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello from the API function!',
            body: "response"
        }),
    }
}