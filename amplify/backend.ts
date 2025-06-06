import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createRestApiStack } from './stacks/rest-api-stack';

import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { storageForProject } from './storage/resource';
import { getUserInfoFnc } from './functions/users/getUserInfo/resource';
import {CfnBucket, EventType} from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { postConfirmationFnc } from './functions/auth/postConfirmation/resources';
import { updateUserAttributesFnc } from './functions/auth/updateUserAttributes/resources';
import { onUploadS3Fnc } from './functions/s3/onUpload/resources';
import { createAiReviewFnc } from './functions/ai-reviews/create/resources';
import { getAiReviewFnc } from './functions/ai-reviews/get/resources';
import { listAiReviewsFnc } from './functions/ai-reviews/list/resources';
import { updateAiReviewFnc } from './functions/ai-reviews/update/resources';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { FunctionUrlAuthType, HttpMethod, InvokeMode } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { deleteAiReviewFnc } from './functions/ai-reviews/delete/resources';
import { createUserLikeFnc } from './functions/user-like/create/resources';
import { deleteUserLikeFnc } from './functions/user-like/delete/resources';
import { updateUserLikeFnc } from './functions/user-like/update/resources';
import { listUserLikesFnc } from './functions/user-like/list/resources';
import { getReportCategoryFnc } from './functions/report-category/get/resources';
import { listReportCategoriesFnc } from './functions/report-category/list/resources';
import { createReportCategoryFnc } from './functions/report-category/create/resources';
import { updateReportCategoryFnc } from './functions/report-category/update/resources';
import { deleteReportCategoryFnc } from './functions/report-category/delete/resources';
import { getAgentCategoryFnc } from './functions/agent-category/get/resources';
import { createAgentCategoryFnc } from './functions/agent-category/create/resources';
import { deleteAgentCategoryFnc } from './functions/agent-category/delete/resources';
import { listAgentCategoriesFnc } from './functions/agent-category/list/resources';
import { updateAgentCategoryFnc } from './functions/agent-category/update/resources';
import { testFnc } from './functions/tests/resources';
import { getAgentsFnc } from './functions/ai-agents/get/resources';
import { initialDataForAiAgentFnc } from './functions/ai-agents/initial-data/resources';
import { chatWithAgentFnc } from './functions/ai-agents/chatWithAgent/resources';
import { createAgentFnc } from './functions/ai-agents/create/resources';
import { deleteAgentFnc } from './functions/ai-agents/delete/resources';
import { updateAgentFnc } from './functions/ai-agents/update/resources';


// Tạo __dirname cho ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define backend with Aurora RDS integration
export const backend = defineBackend({
  auth,
  data,
  storageForProject,
  onUploadS3Fnc,

  getUserInfoFnc,
  updateUserAttributesFnc,
  postConfirmationFnc,

  getAgentsFnc,
  createAgentFnc,
  updateAgentFnc,
  deleteAgentFnc,
  initialDataForAiAgentFnc,
  chatWithAgentFnc,

  createAiReviewFnc,
  getAiReviewFnc,
  listAiReviewsFnc,
  updateAiReviewFnc,
  deleteAiReviewFnc,

  createUserLikeFnc,
  listUserLikesFnc,
  // getUserLikeFnc,
  updateUserLikeFnc,
  deleteUserLikeFnc,

  // Report Category
  getReportCategoryFnc,
  listReportCategoriesFnc,
  createReportCategoryFnc,
  updateReportCategoryFnc,
  deleteReportCategoryFnc,

  // Agent Categories
  getAgentCategoryFnc,
  listAgentCategoriesFnc,
  createAgentCategoryFnc,
  updateAgentCategoryFnc,
  deleteAgentCategoryFnc,

  testFnc
});

// Create REST API stack
const { outputs: restApiOutputs } = createRestApiStack(backend);

// Configure OAuth settings for the User Pool Client
const { cfnResources } = backend.auth.resources;
if (cfnResources.cfnUserPoolClient) {
  cfnResources.cfnUserPoolClient.allowedOAuthFlows = ['code']; 
  cfnResources.cfnUserPoolClient.allowedOAuthFlowsUserPoolClient = true;
  cfnResources.cfnUserPoolClient.allowedOAuthScopes = ['email', 'openid', 'profile'];

  cfnResources.cfnUserPoolClient.explicitAuthFlows = [
    'ALLOW_USER_PASSWORD_AUTH',
    'ALLOW_REFRESH_TOKEN_AUTH',
    'ALLOW_USER_SRP_AUTH',
    'ALLOW_CUSTOM_AUTH'
  ];
}

