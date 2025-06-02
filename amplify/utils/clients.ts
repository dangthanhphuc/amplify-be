import { BedrockAgentClient } from "@aws-sdk/client-bedrock-agent";
import { RDSDataClient } from "@aws-sdk/client-rds-data";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { S3Client } from "@aws-sdk/client-s3";

let bedrockClient: BedrockAgentClient | null = null;
let bedrockAgentRuntimeClient: BedrockAgentRuntimeClient | null = null;
let rdsClient: RDSDataClient | null = null;
let secretManagerClient: SecretsManagerClient | null = null;
let cognitoClient: CognitoIdentityProviderClient | null = null;
let s3Client: S3Client | null = null;

export function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({ region: "us-east-1" });
  }
  return s3Client;
}

export function getBedrockClient() {
  if (!bedrockClient) {
    bedrockClient = new BedrockAgentClient({ region: "us-east-1" });
  }
  return bedrockClient;
}

export function getBedrockAgentRuntimeClient() {
  if (!bedrockAgentRuntimeClient) {
    bedrockAgentRuntimeClient = new BedrockAgentRuntimeClient({
      region: "us-east-1",
    });
  }
  return bedrockAgentRuntimeClient;
}

export function getRdsClient() {
  if (!rdsClient) {
    rdsClient = new RDSDataClient({ region: "us-east-1" });
  }
  return rdsClient;
}

export function getSecretManagerClient() {
  if (!secretManagerClient) {
    secretManagerClient = new SecretsManagerClient({ region: "us-east-1" });
  }
  return secretManagerClient;
}

export function getCognitoClient() {
  if (!cognitoClient) {
    cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });
  }
  return cognitoClient;
}
