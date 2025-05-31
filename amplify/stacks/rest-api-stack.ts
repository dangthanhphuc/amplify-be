
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

  const lambdaForGetAgents = createLambdaIntegrationResponse(
    backend.getAgentsFnc.resources.lambda
  )

  const lambdaFordDataForAgents = createLambdaIntegrationResponse(
    backend.initialDataForAiAgentFnc.resources.lambda
  );

  const lambdaForChatWithAgent = new LambdaIntegration(
    backend.chatWithAgentFnc.resources.lambda
  );

  const lambdaForGetUserInfo = createLambdaIntegrationResponse(
    backend.getUserInfoFnc.resources.lambda
  );

  const lambdaForUpdateUser = createLambdaIntegrationResponse(
    backend.updateUserFnc.resources.lambda
  );

  const methodOptionsForUsers : MethodOptions = {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuth,
    authorizationScopes: ["USERS"]
  };

  // const methodOptionsForExperts : MethodOptions = {
  //   authorizationType: AuthorizationType.COGNITO,
  //   authorizer: cognitoAuth,
  //   authorizationScopes: ["EXPERTS"]
  // };

  // const methodOptionsForAdmins : MethodOptions = {
  //   authorizationType: AuthorizationType.COGNITO,
  //   authorizer: cognitoAuth,
  //   authorizationScopes: ["ADMINS"]
  // };]


  // Tạo auth resource
  // const authResource = restAPI.root.addResource("auth");

  // Tạo agents resource
  const agentsResource = restAPI.root.addResource("agents");
  agentsResource.addMethod("GET", lambdaForGetAgents);
  const agentChatResource = agentsResource.addResource("chat");
  agentChatResource.addMethod("POST", lambdaForChatWithAgent);

  // User resource
  const userResource = restAPI.root.addResource("users");
  userResource.addMethod("GET", lambdaForGetUserInfo);
  userResource.addMethod("PUT", lambdaForUpdateUser, methodOptionsForUsers);


  // Add source for db
  const dataForAgents = restAPI.root.addResource("dataForAgents");
  dataForAgents.addMethod("GET", lambdaFordDataForAgents)
  // Test resource
  const testResource = restAPI.root.addResource("test");
  const testFnc = new LambdaIntegration(backend.testFnc.resources.lambda);
  testResource.addMethod("POST", testFnc);

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

