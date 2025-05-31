export interface AiAgent {
    id: string;
    aliasIds: AliasIds[];
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
    createAt: Date;
    model: string | undefined;
    capabilities: string[];
    cost: number;
    suggestQuestions: string[];
}

export interface AliasIds {
    agentAliasId: string;
    updateAt: string;
}