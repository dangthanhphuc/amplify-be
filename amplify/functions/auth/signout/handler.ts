import type { APIGatewayProxyHandler } from "aws-lambda";
import { getCognitoClient } from "../../../utils/clients";
import { signoutService } from "../../../services/cognitoService";

export const handler : APIGatewayProxyHandler = async (event) => {
    try {
        const accessToken = event.queryStringParameters?.accessToken;
        if (!accessToken) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Missing accessToken parameter",
                }),
            };
        }

        const cognitoClient = getCognitoClient();
        await signoutService(cognitoClient, "accessToken");

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Signout function executed successfully"
            })
        }
    } catch (error : any) { 
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error",
                error: error.message
            })
        }
    }
}
