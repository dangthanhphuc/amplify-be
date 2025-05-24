import type { APIGatewayProxyHandler } from "aws-lambda";
import { getUserInfo } from "../../../services/rdsService";
import { getRdsClient } from "../../../utils/clients";
import { env } from "$amplify/env/getUserInfoFnc";
import { ResponseObject } from "../../../utils/responseObject";


export const handler : APIGatewayProxyHandler= async (event) => {
    try {
        const userId = event.queryStringParameters?.userId; 
        if(!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Missing userId parameter",
                }),
            };
        }

        const rdsClient = getRdsClient();
        const result = await getUserInfo(rdsClient, userId, env.RDS_ARN, "prod/RDS_SECRET_ARN");

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User info retrieved successfully",
                data: result
            }),
        };
    } catch(error: any) {
        console.error("Error retrieving user info:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error retrieving user info",
                error: error.message,
            }),
        };
    }
    
}