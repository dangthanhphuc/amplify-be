import {SecretsManagerClient, GetSecretValueCommand} from "@aws-sdk/client-secrets-manager";

const region = "us-east-1"; 

const secretManagerClient = new SecretsManagerClient({ region });


export async function getSecret(secretName: string) {
  // Get secret
    const secretResponse = await secretManagerClient.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  // ARN hoặc $metadata tùy AWS SDK version
  return secretResponse;
}