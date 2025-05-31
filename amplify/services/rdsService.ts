import {  ExecuteStatementCommand, RDSDataClient } from "@aws-sdk/client-rds-data";
import { User } from "../interfaces/user";
import bcrypt from "bcryptjs";
import { getSecret } from "./secretManagerService";
import { getSecretManagerClient } from "../utils/clients";
import { AiAgentResponse } from "../interfaces/response/aiAgentResponse";

export async function getUserInfo(rdsClient : RDSDataClient, userId: string, resourceArn: string, secretName: string) { 
    try {
        const sql = `
            SELECT * FROM users WHERE id = '${userId}'
        `;
        const secretManagerClient = getSecretManagerClient();
        const secret = await getSecret(secretManagerClient, secretName);
    
        const result = await rdsClient.send(new ExecuteStatementCommand({
            resourceArn: resourceArn,
            secretArn: String(secret.ARN),
            database: "ai_agent_system",
            sql
        }));

        return result;

    } catch (error) {
        console.error("Error retrieving user info:", error);
        throw error;
    }
}

export async function saveUserToRds(rdsClient : RDSDataClient, resourceArn: string, secretArn: string, user: User) {
    try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const sql = `
            INSERT INTO users (id, email, password, name, display_name, profile_image, description, role_id)
            VALUES ('${user.id}', '${user.email}', '${hashedPassword}', '${user.name}', '${user.displayName}', '${user.profileImage}', '${user.description}', ${user.roleId})
        `;
        const result = await rdsClient.send(new ExecuteStatementCommand({
            resourceArn: resourceArn,
            secretArn: secretArn,
            database: "ai_agent_system",
            sql
        }));
        
        return result;
    } catch (error) {
        console.error("Error saving user to RDS:", error);
        throw error;
    }
}


export async function getAllAiAgents(rdsClient: RDSDataClient, resourceArn: string, secretArn: string, rdsDatabase: string) {
    try {
        const command = new ExecuteStatementCommand({
            resourceArn: resourceArn,
            secretArn: secretArn,
            database: rdsDatabase,
            sql: `
                SELECT 
                    a.id,                    -- record[0]
                    a.name,                  -- record[1]  
                    a.icon,                  -- record[2]
                    a.introduction,          -- record[3]
                    a.description,           -- record[4]
                    a.foreword,              -- record[5]
                    a.last_version,          -- record[6]
                    a.status,                -- record[7]
                    a.like_count,            -- record[8]
                    a.total_interactions,    -- record[9]
                    a.creator_id,            -- record[10]
                    a.knowledge_base_url,    -- record[11]
                    a.sys_prompt,            -- record[12]
                    a.create_at,             -- record[13]
                    a.model,                 -- record[14]
                    a.capabilities,          -- record[15]
                    a.alias_ids,             -- record[16]
                    a.cost,                  -- record[17]
                    u.name as creator_name,  -- record[18]
                    a.suggested_questions, -- record[19]
                    JSON_ARRAYAGG(
                        CASE 
                            WHEN ac.name IS NOT NULL 
                            THEN JSON_OBJECT('id', ac.id, 'name', ac.name) 
                            ELSE NULL 
                        END
                    ) as categories          -- record[20]
                FROM ai_agents a
                LEFT JOIN ai_categories aic ON a.id = aic.ai_agent_id
                LEFT JOIN users u ON a.creator_id = u.id
                LEFT JOIN agent_categories ac ON aic.agent_category_id = ac.id
                GROUP BY a.id
                ORDER BY a.create_at DESC
            `
        });

        const result = await rdsClient.send(command);

        const aiAgentResponse : AiAgentResponse[]= result.records?.map(record => ({
            id: record[0]?.stringValue || '',                    // a.id
            name: record[1]?.stringValue || '',                  // a.name
            icon: record[2]?.stringValue || '',                  // a.icon
            introduction: record[3]?.stringValue || '',          // a.introduction
            description: record[4]?.stringValue || '',           // a.description
            foreword: record[5]?.stringValue || '',              // a.foreword
            lastVersion: record[6]?.stringValue || '',           // a.last_version
            status: record[7]?.stringValue || '',                // a.status
            likeCount: record[8]?.longValue || 0,                // a.like_count
            totalInteractions: record[9]?.longValue || 0,        // a.total_interactions
            creatorId: record[10]?.stringValue || '',            // a.creator_id
            knowledgeBaseUrl: record[11]?.stringValue || '',     // a.knowledge_base_url
            sysPrompt: record[12]?.stringValue || '',            // a.sys_prompt
            createAt: record[13]?.stringValue || '',             // a.create_at
            model: record[14]?.stringValue || '',                // a.model
            capabilities: record[15]?.stringValue ?             // a.capabilities
                JSON.parse(record[15].stringValue) : [], 
            aliasIds: record[16]?.stringValue ?                  // a.alias_ids
                JSON.parse(record[16].stringValue) : [],
            cost: record[17]?.doubleValue || 0,                  // a.cost
            creatorName: record[18]?.stringValue || '',          // u.name
            suggestedQuestions: record[19]?.stringValue ?        // a.suggested_questions
                JSON.parse(record[19].stringValue) : [],
            categories: record[20]?.stringValue ?                // JSON_ARRAYAGG(...)
                JSON.parse(record[20].stringValue).filter((cat: any) => cat !== null) : []
        })) || [];
        
        console.log("AI Agents fetched from RDS:", aiAgentResponse);

        return aiAgentResponse;

    } catch (error) {
        console.error("Error fetching AI agents:", error);
        throw error;
    }
}