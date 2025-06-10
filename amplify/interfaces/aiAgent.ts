export interface AiAgent {
    id: string;
    agentVersions: AgentVersion[];
    name: string;
    status: string;
    description: string;
    lastVersion: string;
    knowledgeBaseUrl: string;
    likeCount: number;
    totalInteractions: number;
    creatorId: number | undefined;
    introduction: string | undefined;
    icon: string | undefined;
    foreword: string | undefined;
    sysPrompt: string | undefined;
    model: string | undefined;
    capabilities: string[];
    cost: number;
    suggestQuestions: string[];
}

export interface AgentVersion {
    agentId: string;
    versionValue: string;
    description?: string;
    createdAt: string;
    updateAt: string;
}