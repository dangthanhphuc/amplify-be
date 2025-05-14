
import type {APIGatewayProxyHandler} from 'aws-lambda';
import { BedrockAgentClient, ListAgentsCommand } from "@aws-sdk/client-bedrock-agent";
import {RDSDataClient, ExecuteStatementCommand, ColumnMetadata} from "@aws-sdk/client-rds-data";
import {SecretsManagerClient, GetSecretValueCommand} from "@aws-sdk/client-secrets-manager";
import {env} from "$amplify/env/getAgentsFnc";

const bedrockClient = new BedrockAgentClient({
    region: "us-east-1"
});

const secretName = "prod/RDS_SECRET_ARN";
const secretManagerClient = new SecretsManagerClient({
    region: "us-east-1"
});

const rdsClient = new RDSDataClient({
    region: "us-east-1"
});

interface DynamicObject {
    [key: string]: string | number | boolean | null;
}

export const handler : APIGatewayProxyHandler = async (event) => {
    try {
        // const input = {
        //     maxResults: Number(5), // tests
        // };
        //
        // const command = new ListAgentsCommand(input);

        // const response = await bedrockClient.send(command);

        const secretResponse = await secretManagerClient.send(
            new GetSecretValueCommand({
                SecretId: secretName
            })
        );

        console.log("resourceArn", env.RDS_ARN)
        console.log("Secret ARN:", secretResponse.ARN);
        console.log("Secret Value:", env.RDS_DATABASE);


        const result = rdsClient.send(new ExecuteStatementCommand({
            resourceArn: env.RDS_ARN,
            secretArn: secretResponse.ARN,
            sql: "SELECT * FROM agent_categories",
            database: env.RDS_DATABASE,
            includeResultMetadata: true
        }));

        const records = (await result).records || [];
        const columnMetadata = (await result).columnMetadata || [];

        const agentCategories = records.map(record => {
            const item : DynamicObject = {};
            columnMetadata.forEach((column : ColumnMetadata, index : number) => {
                const columnName = column.name || `column_${index}`;
                // Xử lý các loại dữ liệu khác nhau
                const value = record[index].stringValue !== undefined ? record[index].stringValue :
                              record[index].longValue !== undefined ? record[index].longValue :
                              record[index].booleanValue !== undefined ? record[index].booleanValue :
                              record[index].doubleValue !== undefined ? record[index].doubleValue :
                              null;
                item[columnName] = value;
            });
            return item;
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Hello from the API function!',
                body: agentCategories
            }),
        }
    } catch (error : any) {
        console.error("Error fetching agents:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error fetching agents',
                error: error,
            }),
        }
    }
    
    
}