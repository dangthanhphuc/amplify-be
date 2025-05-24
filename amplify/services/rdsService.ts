import {  ExecuteStatementCommand, RDSDataClient } from "@aws-sdk/client-rds-data";
import { User } from "../interfaces/user";
import bcrypt from "bcryptjs";
import { secret } from '@aws-amplify/backend';
import { getSecret } from "./secretManagerService";
import { getSecretManagerClient } from "../utils/clients";
import { ResponseObject } from "../utils/responseObject";

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