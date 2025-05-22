import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export class SecretManagerService {
  private client: SecretsManagerClient;

  constructor(client: SecretsManagerClient) {
    this.client = client;
  }

  async getSecret(secretName: string) {
    // Get secret
    const secretResponse = await this.client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );
    // ARN hoặc $metadata tùy AWS SDK version
    return secretResponse;
  }
}
