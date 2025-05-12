
import type { APIGatewayProxyHandler } from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { env } from "$amplify/env/signInWithRedirectGoogleFnc";


const cognito = new CognitoIdentityServiceProvider();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {

    const code = event.queryStringParameters?.code;

    // Tạo URL redirect đến Google OAuth
      const domain = env.COGNITO_DOMAIN;
      const clientId = env.USER_POOL_CLIENT_ID;
      const redirectUri = encodeURIComponent(env.CALLBACK_URL || '');

    if(!code) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Authorization code not provided",
                success: false
            })
        };
    }
    
    // Exchange code for tokens using {{cognito-host}}/oauth2/token endpoint
    const tokenEndpoint = `${domain}/oauth2/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', clientId);
    params.append('code', code);
    params.append('redirect_uri', decodeURIComponent(redirectUri));

    // Call the token endpoint
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString(),
    });

    const responseBody = await response.text();

    // Parse the response body error
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          message: "Failed to exchange authorization code for tokens",
          error: responseBody,
          success: false
        })
      };
    }

    // Parse the response body
    const tokenData = JSON.parse(responseBody);

    return {
      statusCode: 200,
      body: JSON.stringify({
        tokens: tokenData,
        success: true
      })
    };
  } catch (error : any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing Google authentication",
        error: error.message,
      }),
    };
  }
};
