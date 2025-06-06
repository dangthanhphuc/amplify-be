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
    restApiName: `AiAgentRestApi`,
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
  // const cognitoAuth = new CognitoUserPoolsAuthorizer(restApiStack, "CognitoAuth", {
  //   cognitoUserPools: [backend.auth.resources.userPool],
  // });

  const lambdaForGetAgents = createLambdaIntegrationResponse(
    backend.getAgentsFnc.resources.lambda
  )
  const lambdaForCreateAgent = createLambdaIntegrationResponse(backend.createAgentFnc.resources.lambda);
  const lamdbaForDeleteAgent = createLambdaIntegrationResponse(backend.deleteAgentFnc.resources.lambda);
  const lambdaForUpdateAgent = createLambdaIntegrationResponse(backend.updateAgentFnc.resources.lambda);

  const lambdaFordDataForAgents = createLambdaIntegrationResponse(
    backend.initialDataForAiAgentFnc.resources.lambda
  );

  const lambdaForGetUserInfo = createLambdaIntegrationResponse(
    backend.getUserInfoFnc.resources.lambda
  );
  const lambdaForUpdateUserAttributes = createLambdaIntegrationResponse(
    backend.updateUserAttributesFnc.resources.lambda
  );

  const lambdaForCreateAiReview = createLambdaIntegrationResponse(
    backend.createAiReviewFnc.resources.lambda
  );
  const lambdaForGetAiReview = createLambdaIntegrationResponse(
    backend.getAiReviewFnc.resources.lambda
  );
  const lambdaForListAiReviews = createLambdaIntegrationResponse(
    backend.listAiReviewsFnc.resources.lambda
  );
  const lambdaForUpdateAiReview = createLambdaIntegrationResponse(
    backend.updateAiReviewFnc.resources.lambda
  );
  const lambdaForDeleteAiReview = createLambdaIntegrationResponse(
    backend.deleteAiReviewFnc.resources.lambda
  );

  const lambdaForCreateUserLike = createLambdaIntegrationResponse(
    backend.createUserLikeFnc.resources.lambda
  );
  const lambdaForListUserLikes = createLambdaIntegrationResponse(
    backend.listUserLikesFnc.resources.lambda
  );
  const lambdaForUpdateUserLike = createLambdaIntegrationResponse(
    backend.updateUserLikeFnc.resources.lambda
  );
  const lambdaForDeleteUserLike = createLambdaIntegrationResponse(
    backend.deleteUserLikeFnc.resources.lambda
  );

   const lambdaForCreateReportCategory = createLambdaIntegrationResponse(
    backend.createReportCategoryFnc.resources.lambda
  );
  const lambdaForGetReportCategory = createLambdaIntegrationResponse(
    backend.getReportCategoryFnc.resources.lambda
  );
  const lambdaForListReportCategory = createLambdaIntegrationResponse(
    backend.listReportCategoriesFnc.resources.lambda
  );
  const lambdaForUpdateReportCategory = createLambdaIntegrationResponse(
    backend.updateReportCategoryFnc.resources.lambda
  );
  const lambdaForDeleteReportCategory = createLambdaIntegrationResponse(
    backend.deleteReportCategoryFnc.resources.lambda
  );

  const lambdaForCreateAgentCategory = createLambdaIntegrationResponse(
    backend.createAgentCategoryFnc.resources.lambda
  );
  const lambdaForGetAgentCategory = createLambdaIntegrationResponse(
    backend.getAgentCategoryFnc.resources.lambda
  );
  const lambdaForListAgentCategories = createLambdaIntegrationResponse(
    backend.listAgentCategoriesFnc.resources.lambda
  );
  const lambdaForUpdateAgentCategory = createLambdaIntegrationResponse(
    backend.updateAgentCategoryFnc.resources.lambda
  );
  const lambdaForDeleteAgentCategory = createLambdaIntegrationResponse(
    backend.deleteAgentCategoryFnc.resources.lambda
  );

  
  // AI Categories
  const lambdaForListAiCategories = createLambdaIntegrationResponse(
    backend.listAiCategoriesFnc.resources.lambda
  );
  const lambdaForCreateAiCategory = createLambdaIntegrationResponse(
    backend.createAiCategoryFnc.resources.lambda
  );
  const lambdaForUpdateAiCategory = createLambdaIntegrationResponse(
    backend.updateAiCategoryFnc.resources.lambda
  );
  const lambdaForDeleteAiCategory = createLambdaIntegrationResponse(
    backend.deleteAiCategoryFnc.resources.lambda
  );

  // const methodOptionsForUsers : MethodOptions = {
  //   authorizationType: AuthorizationType.COGNITO,
  //   authorizer: cognitoAuth,
  //   authorizationScopes: ["USERS"]
  // };

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
  agentsResource.addMethod("POST", lambdaForCreateAgent);
  const agentByIdResource = agentsResource.addResource("{agentId}");
  agentByIdResource.addMethod("DELETE", lamdbaForDeleteAgent);
  agentByIdResource.addMethod("PUT", lambdaForUpdateAgent);

  // User resource
  const userResource = restAPI.root.addResource("users");
  const userByIdResource = userResource.addResource("{userId}");
  userByIdResource.addMethod("GET", lambdaForGetUserInfo);
  userResource.addMethod("PUT", lambdaForUpdateUserAttributes);

  // Add source for db
  const dataForAgents = restAPI.root.addResource("dataForAgents");
  dataForAgents.addMethod("GET", lambdaFordDataForAgents)

  // AI Reviews resource
  const aiReviewsResource = restAPI.root.addResource("ai-reviews");
  aiReviewsResource.addMethod("POST", lambdaForCreateAiReview);
  aiReviewsResource.addMethod("GET", lambdaForListAiReviews);
  
  const aiReviewByIdResource = aiReviewsResource.addResource("{reviewId}");
  aiReviewByIdResource.addMethod("GET", lambdaForGetAiReview);
  aiReviewByIdResource.addMethod("PUT", lambdaForUpdateAiReview);
  aiReviewByIdResource.addMethod("DELETE", lambdaForDeleteAiReview);

  // User Likes resource
  const userLikesResource = restAPI.root.addResource("user-likes");
  userLikesResource.addMethod("POST", lambdaForCreateUserLike);
  userLikesResource.addMethod("GET", lambdaForListUserLikes);
  userLikesResource.addMethod("PUT", lambdaForUpdateUserLike);
  userLikesResource.addMethod("DELETE", lambdaForDeleteUserLike);

  // Report Categories resource
  const reportCategoriesResource = restAPI.root.addResource("report-categories");
  reportCategoriesResource.addMethod("POST", lambdaForCreateReportCategory);
  reportCategoriesResource.addMethod("GET", lambdaForListReportCategory);

  const reportCategoryByIdResource = reportCategoriesResource.addResource("{categoryId}");
  reportCategoryByIdResource.addMethod("GET", lambdaForGetReportCategory);
  reportCategoryByIdResource.addMethod("PUT", lambdaForUpdateReportCategory);
  reportCategoryByIdResource.addMethod("DELETE", lambdaForDeleteReportCategory);

  // Agent Categories resource
  const agentCategoriesResource = restAPI.root.addResource("agent-categories");
  agentCategoriesResource.addMethod("POST", lambdaForCreateAgentCategory);
  agentCategoriesResource.addMethod("GET", lambdaForListAgentCategories);
  const agentCategoryByIdResource = agentCategoriesResource.addResource("{categoryId}");
  agentCategoryByIdResource.addMethod("GET", lambdaForGetAgentCategory);
  agentCategoryByIdResource.addMethod("PUT", lambdaForUpdateAgentCategory);
  agentCategoryByIdResource.addMethod("DELETE", lambdaForDeleteAgentCategory);

  // AI Categories resource
  const aiCategoriesResource = restAPI.root.addResource("ai-categories");
  aiCategoriesResource.addMethod("POST", lambdaForCreateAiCategory);
  aiCategoriesResource.addMethod("GET", lambdaForListAiCategories);
  aiCategoriesResource.addMethod("DELETE", lambdaForDeleteAiCategory);
  aiCategoriesResource.addMethod("PUT", lambdaForUpdateAiCategory);

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

