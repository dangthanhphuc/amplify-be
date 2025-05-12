import type { APIGatewayProxyHandler } from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { env } from "$amplify/env/signInPostMethodFnc";

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
    const { email, password } = requestBody;

    const params = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: env.USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };
    const result = await cognito.initiateAuth(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        result,
      }),
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