const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 8,
    requireLowercase: false,
    requireNumbers: false,
    requireSymbols: false,
    requireUppercase: false
  },
};


const s3Bucket = backend.storageForProject.resources.bucket;
const cfnBucket = s3Bucket.node.defaultChild as CfnBucket;
cfnBucket.accelerateConfiguration = {
  accelerationStatus: "Enabled" // 'Suspended' if you want to disable transfer acceleration
}

// Initial file for s3 
new BucketDeployment(backend.storageForProject.stack, "BucketDeployment", {
  sources: [Source.asset(path.join(__dirname, 'storage/public-images'))],
  destinationBucket: s3Bucket,
  destinationKeyPrefix: 'public-images/', // optional prefix in the bucket
});

backend.storageForProject.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED,
  new LambdaDestination(backend.onUploadS3Fnc.resources.lambda),
  {
    prefix: 'profile-pictures/',  // prefix for profile pictures
  }
)

backend.onUploadS3Fnc.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    's3:GetObject',
    's3:PutObject',
    's3:DeleteObject',
    's3:ListBucket',
    's3:GetBucketLocation'
  ],
  resources: [`*`]
}));

backend.createAgentFnc.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'rds-data:ExecuteStatement',
    'rds-data:BatchExecuteStatement',
    'rds-data:BeginTransaction',
    'rds-data:CommitTransaction',
    'secretsmanager:GetSecretValue'
  ],
  resources: ["*"]
}))

backend.initialDataForAiAgentFnc.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'bedrock:ListAgents',
    'bedrock:GetAgent',
    'bedrock:ListAgentCategories',
    'bedrock:ListAgentAliases',
    'rds-data:ExecuteStatement',
    'rds-data:BatchExecuteStatement',
    'rds-data:BeginTransaction',
    'rds-data:CommitTransaction',
    'secretsmanager:GetSecretValue',
    'rds-data:BatchExecuteStatement'
  ],
  resources: ["*"]
}));

backend.getUserInfoFnc.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'rds-data:ExecuteStatement',
    'rds-data:BatchExecuteStatement',
    'rds-data:BeginTransaction',
    'rds-data:CommitTransaction',
    'rds-data:RollbackTransaction',
    'secretsmanager:GetSecretValue'
  ],
  resources: ["*"]
}));

backend.updateUserAttributesFnc.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'cognito-idp:AdminUpdateUserAttributes'
  ],
  resources: ["*"]
}));

backend.getAgentsFnc.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'rds-data:ExecuteStatement',
    'rds-data:BatchExecuteStatement',
    'rds-data:BeginTransaction',
    'rds-data:CommitTransaction',
    'rds-data:RollbackTransaction',
    'bedrock:ListAgents',
    'bedrock:ListAgentAliases',
    'bedrock:GetAgent',
    'secretsmanager:GetSecretValue'
  ],
  resources: ["*"]
}));

backend.chatWithAgentFnc.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'bedrock:ListAgents',
    'bedrock:GetAgent',
    'bedrock:InvokeAgent',
    'bedrock:RetrieveAndGenerate',
    'bedrock:ListAgentCategories',
    'bedrock:ListAgentAliases',
    'bedrock:InvokeModel',
    'bedrock:InvokeModelWithResponseStream',
    'bedrock:RetrieveAndGenerate',
    'secretsmanager:GetSecretValue',
    'rds-data:BatchExecuteStatement'
  ],
  resources: ["*"]
}));

backend.chatWithAgentFnc.resources.lambda.addFunctionUrl({
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: [HttpMethod.POST, HttpMethod.GET],
    allowedHeaders: [
      'Content-Type',
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-Response-Time', 
      'X-Total-Tokens',
      'X-Session-ID',
    ],
    allowCredentials: false, 
    maxAge: Duration.seconds(86400)
  },
  authType: FunctionUrlAuthType.NONE,
  invokeMode: InvokeMode.RESPONSE_STREAM,
});

backend.testFnc.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    "*"
  ],
  resources: ["*"]
}));

// Add outputs from stacks to configuration
backend.addOutput(restApiOutputs);
// backend.addOutput(auroraOutputs);