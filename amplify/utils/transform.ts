import {
  AgentSummary,
  ListAgentAliasesCommand,
  ListAgentAliasesResponse,
} from "@aws-sdk/client-bedrock-agent";
import { AiAgent, AgentVersion } from "../interfaces/aiAgent";
import { getBedrockClient } from "./clients";

// export async function transformAgentSummariesToModels(
//   agentSummaries: AgentSummary[]
// ) {
//   const aiAgents: AiAgent[] = [];
//   const bedrockClient = getBedrockClient();
//   const agentPromises = agentSummaries.map(async (agent) => {
//     const aiAgentAlias: AgentVersion[] = [];
//     const agentId = agent.agentId;
//     const maxTokenAlias = 10;
//     let nextTokenAlias = undefined;

//     // Get aliasIds on agentId
//     do {
//       const aiAgentAliasResponse: ListAgentAliasesResponse =
//         await bedrockClient.send(
//           new ListAgentAliasesCommand({
//             maxResults: maxTokenAlias,
//             nextToken: nextTokenAlias,
//             agentId,
//           })
//         );
//       if (aiAgentAliasResponse.agentAliasSummaries) 
//                 aiAgentAlias.push(
//                   ...(aiAgentAliasResponse.agentAliasSummaries.map(
//                     (alias) : AgentVersion => ({
//                       agentAliasId: alias.agentAliasId || "",
//                       updateAt: alias.updatedAt ? alias.updatedAt.toISOString().replace(/\.\d{3}Z$/, "") : new Date().toISOString().replace(/\.\d{3}Z$/, "")
//                     })
//                   ) ?? [])
//                 );
//               else{
//                 console.warn(`No agentAliasSummaries found for agentId: ${agentId}`);
//               }
//       nextTokenAlias = aiAgentAliasResponse.nextToken;
//     } while (nextTokenAlias != undefined);

//     // Chuyển đổi alias thành mảng string
//     const aiAgent: AiAgent = {
//       id: agent.agentId || "",
//       aliasIds: aiAgentAlias,
//       name: agent.agentName || "",
//       status: agent.agentStatus || "",
//       description: agent.description || "",
//       lastVersion: agent.latestAgentVersion || "",
//       knowledgeBaseUrl: "",
//       likeCount: 0,
//       totalInteractions: 0,
//       creatorId: 1,
//       introduction: "",
//       icon: "",
//       foreword: "",
//       sysPrompt: "",
//       createAt: new Date(),
//       model: "",
//       capabilities: [],
//       cost: 0,
//       suggestQuestions: [],
//     };
//     console.log("AI Agent:", aiAgent);
//     return aiAgent;
//   });
//   const newAgents = await Promise.all(agentPromises);
//   aiAgents.push(...newAgents);

//   return aiAgents;
// }

export function getVietnamTimestamp(timeAdd? : number) : Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const vietnamTime = new Date(utc + (7 * 3600000)); // UTC+7
  if (timeAdd) {
    vietnamTime.setTime(vietnamTime.getTime() + timeAdd);
  }
  return vietnamTime;
}