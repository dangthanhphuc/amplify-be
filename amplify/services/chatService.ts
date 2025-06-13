import { getVietnamTimestamp } from "../utils/transform";

export interface Chat {
    aiAgentId: string;
    userId: string;
    createdby: "AI" | "USER";
    rawContent: string;
    createAt: Date;
}

export async function createChat(amplifyClient : any, chat : Chat) {
    const result = await amplifyClient.models.Chats.create({
        ai_agent_id: chat.aiAgentId,
        user_id: chat.userId,
        create_by: chat.createdby,
        raw_content: chat.rawContent,
        create_at: getVietnamTimestamp().toISOString()
    });
    return result;
}