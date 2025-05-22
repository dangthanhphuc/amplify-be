import type { APIGatewayProxyHandler } from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { env } from "$amplify/env/confirmSignUpPostMethodFnc";
import { getCognitoClient } from "../../../utils/clients";


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
    const { email, confirmationCode } = requestBody;

    // Confirm signup for the user
    const result = await cognitoClient.confirmSignUp({
        ClientId: env.USER_POOL_CLIENT_ID,
        Username: email,
        ConfirmationCode: confirmationCode
      }).promise();

    // Add user to the USERS group
    await cognitoClient.adminAddUserToGroup({
      GroupName: "USERS",
      UserPoolId: env.USER_POOL_ID,
      Username: email,
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User confirmed successfully",
        result,
      })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error signing in",
        error: error.message,
      }),
    };
  }
};
