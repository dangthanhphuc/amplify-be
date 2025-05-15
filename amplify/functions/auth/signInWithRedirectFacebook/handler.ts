import type { APIGatewayProxyHandler } from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { env } from "$amplify/env/signInWithRedirectFacebookFnc";

const cognito = new CognitoIdentityServiceProvider();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {

    const redirectUriParam = event.queryStringParameters?.redirectUri;

    // Tạo URL redirect đến Facebook OAuth
    const domain = env.COGNITO_DOMAIN;
    const clientId = env.USER_POOL_CLIENT_ID;
    const redirectUri = encodeURIComponent(redirectUriParam || "");


      const facebookAuthUrl =
        `${domain}/oauth2/authorize?` +
        `identity_provider=Facebook&response_type=code&client_id=${clientId}` +
        `&redirect_uri=${redirectUri}&scope=email+profile`;

      return {
        statusCode: 302, 
        headers: {
          Location: facebookAuthUrl,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        body: "",
      };
    
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing Facebook authentication",
        error: error.message,
      }),
    };
  }
};
