export enum Type {
    ADMIN = 'ADMIN',
    EXPERT = 'EXPERT',
    OUTSIDE = 'OUTSIDE'
}

// ✅ Corrected AgentAliasStatus enum
export enum AgentAliasStatus {
    CREATING = 'CREATING',
    PREPARED = 'PREPARED', 
    FAILED = 'FAILED',
    UPDATING = 'UPDATING',
    DELETING = 'DELETING',
    DISSOCIATED = 'DISSOCIATED'
}

// ✅ Additional related enums
export enum AgentStatus {
    CREATING = 'CREATING',
    PREPARING = 'PREPARING',
    PREPARED = 'PREPARED',
    NOT_PREPARED = 'NOT_PREPARED',
    DELETING = 'DELETING',
    FAILED = 'FAILED',
    VERSIONING = 'VERSIONING',
    UPDATING = 'UPDATING'
}

export enum FoundationModel {
    CLAUDE_3_SONNET = 'anthropic.claude-3-sonnet-20240229-v1:0',
    CLAUDE_3_HAIKU = 'anthropic.claude-3-haiku-20240307-v1:0',
    CLAUDE_V2_1 = 'anthropic.claude-v2:1',
    CLAUDE_V2 = 'anthropic.claude-v2',
    CLAUDE_INSTANT = 'anthropic.claude-instant-v1',
    TITAN_TEXT_EXPRESS = 'amazon.titan-text-express-v1',
    TITAN_TEXT_LITE = 'amazon.titan-text-lite-v1'
}