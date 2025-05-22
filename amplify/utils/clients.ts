import { BedrockAgentClient } from "@aws-sdk/client-bedrock-agent";
import { RDSDataClient } from "@aws-sdk/client-rds-data";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { CognitoIdentityServiceProvider } from "aws-sdk";


let bedrockClient: BedrockAgentClient | null = null;
let rdsClient: RDSDataClient | null = null;
let secretManagerClient: SecretsManagerClient | null = null;
let cognitoClient : CognitoIdentityServiceProvider | null = null;

export function getBedrockClient() {
  if (!bedrockClient) {
    bedrockClient = new BedrockAgentClient({ region: "us-east-1" });
  }
  return bedrockClient;
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
        cognitoClient = new CognitoIdentityServiceProvider({ region: "us-east-1" });
    }
    return cognitoClient;
}