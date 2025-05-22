import { ExecuteStatementCommand } from "@aws-sdk/client-rds-data";
import { secret } from "@aws-amplify/backend";
import { SignUpRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";

export enum UserGroup {
  ADMINS = "ADMINS",
  USERS = "USERS",
  EXPERTS = "EXPERTS",
}

export async function signupService(signupRes: SignUpRequest, group: UserGroup) {

}

export async function addUserToRds(user: { email: string, name: string }) {
  // const rdsArnSecret = secret("RDS_ARN");
  // const rdsDatabaseSecret = secret("RDS_DATABASE");
  // const rdsClient = getRdsClient();
  // const secretResponse = await getSecret("prod/RDS_SECRET_ARN");
  // if(!String(rdsArnSecret) || !String(rdsDatabaseSecret)) {
  //   throw new Error("RDS ARN or Database is not set");
  // }
  // const result = rdsClient.send(
  //   new ExecuteStatementCommand({
  //     resourceArn: String(rdsArnSecret),
  //     secretArn: secretResponse.ARN,
  //     database: String(rdsDatabaseSecret),
  //     includeResultMetadata: true,
  //     sql: ""
  // }));
}




