export interface Category {
    id: number;
    name: string;
}

export interface AiAgentResponse {
    id: string;
    name: string;
    icon: string;
    introduction: string;
    description: string;
    foreword: string;
    lastVersion: string;
    status: string;
    likeCount: number;
    totalInteractions: number;
    creatorId: string;
    knowledgeBaseUrl: string;
    sysPrompt: string;
    createAt: string;
    model: string;
    capabilities: any; // hoặc string[] nếu biết chính xác type
    suggestedQuestions: string;
    aliasIds: string;     
    cost: number;
    creatorName: string;
    categories: Category[];
}