import { generateClient } from "aws-amplify/data";
import { Schema } from "../data/resource";
import { AgentAliasStatus, AgentAliasSummary, AgentSummary, BedrockAgentClient, ListAgentAliasesCommand, ListAgentAliasesCommandOutput, ListAgentAliasesResponse, ListAgentsCommand, ListAgentsCommandOutput } from "@aws-sdk/client-bedrock-agent";
import { AiAgent, AgentVersion } from "../interfaces/aiAgent";

const s = generateClient<Schema>();

interface AgentAliasBebrock {
  id: string;
  description: string;
  status: AgentAliasStatus;
  createdAt: string;
  updatedAt: string;
}

export async function syncDataFromBebrock(amplifyClient : any, aiAgentId: string, bedrockClient: BedrockAgentClient) {
  // Oldest data from rds
  const aiAgent = await amplifyClient.models.AiAgents.get({
    id: aiAgentId,
  }, {
    selectionSet: [
      "versions.*"
    ] as any
  });
  console.log("syncDataFromBebrock: aiAgent", JSON.stringify(aiAgent, null, 2));

  
  if(aiAgent.data.versions) {
    let resultAsync = [];
    // Newest data from Bedrock
    const newestDataFromBedrock = await listAgentAliasFormBebrock(bedrockClient, aiAgentId);
    for (const agentVersion of aiAgent.data.versions) {
      // Check exixsting
      let indexItem : number = -1;
      const exixsting = newestDataFromBedrock.find((item : AgentAliasBebrock, index: number) => {
        indexItem = index;
        return (item.id == agentVersion.version_value);
      }); 
      let result;
      if(exixsting) {
        // Update existing agent version
        result = await s.models.AgentVersion.update({
          ai_agent_id: aiAgentId,
          version_value: agentVersion.version_value,
          description: exixsting.description,
          status: exixsting.status,
          created_at: exixsting.createdAt,
          update_at: exixsting.updatedAt
        })
        console.log("syncDataFromBebrock: update existing agent version", result);
      } else {
        // Create new agent version
        result = await s.models.AgentVersion.create({
          ai_agent_id: aiAgentId,
          version_value: newestDataFromBedrock[indexItem].id,
          description: newestDataFromBedrock[indexItem].description,
          status: newestDataFromBedrock[indexItem].status,
          created_at: newestDataFromBedrock[indexItem].createdAt,
          update_at: newestDataFromBedrock[indexItem].updatedAt
        })
        console.log("syncDataFromBebrock: create new agent version", result);
      }
      resultAsync.push(result);
    }
    return resultAsync;
  } else {
    return "No agent versions found in aiAgent data.";
  }

}  

export async function listAgentAliasFormBebrock(bedrockClient : BedrockAgentClient ,aiAgentId : string) {
  
  // Variable
  const agentAliasBebrock : AgentAliasBebrock[] = [];
  let nextToken = undefined;
  let maxResults = 10;

  // 2. Get all agent aliases from aiAgentId Bedrock
  do {
  const agentAlias : ListAgentAliasesCommandOutput = await bedrockClient.send(new ListAgentAliasesCommand({
    maxResults,
    nextToken,
    agentId: aiAgentId
  }));
  if (agentAlias.agentAliasSummaries) 
    agentAliasBebrock.push(
      ...(agentAlias.agentAliasSummaries.map((alias : AgentAliasSummary) : AgentAliasBebrock=> ({
            id: alias.agentAliasId || "",
            description: alias.description || "",
            status: alias.agentAliasStatus || AgentAliasStatus.CREATING,
            createdAt: alias.createdAt ? alias.createdAt.toISOString().replace(/\.\d{3}Z$/, "") : new Date().toISOString().replace(/\.\d{3}Z$/, ""),
            updatedAt: alias.updatedAt ? alias.updatedAt.toISOString().replace(/\.\d{3}Z$/, "") : new Date().toISOString().replace(/\.\d{3}Z$/, "")
        })))
    );

  nextToken = agentAlias.nextToken;
  } while (nextToken != undefined);

  console.log("Bedrock response: agentAliasBebrock", agentAliasBebrock);
  return agentAliasBebrock;
}

// export async function synAllDataFromBebrock(amplifyClient : any, bebrockClient: BedrockAgentClient) {
//     const allAiAgents: AiAgent[] = await getAllAgentsAndConvertAiAgent(bebrockClient);

