
import type { APIGatewayProxyHandler } from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { env } from "$amplify/env/signUpPostMethodFnc";
import { RDSDataClient } from "@aws-sdk/client-rds-data";

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
    const { email, password, name } = requestBody;

    const params = {
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

    const result = await cognito.signUp(params).promise();

    return {
      statusCode: 200,
      // headers: {
      //   "Access-Control-Allow-Origin": "*",  // Hoặc "http://localhost:3000" để an toàn hơn
      //   "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key",
      //   "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
      // },
      body: JSON.stringify({
        result
      })
    };
  } catch (error : any) {
    return {
      statusCode: 500,
      // headers: {
      //   "Access-Control-Allow-Origin": "*",  // Hoặc "http://localhost:3000" để an toàn hơn
      //   "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key",
      //   "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
      // },
      body: JSON.stringify({
        message: "Error signing up",
        error: error.message,
      }),
    };
  }
};
