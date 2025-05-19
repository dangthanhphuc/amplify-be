
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  MethodOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Stack } from "aws-cdk-lib";
import { createLambdaIntegrationResponse } from "../helper/lambdaResponse";
import { auth } from "../auth/resource";

/**
 * Creates and configures the REST API stack
 * @param backend The Amplify backend instance
 * @returns The created REST API and its outputs
 */
export function createRestApiStack(backend: any) {

    // create a new API stack
    const restApiStack = backend.createStack("rest-api-stack");

  // create a new REST API
  const restAPI = new RestApi(restApiStack, "RestApi", {
    restApiName: "AiAgentRestApi",
    deploy: true,
    deployOptions: {
      stageName: "dev",
    },
    defaultCorsPreflightOptions: {
      allowOrigins: Cors.ALL_ORIGINS, // Restrict this to domains you trust
      allowMethods: Cors.ALL_METHODS, // Specify only the methods you need to allow
      allowHeaders: Cors.DEFAULT_HEADERS, // Specify only the headers you need to allow
    },
    
  });

  // create a new Cognito User Pools authorizer
  const cognitoAuth = new CognitoUserPoolsAuthorizer(restApiStack, "CognitoAuth", {
    cognitoUserPools: [backend.auth.resources.userPool],
  });

  const lambdaForSignUp = new LambdaIntegration(
    backend.signUpPostMethodFnc.resources.lambda
  );

  const lambdaForSignIn = new LambdaIntegration(
    backend.signInPostMethodFnc.resources.lambda
  );
  const lambdaForConfirmSignUp = createLambdaIntegrationResponse(
    backend.confirmSignUpPostMethodFnc.resources.lambda
  );

  const lambdaForSignInWithRedirectGoogle = createLambdaIntegrationResponse(
    backend.signInWithRedirectGoogleFnc.resources.lambda
  );

  const lambdaForSignInWithRedirectFacebook = createLambdaIntegrationResponse(
    backend.signInWithRedirectFacebookFnc.resources.lambda
  );

  const lambdaForGetTokenByCode = createLambdaIntegrationResponse(
    backend.getTokenByCodeFnc.resources.lambda
  );

  const lambdaForGetAgents = createLambdaIntegrationResponse(
    backend.getAgentsFnc.resources.lambda
  )

  const methodOptionsForUsers : MethodOptions = {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuth,
    authorizationScopes: ["USERS"]
  };

  const methodOptionsForExperts : MethodOptions = {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuth,
    authorizationScopes: ["EXPERTS"]
  };

  const methodOptionsForAdmins : MethodOptions = {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuth,
    authorizationScopes: ["ADMINS"]
  };


  // Tạo auth resource
  const authResource = restAPI.root.addResource("auth");


  const signupResource = authResource.addResource("signup");
  signupResource.addMethod("POST", lambdaForSignUp);

  const signinResource = authResource.addResource("signin");
  signinResource.addMethod("POST", lambdaForSignIn);

  const confirmSignUpResource = authResource.addResource("confirm-signup");
  confirmSignUpResource.addMethod("POST", lambdaForConfirmSignUp);

  const signInWithRedirectGoogleResource = authResource.addResource("signInWithRedirectGoogle");
  signInWithRedirectGoogleResource.addMethod("GET", lambdaForSignInWithRedirectGoogle);

  const signInWithRedirectFacebookResource = authResource.addResource("signInWithRedirectFacebook");
  signInWithRedirectFacebookResource.addMethod("GET", lambdaForSignInWithRedirectFacebook);

  const getTokenByCodeResource = authResource.addResource("getTokenByCode");
  getTokenByCodeResource.addMethod("GET", lambdaForGetTokenByCode);

  // Tạo agents resource
  const agentsResource = restAPI.root.addResource("agents");
  agentsResource.addMethod("GET", lambdaForGetAgents);


  // Return the REST API and outputs for use in the main backend.ts file
  return {
    restAPI,
    outputs: {
      custom: {
        API: {
          [restAPI.restApiName]: {
            endpoint: restAPI.url, // The URL of the API Gateway for PRODUCTION warning
            region: Stack.of(restAPI).region,
            apiName: restAPI.restApiName,
          },
        },
      },
    }
  };
}

