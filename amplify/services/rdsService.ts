import { BatchExecuteStatementCommand, ExecuteStatementCommand, RDSDataClient } from "@aws-sdk/client-rds-data";
import { User } from "../interfaces/user";
import bcrypt from "bcryptjs";

export class RDSService {
    private client : RDSDataClient;

    constructor(client: RDSDataClient) {
        this.client = client;
    }

    async batchExecuteStatementCommand(batchExecuteStatement : BatchExecuteStatementCommand) {
        return this.client.send(batchExecuteStatement);
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
            sql
        }))
        return result;
    } catch (error) {
        console.error("Error saving user to RDS:", error);
        throw error;
    }
}