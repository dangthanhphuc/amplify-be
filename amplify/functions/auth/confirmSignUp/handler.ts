import type { APIGatewayProxyHandler } from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { env } from "$amplify/env/confirmSignUpPostMethodFnc";

const cognito = new CognitoIdentityServiceProvider();

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

    const requestBody = JSON.parse(event.body);
    const { email, confirmationCode } = requestBody;

    const result = await cognito.confirmSignUp({
        ClientId: env.USER_POOL_CLIENT_ID,
        Username: email,
        ConfirmationCode: confirmationCode
      }).promise();
    return {
      statusCode: 200,
      body: "Confirm email signup successfully"
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
