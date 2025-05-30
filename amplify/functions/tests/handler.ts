import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";

export const handler = awslambda.streamifyResponse(async (event, responseStream) => {
  try {
    const bedrockRuntimeClient = new BedrockRuntimeClient({
      region: "us-east-1",
    });

    const requestBody = JSON.parse(event.body);
    const { prompt, agentId, agentAliasId, sessionId } = requestBody;

    const payload = {
  inputText: prompt,
  textGenerationConfig: {
    maxTokenCount: 1024,
    temperature: 0.7,
    topP: 0.9
  }
};

    const command = new InvokeModelWithResponseStreamCommand({
      modelId: "amazon.titan-text-express-v1",
      contentType: "application/json",
      body: JSON.stringify(payload)
    })
        
    const response = await bedrockRuntimeClient.send(command);

    let completion = "";
    const traces: any[] = [];
    const chunks: string[] = [];

    responseStream = awslambda.HttpResponseStream.from(responseStream, {
      statusCode: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Transfer-Encoding": "chunked",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });

    if(response.body){
      for await (const chunk of response.body) {
       const parsed = JSON.parse(new TextDecoder().decode(chunk.chunk?.bytes));
       if(parsed.type === "content_block_delta") {
        responseStream.write(parsed.delta.text);
       }
      }
      responseStream.end();
    }

    return;
  } catch (error: any) {
    console.error("Error log: ", error);
    responseStream = awslambda.HttpResponseStream.from(responseStream, {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
            "Cache-Control": "no-cache"
        }
    });  
    responseStream.write(JSON.stringify({error: error.message}));
    responseStream.end();
    return ;
  }
});
