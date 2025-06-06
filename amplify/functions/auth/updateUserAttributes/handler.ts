import { APIGatewayProxyHandler } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import {env} from "$amplify/env/updateUserAttributesFnc"
import { getCognitoClient } from "../../../utils/clients";
import { AdminUpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";

export const handler : APIGatewayProxyHandler= async (event) => {

    const requestBody = JSON.parse(event.body || '{}');
    const { userId, name, displayName, description } = requestBody;

    if(!event.body || !userId ) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Body or attribute not provider"
            })
        }
    }

    // Clients
    const amplifyClient = await getAmplifyClient(env);
    const cognitoClient = getCognitoClient();

    try {

        // 1. Update user on cognito
        const userAttributes = [];
        
        if (name) {
            userAttributes.push({
                Name: "name",
                Value: name
            });
        }
        
        // Thêm các thuộc tính tùy chỉnh nếu cần
        if (displayName) {
            userAttributes.push({
                Name: "custom:display_name",
                Value: displayName
            });
        }
        
        if (description) {
            userAttributes.push({
                Name: "custom:desc",
                Value: description
            });
        }
        
        // Chỉ gọi API nếu có thuộc tính cần cập nhật
        if (userAttributes.length > 0) {
            await cognitoClient.send(new AdminUpdateUserAttributesCommand({
                UserPoolId: env.USER_POOL_ID,
                Username: userId,
                UserAttributes: userAttributes
            }));
            console.info("User attributes updated in Cognito");
        }

        // 2. Update user on rds
        await amplifyClient.models.Users.update({
            id: userId,
            name: name,
            display_name: displayName,
            description: description
        });
        console.info("User update successfully !");

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Update user attribute successfully!",
            }),
        }

    } catch (error) {
        console.log("Error update user attributes: ", error)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error update user attributes",
                error
            })
        }
    }
}