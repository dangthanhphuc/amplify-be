import type { APIGatewayProxyHandler } from "aws-lambda";
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { getBedrockAgentRuntimeClient } from "../../../utils/clients";

export const handler: APIGatewayProxyHandler = async (event) => {
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
  const { prompt, agentId, agentAliasId, sessionId } = requestBody;

  console.log("Prompt: ", prompt);
  console.log("AgentId: ", agentId);
  console.log("AgentAliasId: ", agentAliasId);
  console.log("SessionId: ", sessionId);

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
    });

    const response = await bedrockAgentRuntime.send(command);

    let completion = "";
    const traces: Record<string, string> = {};

    if (response.completion) {
      for await (const event of response.completion) {
        const chunk = event.chunk || {};

        if (chunk.bytes) {
          completion += new TextDecoder().decode(chunk.bytes);
        }

        const t = event.trace || {};
        if (t.trace) {
          traces[t.agentId || ""] = t.agentAliasId || "";
        }
      }
    }

    // const response = await invokeAgentCommand(bedrockAgentRuntime, command, sessionId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          "Cache-Control": "no-cache"
        },
        body: {
          response: completion,
          sessionId: sessionId,
          trace: traces,
        },
      }),
    };
  } catch (error: any) {
    console.error("Error log: ", error);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Error",
        body: error,
      }),
    };
  }
};

// export const handler : APIGatewayProxyHandler = async (event) => {
//     try {

//         if (!event.body) {
//             return {
//                 statusCode: 404,
//                 body: JSON.stringify({
//                     message: "No request body",
//                 }),
//             };
//         }

//         console.log("Event: ", JSON.stringify(event));
//         const requestBody = JSON.parse(event.body);
//         const {prompt, agentId, agentAliasId, sessionId} = requestBody;

//         console.log("Prompt: ", prompt);
//         console.log("AgentId: ", agentId);
//         console.log("AgentAliasId: ", agentAliasId);
//         console.log("SessionId: ", sessionId);

//         const bedrockAgentRuntime = getBedrockAgentRuntimeClient();
//         const command = new InvokeAgentCommand({
//             agentId: agentId,
//             agentAliasId: agentAliasId,
//             sessionId: sessionId,
//             inputText: prompt,
//             enableTrace: true
//         });

//         const response = await bedrockAgentRuntime.send(command);

//         let completion = "";
//         const chunks: string[] = [];
//         // const traces: Record<string, string> = {};
//         const traces: any[] = [];

//             if (response.completion) {
//                 for await (const event of response.completion) {

//                     if (event.chunk?.bytes) {
//                         const chunkText = new TextDecoder().decode(event.chunk.bytes);
//                         completion += chunkText;
//                         chunks.push(chunkText);
//                     }

//                     if (event.trace) {
//                         // traces[t.agentId || ""] = t.agentAliasId || "";
//                         traces.push({
//                             traceId: event.trace,
//                             agentId: event.trace.agentId,
//                             agentAliasId: event.trace.agentAliasId,
//                             sessionId: event.trace.sessionId,
//                             timestamp: new Date().toISOString()
//                         });
//                     }
//                 }
//             }

//         // const response = await invokeAgentCommand(bedrockAgentRuntime, command, sessionId);

//         return {
//             statusCode: 200,
//             body: JSON.stringify({
//                 message: "Success",
//                 body: {
//                     completion,
//                     chunks, // ✅ Trả về từng chunk để client có thể streaming
//                     sessionId,
//                     traces,
//                     totalChunks: chunks.length
//                 }
//             }),
//         }
//     } catch (error: any) {
//         console.error("Error log: ", error);
//          return {
//             statusCode: 200,
//             body: JSON.stringify({
//                 message: "Error",
//                 body: error
//             }),
//         }
//     }
// }
