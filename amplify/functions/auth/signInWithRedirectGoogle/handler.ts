
import type { APIGatewayProxyHandler } from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { env } from "$amplify/env/signInWithRedirectGoogleFnc";

const cognito = new CognitoIdentityServiceProvider();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {

    const redirectUriParam = event.queryStringParameters?.redirectUri;
    const clientType = event.queryStringParameters?.clientType || 'web'; // 'web' hoặc 'mobile'

    // Tạo URL redirect đến Google OAuth
      const domain = env.COGNITO_DOMAIN;
      const clientId = env.USER_POOL_CLIENT_ID;
      const redirectUri = encodeURIComponent(redirectUriParam || '');

      const googleAuthUrl = `${domain}/oauth2/authorize?` +
      `identity_provider=Google&response_type=code&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}&scope=email+profile`;
    
      return {
        statusCode: clientType === 'mobile' ? 200 : 302, // Redirect
        headers: {
          'Location': googleAuthUrl,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        },
        body: ''
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