//     for (const aiAgent of allAiAgents) {
//         const existingAgent = await s.models.AiAgents.get({
//             id: aiAgent.id,
//         });
           
//         if (existingAgent.data) {
//           // Sync existing agent
//             const updateResult = await s.models.AiAgents.update({
//                 id: aiAgent.id,
//                 name: aiAgent.name,
//                 status: aiAgent.status,
//                 description: aiAgent.description,
//                 last_version: aiAgent.lastVersion,
//             },{
//               selectionSet: [
//                 "versions"
//               ] as any
//             }) as any;
//             console.log("Updated existing agent:", updateResult.data);
//             // Sync agent versions
//             // const updateAgentVersions = aiAgent.agentVersions.forEach(agentVersion => {
//             //   const syncAgentVersion = s.models.AgentVersion.update({ 

//             //   })
//             // });
//         }

//     }
// }

export async function getAllAgentsAndConvertAiAgent(
  bedrockClient: BedrockAgentClient,
): Promise<AiAgent[]> {
  const maxResults = 10;
  let nextToken = undefined;
  // 1. Get all agents from Bedrock
  const agentsBebrock: AgentSummary[] = [];
  do {
    const bedrockResponse: ListAgentsCommandOutput = await bedrockClient.send(
      new ListAgentsCommand({
        maxResults,
        nextToken,
      })
    );
    agentsBebrock.push(...(bedrockResponse.agentSummaries || []));
    nextToken = bedrockResponse.nextToken;
  } while (nextToken != null);
  console.log("Bedrock response: agentsBebrock", agentsBebrock);

  // 3. Proccess data for agents not saved yet
  const agentPromises = agentsBebrock.map(async (agent) => {
    const aiAgentAlias: AgentVersion[] = [];
    const agentId = agent.agentId;

    const maxTokenAlias = 10;
    let nextTokenAlias = undefined;

    // Get aliasIds on agentId
    do {
      const aiAgentAliasResponse: ListAgentAliasesResponse =
        await bedrockClient.send(
          new ListAgentAliasesCommand({
            maxResults: maxTokenAlias,
            nextToken: nextTokenAlias,
            agentId,
          })
        );
        if (aiAgentAliasResponse.agentAliasSummaries) 
          aiAgentAlias.push(
            ...(aiAgentAliasResponse.agentAliasSummaries.map(
              (alias) : AgentVersion => ({
                agentId: agentId  ?? "",
                versionValue: alias.agentAliasId || "",
                description: alias.description || "",
                createdAt : alias.createdAt ? alias.createdAt.toISOString().replace(/\.\d{3}Z$/, "") : new Date().toISOString().replace(/\.\d{3}Z$/, ""),
                updateAt: alias.updatedAt ? alias.updatedAt.toISOString().replace(/\.\d{3}Z$/, "") : new Date().toISOString().replace(/\.\d{3}Z$/, "")
              })
            ) ?? [])
          );
        else{
          console.warn(`No agentAliasSummaries found for agentId: ${agentId}`);
        }
      nextTokenAlias = aiAgentAliasResponse.nextToken;
    } while (nextTokenAlias != undefined);

    const aiAgent: AiAgent = {
      id: agentId || "",
      agentVersions: aiAgentAlias,
      name: agent.agentName || "",
      status: agent.agentStatus || "",
      description: agent.description || "",
      lastVersion: agent.latestAgentVersion || "",
      knowledgeBaseUrl: "",
      likeCount: 0,
      totalInteractions: 0,
      creatorId: 1,
      introduction:
        'Xin chào! Tôi là Agent sách "Heal Your Money Energy" của Ankur và Bell. Tôi có thể hỗ trợ bạn đọc cuốn sách này hiểu và chuyển đổi mối quan hệ của bạn với tiền bạc',
      icon: "public-images/ai.png",
      foreword: "",
      sysPrompt: "",
      model: "",
      capabilities: [],
      cost: 0,
      suggestQuestions: [
        "Cuốn sách này nói gì về mối quan hệ với tiền bạc?",
        "Làm sao để chữa lành năng lượng tiền bạc?",
        "Tác giả đưa ra phương pháp nào cụ thể?",
      ]
    };
    return aiAgent;
  });
  const newAgents = await Promise.all(agentPromises);

const aiAgents: AiAgent[] = [];
  aiAgents.push(...newAgents);

  return aiAgents;
}