import { ExecuteStatementCommand, RDSDataClient } from "@aws-sdk/client-rds-data";
import { SignUpRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";

export enum UserGroup {
  ADMINS = "ADMINS",
  USERS = "USERS",
  EXPERTS = "EXPERTS",
}

export async function signupService(signupRes: SignUpRequest, group: UserGroup) {

}

export async function updateUserInfoService(rdsClient : RDSDataClient, resourceArn: string, secretArn: string, userId: string, sql : string) {
  const result = await rdsClient.send(new ExecuteStatementCommand({
    resourceArn: resourceArn, 
    secretArn: secretArn,
    database: "ai_agent_system",
    sql
  }));

  return result;
}




