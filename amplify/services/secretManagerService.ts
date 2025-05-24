import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

  export async function getSecret(secretManagerClient : SecretsManagerClient, secretName: string) {
    // Get secret
    const secretResponse = await secretManagerClient.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );
    // ARN hoặc $metadata tùy AWS SDK version
    return secretResponse;
  }

