import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/chatWithAgentFnc"; 
import { Chat, createChat } from "../../../services/chatService";
import { getVietnamTimestamp } from "../../../utils/transform";

export const handler = awslambda.streamifyResponse(async (event, responseStream) => {
  console.log("Full event:", JSON.stringify(event));

  responseStream = awslambda.HttpResponseStream.from(responseStream, {
      statusCode: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Transfer-Encoding": "chunked",
        Connection: "keep-alive",
        "Cache-Control": "no-cache"
      }
  });
  
  if (!event.body) {
    responseStream.write(JSON.stringify({ error: "No request body" }));
    responseStream.end();
    return;
  }

  const requestBody = JSON.parse(event.body);
  const { userId, prompt, agentId, agentAliasId, sessionId } = requestBody;

  try {
    const bedrockAgentRuntime = new BedrockAgentRuntimeClient({
      region: "us-east-1",
    });

    const command = new InvokeAgentCommand({
      agentId: agentId,
      agentAliasId: agentAliasId,
      sessionId: sessionId,
      inputText: prompt,
      enableTrace: true,
      streamingConfigurations: {
        streamFinalResponse: true,
        applyGuardrailInterval: 1
      }
    });

    const response = await bedrockAgentRuntime.send(command);

    let completion = "";
    const traces: any[] = [];
    const chunks: string[] = [];

    if (response.completion) {
      for await (const event of response.completion) {
        // Collect agent output
        if ('chunk' in event && event.chunk) {
          const chunk = event.chunk;
          if (chunk.bytes) {
            const decoder = new TextDecoder();
            const chunkText = decoder.decode(chunk.bytes);
            completion += chunkText;
            chunks.push(chunkText);
           responseStream.write(chunkText);
            // responseStream.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
            // console.log("Chunk text: ", chunkText);
          }
        }
      }

      // ✅ Save chat to database after streaming complete
      try {
        const amplifyClient = await getAmplifyClient(env);
        const chatByUser : Chat = {
          aiAgentId: agentId,
          userId: userId,
          createdby: "USER",
          rawContent: prompt,
          createAt: getVietnamTimestamp()
        }
        const resultByAi = await createChat(amplifyClient, chatByUser);
         const chatByAi : Chat = {
          aiAgentId: agentId,
          userId: userId,
          createdby: "AI",
          rawContent: completion,
          createAt: getVietnamTimestamp()
        }
        const resultByUser = await createChat(amplifyClient, chatByAi);
        console.log("Chat user saved successfully:", resultByUser);
        console.log("Chat ai saved successfully:", resultByUser);
        
      } catch (dbError) {
        console.error("Failed to save chat to database:", dbError);
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
          "Cache-Control": "no-cache"
        }
    });  
    responseStream.write(JSON.stringify({error: error.message}));
    responseStream.end();
    return ;
  }
});
