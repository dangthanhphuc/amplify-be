import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createRestApiStack } from './stacks/rest-api-stack';
import { signUpPostMethodFnc } from './functions/auth/signup/resources';
import { signInPostMethodFnc } from './functions/auth/signin/resources';
import { confirmSignUpPostMethodFnc } from './functions/auth/confirmSignUp/resources';
import { signInWithRedirectGoogleFnc } from './functions/auth/signInWithRedirectGoogle/resources';
import { signInWithRedirectFacebookFnc } from './functions/auth/signInWithRedirectFacebook/resources';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { getTokenByCodeFnc } from './functions/auth/token/resources';
import { getAgentsFnc } from './functions/agents/get/resources';
import { initialDataForAiAgentFnc } from './functions/agents/initial-data/resources';
import { testFnc } from './functions/tests/resources';
import { chatWithAgentFnc } from './functions/agents/chatWithAgent/resources';
import { storageForProject } from './storage/resource';
import { getUserInfoFnc } from './functions/users/getUserInfo/resource';
import { updateUserFnc } from './functions/users/updateUser/resource';

// Define backend with Aurora RDS integration
export const backend = defineBackend({
  auth,
  data,
  storageForProject,
  signUpPostMethodFnc,
  signInPostMethodFnc,
  confirmSignUpPostMethodFnc,
  signInWithRedirectFacebookFnc,
  signInWithRedirectGoogleFnc,
  getTokenByCodeFnc,
  getAgentsFnc,
  initialDataForAiAgentFnc,
  chatWithAgentFnc,
  getUserInfoFnc,
  updateUserFnc,
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

backend.initialDataForAiAgentFnc.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'bedrock:ListAgents',
    'bedrock:GetAgent',
    'bedrock:ListAgentCategories',
    'bedrock:ListAgentAliases',
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

backend.updateUserFnc.resources.lambda.addToRolePolicy(new PolicyStatement({
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

backend.getAgentsFnc.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'rds-data:ExecuteStatement',
    'rds-data:BatchExecuteStatement',
    'rds-data:BeginTransaction',
    'rds-data:CommitTransaction',
    'rds-data:RollbackTransaction',
    'bedrock:ListAgents',
    'bedrock:GetAgent',
    'secretsmanager:GetSecretValue'
  ],
  resources: ["*"]
}));

backend.signUpPostMethodFnc.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'cognito-idp:AdminCreateUser',
    'cognito-idp:AdminSetUserPassword',
    'cognito-idp:AdminAddUserToGroup',
    'cognito-idp:AdminUpdateUserAttributes',
    'rds-data:ExecuteStatement',
    'rds-data:BatchExecuteStatement',
    'rds-data:BeginTransaction',
    'rds-data:CommitTransaction',
    'rds-data:RollbackTransaction',
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
    'bedrock:ListAgentCategories',
    'bedrock:ListAgentAliases',
    'bedrock:InvokeModel',
    'secretsmanager:GetSecretValue',
    'rds-data:BatchExecuteStatement'
  ],
  resources: ["*"]
}));

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