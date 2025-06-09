
export interface AgentVersionDTO {
  aiAgentId: string;
  versionValue: string;
  description?: string;
}

export async function existAgentVersion(
  amplifyClient: any,
  aiAgentId: string,
  versionValue: string
) {
  const result = await amplifyClient.models.AgentVersion.get({
    ai_agent_id: aiAgentId,
    version_value: versionValue,
  });
  console.log("existAgentVersion result:", result);
  if (!result || !result.data) {
    return false;
  }
  return true;
}

export async function listAgentVersion(
  amplifyClient: any,
  aiAgentId?: string,
  versionValue?: string,
  limit: number = 20,
  nextToken?: string
) {
  let result;
  if (aiAgentId) {
    // ✅ Filter by ai_agent_id
    const query = `
      query ListAgentVersionsByAgentId($aiAgentId: String!, $limit: Int, $nextToken: String) {
        listAgentVersions(
          filter: { ai_agent_id: { eq: $aiAgentId } }
          limit: $limit
          nextToken: $nextToken
        ) {
          items {
            ai_agent_id
            version_value
            description
            update_at
          }
          nextToken
        }
      }
    `;

    const variables = {
      aiAgentId: aiAgentId,
      limit: limit,
      nextToken: nextToken || null
    };
    
    result = await amplifyClient.graphql({
      query,
      variables
    });
    console.log("listAgentVersion result aiaAgentId:", result);
  } else if (versionValue) {
    // ✅ Filter by version_value
    const query = `
      query ListAgentVersionsByVersionValue($versionValue: String!, $limit: Int, $nextToken: String) {
        listAgentVersions(
          filter: { version_value: { eq: $versionValue } }
          limit: $limit
          nextToken: $nextToken
        ) {
          items {
            ai_agent_id
            version_value
            description
            update_at
          }
          nextToken
        }
      }
    `;
    const variables = {
      versionValue: versionValue,
      limit: limit,
      nextToken: nextToken || null
    };
    
    result = await amplifyClient.graphql({
      query,
      variables
    });
  } else {
    // ✅ List all agent versions
    const query = `
      query ListAllAgentVersions($limit: Int, $nextToken: String) {
        listAgentVersions(limit: $limit, nextToken: $nextToken) {
          items {
            ai_agent_id
            version_value
            description
            update_at
          }
          nextToken
        }
      }
    `;
    const variables = {
      limit: limit,
      nextToken: nextToken || null
    };
    
    result = await amplifyClient.graphql({
      query,
      variables
    });
  }
  result = {
      data: result.data?.listAgentVersions?.items || [],
      nextToken: result.data?.listAgentVersions?.nextToken || null,
      errors: result.errors || null
    };
  return result;
}

export async function createAgentVersion(
  amplifyClient: any,
  agentVersion: AgentVersionDTO
) {
  const isExist = await existAgentVersion(
    amplifyClient,
    agentVersion.aiAgentId,
    agentVersion.versionValue
  );
  if(isExist) {
    throw new Error(
      `Agent version with value ${agentVersion.versionValue} and agent ${agentVersion.aiAgentId} already exists.`
    );
  }

  const result = await amplifyClient.models.AgentVersion.create({
    ai_agent_id: agentVersion.aiAgentId,
    version_value: agentVersion.versionValue,
    description: agentVersion.description ?? "",
  });
  return result;
}

export async function updateAgentVersion(
  amplifyClient: any,
  agentVersion: AgentVersionDTO
) {
  const isExist = await existAgentVersion(
    amplifyClient,
    agentVersion.aiAgentId,
    agentVersion.versionValue
  );
  if(!isExist) {
    throw new Error(
      `Agent version with value ${agentVersion.versionValue} and agent ${agentVersion.aiAgentId} not exists.`
    );
  }

  const updateData: any = {
    ai_agent_id: agentVersion.aiAgentId,
    version_value: agentVersion.versionValue,
  };
  if (agentVersion.description) {
    updateData.description = agentVersion.description;
  }
  const result = await amplifyClient.models.AgentVersion.update(updateData);
  return result;
}

export async function deleteAgentVersion(
  amplifyClient: any,
  agentVersion: AgentVersionDTO
) {
  const isExist = await existAgentVersion(
    amplifyClient,
    agentVersion.aiAgentId,
    agentVersion.versionValue
  );
   if(!isExist) {
    throw new Error(
      `Agent version with value ${agentVersion.versionValue} and agent ${agentVersion.aiAgentId} not exists.`
    );
  }

  const result = await amplifyClient.models.AgentVersion.delete({
    ai_agent_id: agentVersion.aiAgentId,
    version_value: agentVersion.versionValue,
  });
  return result;
}
