
import type { APIGatewayProxyHandler } from "aws-lambda";
import { env } from "$amplify/env/signUpPostMethodFnc";
import { SignUpRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";
import { getCognitoClient } from "../../../utils/clients";
import { addUserToGroupService } from "../../../services/cognitoService";


export const handler: APIGatewayProxyHandler = async (event) => {
  try { 
    if (event.body == null) {
        return {
            statusCode: 404,
            body: JSON.stringify({  
                message: "No request body", 
            }),
        };
    }

    const cognitoClient = getCognitoClient();

    const requestBody = JSON.parse(event.body);
    const { email, password, name } = requestBody;

    const params : SignUpRequest = {
        ClientId: env.USER_POOL_CLIENT_ID,
        Username: email,  
        Password: password,
        UserAttributes: [
            {
                Name: "name",
                Value: name
            }
        ]
    };

    const result = await cognitoClient.signUp(params).promise();
    console.log("User signed up successfully:", result);

    // Add user to group
    const resultAddUserToGroup = await addUserToGroupService(cognitoClient, "USERS", env.USER_POOL_ID, email);
    console.log("User added to group successfully:", resultAddUserToGroup);

    return {
      statusCode: 200,
      body: JSON.stringify({
        result
      })
    };
  } catch (error : any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error signing up",
        error: error.message,
      }),
    };
  }
};
