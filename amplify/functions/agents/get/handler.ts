
import type {APIGatewayProxyHandler} from 'aws-lambda';
import { BedrockAgentClient } from "@aws-sdk/client-bedrock-agent";
import { ExecuteStatementCommand, ColumnMetadata} from "@aws-sdk/client-rds-data";
import {env} from "$amplify/env/getAgentsFnc";
import { rdsClient } from '../../../utils/rdsClient';
import { getSecret } from '../../../utils/secretManager';
import { getBedrockAgents } from '../../../utils/bedrockClient';

const bedrockClient = new BedrockAgentClient({
    region: "us-east-1"
});

interface DynamicObject {
    [key: string]: string | number | boolean | null;
}

export const handler : APIGatewayProxyHandler = async (event) => {
    try {

        // 1. Lấy danh sách agents từ Bedrock (Chưa xử lý nextToken)
        const maxResults = event.queryStringParameters?.maxResults;
        const nextToken = event.queryStringParameters?.nextToken;
        if (!maxResults) 
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing maxResults parameter',
                }),
            };
        const bedrockResponse = await getBedrockAgents(Number(maxResults), nextToken);

        // 2. Lấy secret để truy cập RDS
        const secretResponse = await getSecret("prod/RDS_SECRET_ARN");
        

        // 3. Lưu từng agent vào RDS (giả sử bảng agents có cột id, name, description)
        // const result = rdsClient.send(new ExecuteStatementCommand({
        //     resourceArn: env.RDS_ARN,
        //     secretArn: secretResponse.ARN,
        //     database: env.RDS_DATABASE,
        //     includeResultMetadata: true,
        //     sql: `
        //         INSERT INTO agents (id, name, description)
        //         VALUES (:id, :name, :desc)
        //         ON DUPLICATE KEY UPDATE name = :name, description = :desc
        //     `,
        //     parameters: [
        //         { name: "id", value: { stringValue:  "" } },
        //         { name: "name", value: { stringValue: "" } },
        //         { name: "desc", value: { stringValue:  "" } }
        //     ]
        // }));
        const result = rdsClient.send(new ExecuteStatementCommand({
            resourceArn: env.RDS_ARN,
            secretArn: secretResponse.ARN,
            database: env.RDS_DATABASE,
            includeResultMetadata: true,
            sql: `
                SELECT * FROM agent_categories
            `,
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
                body: {
                    agentCategories: agentCategories,
                    value: records // Test
                }
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