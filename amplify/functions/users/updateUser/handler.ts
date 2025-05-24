import type {APIGatewayProxyHandler} from "aws-lambda";
import { getRdsClient, getSecretManagerClient } from "../../../utils/clients";
import { secret } from '@aws-amplify/backend';
import { getSecret } from "../../../services/secretManagerService";
import { updateUserInfoService } from "../../../services/userService";
import { env } from "$amplify/env/updateUserFnc";
import { ResponseObject } from "../../../utils/responseObject";

export const handler : APIGatewayProxyHandler = async (event) => {

    try {
        const { userId } = event.pathParameters || {};
        const requestBody = JSON.parse(event.body || "{}");
        if(!userId || !requestBody) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Missing userId or request body",
                }),
            };
        }

        const { name, displayName, profileImage, description } = requestBody;
        const rdsClient = getRdsClient();
        const secretManagerClient = getSecretManagerClient();
        const secret = await getSecret(secretManagerClient, "prod/RDS_SECRET_ARN");

        const sql = `
            UPDATE users
            SET name = '${name}', display_name = '${displayName}', profile_image = '${profileImage}', description = '${description}'
            WHERE id = '${userId}'
        `;

        const result = await updateUserInfoService(rdsClient, env.RDS_ARN ,String(secret.ARN), userId, sql);

        const responseObject : ResponseObject = {
            timeStamp: new Date(),
            statusCode: 200,
            message: "User info updated successfully",
            body: {
                data: result
            }
        }

        return responseObject;
    } catch (error: any) {
        console.error("Error updating user info:", error);
        const responseObject : ResponseObject = {
            timeStamp: new Date(),
            statusCode: 500,
            message: "Error updating user info",
            body: {
                error: error.message
            }
        }
        return responseObject;
    }

}