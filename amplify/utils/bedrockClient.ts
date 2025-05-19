import { BedrockAgentClient, ListAgentsCommand } from "@aws-sdk/client-bedrock-agent";

const region = "us-east-1";

const bedrockClient = new BedrockAgentClient({
    region
});

export async function getBedrockAgents(maxResults: number, nextToken: string | undefined) {
    const bedrockResponse = await bedrockClient.send(
        new ListAgentsCommand({
            maxResults,
            nextToken
        })
    );

    return bedrockResponse;
}
